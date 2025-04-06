/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * 
 * Acest modul coordonează comunicarea între:
 * - Interfața utilizator (UI)
 * - WebSocket Worker (canal de comunicare cu backend-ul)
 * - Middleware pentru procesarea și rutarea mesajelor
 * 
 * Fluxul de date:
 * 1. UI trimite mesaj text către chatActions (handleChatMessage)
 * 2. chatActions formatează și trimite mesajul către WebSocketWorker
 * 3. WebSocketWorker primește răspunsul și îl trimite înapoi la middleware
 * 4. Middleware-ul procesează mesajul și actualizează store-urile specifice
 */

import { useChatStore } from "../store/chatStore";
import useMiddlewareStore from "../store/middleware";
import { 
  initializeWorker, 
  getWorker
} from './socket/worker';
import { 
  OUTGOING_MESSAGE_TYPES, 
  AUTOMATION_ACTIONS, 
  RESERVATION_ACTIONS 
} from './types'; // Importăm constantele necesare

/**
 * Inițializează sistemul de chat și configurează handlerii de mesaje
 * 
 * Această funcție:
 * 1. Conectează la serverul WebSocket prin intermediul unui worker
 * 2. Configurează handler-ul pentru mesajele primite
 * 3. Direcționează mesajele către middleware-ul central
 * 
 * @returns {Promise<void>}
 */
export const initializeChat = async () => {
  console.group("🚀 [CHAT_ACTIONS] Initializing chat system");
  
  const worker = await initializeWorker();
  
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Failed to initialize chat");
    console.groupEnd();
    return;
  }

  // Configurăm handler-ul pentru mesajele primite de la worker
  worker.onmessage = (event) => {
    if (!event || !event.data) {
      console.error("❌ [CHAT_ACTIONS] Invalid event received from worker");
      return;
    }
    
    // Middleware-ul procesează răspunsul parsat conform README
    useMiddlewareStore.getState().processMessage(event); // Presupunem că middleware parsează și validează event.data
  };
  
  console.log("✅ [CHAT_ACTIONS] Chat system initialized successfully");
  console.groupEnd();
};

/**
 * Trimite un mesaj de chat standard către server
 */
export const handleChatMessage = async (message) => {
  console.group("🚀 [CHAT_ACTIONS] Sending chat message");
  console.log("Message content:", message);
  
  const { addMessage } = useChatStore.getState();
  // Adăugăm mesajul utilizatorului în UI
  addMessage({ text: message, type: "user" }); 

  // Obținem worker-ul sau încercăm să-l inițializăm dacă nu există
  let worker = getWorker();
  if (!worker) {
    console.log("[CHAT_ACTIONS] Worker not available, attempting to initialize...");
    worker = await initializeWorker();
     if (!worker) {
       console.error("❌ [CHAT_ACTIONS] Failed to initialize worker for sending message.");
       addMessage({
         type: "error",
         text: "Sorry, cannot connect to the server. Please try again later.",
       });
       console.groupEnd();
       return;
     }
  }

  try {
    // Formatăm mesajul conform structurii din README pentru "Incoming Messages"
    // (Client -> Server)
    const formattedMessage = {
      type: OUTGOING_MESSAGE_TYPES.CHAT_MESSAGE, // Folosim constanta din types.js
      content: message
    };
    
    console.log("Sending formatted message to worker:", formattedMessage);
    // Utilizăm middleware pentru a trimite obiectul JSON formatat
    const success = useMiddlewareStore.getState().sendMessage(formattedMessage, worker); 
    
    if (!success) {
      // Middleware ar trebui să gestioneze logica de eroare/reconectare intern
      // Aici doar logăm eșecul trimiterii inițiale
      throw new Error("Failed to send message via middleware/worker."); 
    }
    
    console.log("Message sent successfully via middleware");
  } catch (error) {
    console.error("❌ [CHAT_ACTIONS] Error sending chat message:", error);
    addMessage({
      type: "error",
      text: "Sorry, there was an error sending your message. Please try again.",
    });
    // Nu mai facem reconnect aici, lăsăm middleware/worker să gestioneze
    // console.log("Trying to reconnect in 5 seconds...");
    // setTimeout(initializeChat, 5000); 
  }
  
  console.groupEnd();
};

/**
 * Trimite o acțiune de automatizare către server
 * 
 * @param {keyof AUTOMATION_ACTIONS} actionType - Tipul acțiunii (ex: AUTOMATION_ACTIONS.BOOKING_EMAIL)
 * @param {Object} [data={}] - Date suplimentare pentru acțiune
 * @returns {boolean} true dacă acțiunea a fost trimisă cu succes către middleware, false în caz contrar
 */
export const sendAutomationAction = (actionType, data = {}) => {
  console.group("🚀 [CHAT_ACTIONS] Sending automation action");
  console.log(`Action: ${actionType}, Data:`, data);

  // Validăm tipul acțiunii folosind constantele importate
  if (!Object.values(AUTOMATION_ACTIONS).includes(actionType)) {
      console.error(`❌ [CHAT_ACTIONS] Invalid automation action type: ${actionType}`);
      console.groupEnd();
      return false;
  }

  const worker = getWorker();
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Worker not available for automation action");
    // Poate adăugăm un mesaj în UI
     useChatStore.getState().addMessage({ type: 'error', text: 'Cannot perform automation action. Connection issue?' });
    console.groupEnd();
    return false;
  }

  try {
      // Formatăm mesajul pentru acțiunea de automatizare.
      // Structura exactă depinde de cum așteaptă backend-ul/middleware-ul.
      // Presupunem o structură generică { type, action, data }
      const formattedMessage = {
          type: 'automation', // Un tip generic sau specific, de confirmat cu backend/middleware
          action: actionType,
          data: data 
      };

      console.log("Sending formatted automation action:", formattedMessage);
      const success = useMiddlewareStore.getState().sendMessage(formattedMessage, worker);

      if (!success) {
          throw new Error("Failed to send automation action via middleware/worker.");
      }

      console.log("Automation action sent successfully to middleware");
      console.groupEnd();
      return true; // Indică succesul trimiterii către middleware

  } catch (error) {
      console.error(`❌ [CHAT_ACTIONS] Error sending automation action ${actionType}:`, error);
      // Adăugăm un mesaj de eroare în UI
      useChatStore.getState().addMessage({ type: 'error', text: `Failed to perform action: ${actionType}` });
      console.groupEnd();
      return false; // Indică eșecul trimiterii
  }
};

/**
 * Trimite o acțiune de rezervare către server
 * 
 * @param {keyof RESERVATION_ACTIONS} actionType - Tipul acțiunii (ex: RESERVATION_ACTIONS.CREATE)
 * @param {Object} data - Datele necesare pentru acțiune (ex: detalii rezervare)
 * @returns {boolean} true dacă acțiunea a fost trimisă cu succes către middleware, false în caz contrar
 */
export const sendReservationAction = (actionType, data) => {
  console.group("🚀 [CHAT_ACTIONS] Sending reservation action");
  console.log(`Action: ${actionType}, Data:`, data);

  // Validăm tipul acțiunii folosind constantele importate
  if (!Object.values(RESERVATION_ACTIONS).includes(actionType)) {
      console.error(`❌ [CHAT_ACTIONS] Invalid reservation action type: ${actionType}`);
      console.groupEnd();
      return false;
  }

  const worker = getWorker();
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Worker not available for reservation action");
    // Poate adăugăm un mesaj în UI
    useChatStore.getState().addMessage({ type: 'error', text: 'Cannot perform reservation action. Connection issue?' });
    console.groupEnd();
    return false;
  }

  try {
    // Formatăm mesajul conform structurii din README pentru "Reservations"
    // (Presupunând că acesta este formatul așteptat de backend/middleware pentru trimitere)
    const formattedMessage = {
      type: 'reservations', // Tipul principal conform README
      action: actionType,   // Acțiunea specifică (create, update, delete etc.)
      data: data            // Datele relevante (pot include ID, detalii rezervare etc.)
    };

    console.log("Sending formatted reservation action:", formattedMessage);
    const success = useMiddlewareStore.getState().sendMessage(formattedMessage, worker);

    if (!success) {
      throw new Error("Failed to send reservation action via middleware/worker.");
    }

    console.log("Reservation action sent successfully to middleware");
    console.groupEnd();
    return true; // Indică succesul trimiterii către middleware

  } catch (error) {
    console.error(`❌ [CHAT_ACTIONS] Error sending reservation action ${actionType}:`, error);
     // Adăugăm un mesaj de eroare în UI
     useChatStore.getState().addMessage({ type: 'error', text: `Failed to perform reservation action: ${actionType}` });
    console.groupEnd();
    return false; // Indică eșecul trimiterii
  }
};