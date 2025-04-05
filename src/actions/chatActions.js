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
    
    // Procesăm mesajul prin middleware
    useMiddlewareStore.getState().processMessage(event);
  };
  
  console.log("✅ [CHAT_ACTIONS] Chat system initialized successfully");
  console.groupEnd();
};

/**
 * Procesează și trimite un mesaj de chat către server
 * 
 * Această funcție:
 * 1. Adaugă mesajul utilizatorului în UI
 * 2. Formatează mesajul conform protocolului backend-ului
 * 3. Trimite mesajul către server prin WebSocket Worker
 * 
 * @param {string} message - Mesajul de trimis
 * @returns {Promise<void>}
 */
export const handleChatMessage = async (message) => {
  console.group("🚀 [CHAT_ACTIONS] Sending chat message");
  console.log("Message to send:", message);
  
  const { addMessage } = useChatStore.getState();
  // Adăugăm mesajul utilizatorului în UI
  addMessage({ text: message, type: "user" });

  // Obținem worker-ul sau îl creăm
  let worker = getWorker();
  
  if (!worker) {
    console.log("[CHAT_ACTIONS] Worker doesn't exist, trying to connect...");
    worker = await initializeWorker();
  }

  try {
    console.log("Sending message to worker...");
    
    // Formatăm mesajul conform protocolului backend
    const formattedMessage = {
      type: "CHAT_MESSAGE",
      content: message
    };
    
    // Utilizăm middleware pentru a trimite mesajul
    const result = useMiddlewareStore.getState().sendMessage(formattedMessage, worker);
    
    if (!result) {
      throw new Error("Web Worker is not available");
    }
    
    console.log("Message sent successfully");
  } catch (error) {
    console.error("❌ [CHAT_ACTIONS] Error sending message:", error);
    addMessage({
      type: "error",
      text: "Sorry, there was an error communicating with the server. Please try again.",
    });
    
    console.log("Trying to reconnect in 5 seconds...");
    setTimeout(initializeChat, 5000);
  }
  
  console.groupEnd();
};

/**
 * Trimite o acțiune de automatizare către server
 * 
 * @param {string} action - Acțiunea de automatizare
 * @returns {boolean} true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const sendAutomationAction = (action) => {
  const worker = getWorker();
  
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Worker not available for automation action");
    return false;
  }
  
  return useMiddlewareStore.getState().sendAutomationAction(action, worker);
};

/**
 * Trimite o acțiune de rezervare către server
 * 
 * @param {string} action - Tipul acțiunii (ex: "create", "update", "delete")
 * @param {Object} data - Datele asociate acțiunii
 * @returns {boolean} true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const sendReservationAction = (action, data) => {
  const worker = getWorker();
  
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Worker not available for reservation action");
    return false;
  }
  
  return useMiddlewareStore.getState().sendReservationAction(action, data, worker);
};