/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * 
 * Acest modul coordonează comunicarea între:
 * - Interfața utilizator (UI)
 * - WebSocket Worker (canal de comunicare cu backend-ul)
 * - Handler-ele specifice pentru procesarea mesajelor primite
 * 
 * Fluxul de date:
 * 1. UI trimite mesaj text către chatActions (handleChatMessage)
 * 2. chatActions formatează și trimite mesajul către WebSocketWorker
 * 3. WebSocketWorker primește răspunsul, îl trimite înapoi aici
 * 4. chatActions parsează mesajul și apelează handler-ul corespunzător
 * 5. Handler-ul actualizează store-urile specifice (Chat, Calendar, etc.)
 */

import { useChatStore } from "../store/chatStore";
// import useMiddlewareStore from "../store/middleware"; // Middleware eliminat
import { 
  initializeWorker, 
  getWorker
} from './socket/worker';
import { parseIncomingMessage } from './socket/messageParser'; // Importăm parserul
import { 
  OUTGOING_MESSAGE_TYPES, 
  INCOMING_MESSAGE_TYPES // Adăugăm tipurile de mesaje primite
} from './types'; 
import { handleOverlayAction } from './handlers/overlayHandler'; // Importăm handlerele
import { handleAppointmentsUpdate } from './handlers/appointmentHandler';
import { handleHistoryUpdate } from './handlers/historyHandler';
// Presupunem că handleConnectionStatus este încă relevant (poate fi apelat din worker?)
import { handleConnectionStatus } from './handlers/statusHandler'; 

/**
 * Inițializează sistemul de chat și configurează handlerii de mesaje
 * 
 * Această funcție:
 * 1. Conectează la serverul WebSocket prin intermediul unui worker
 * 2. Configurează handler-ul pentru mesajele primite
 * 3. Parsează mesajele și le direcționează către handlerul corect
 * 
 * @returns {Promise<void>}
 */
export const initializeChat = async () => {
  console.group("🚀 [CHAT_ACTIONS] Initializing chat system");
  
  const worker = await initializeWorker();
  
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Failed to initialize chat worker");
    console.groupEnd();
    return;
  }

  // Configurăm handler-ul pentru mesajele primite de la worker
  worker.onmessage = (event) => {
    // Mesajul vine de la worker, aici îl parsăm și rutăm
    const parsedMessage = parseIncomingMessage(event);

    if (!parsedMessage) {
      console.error("❌ [CHAT_ACTIONS] Received message could not be parsed.");
      return; // Oprim procesarea dacă mesajul e invalid
    }

    console.log("✅ [CHAT_ACTIONS] Received and parsed message:", parsedMessage);

    // Rutăm mesajul către handlerul corespunzător pe baza tipului
    switch (parsedMessage.type) {
      case INCOMING_MESSAGE_TYPES.OVERLAY:
        handleOverlayAction(parsedMessage);
        break;
      case INCOMING_MESSAGE_TYPES.APPOINTMENTS:
        handleAppointmentsUpdate(parsedMessage);
        break;
      case INCOMING_MESSAGE_TYPES.HISTORY:
        handleHistoryUpdate(parsedMessage);
        break;
      // Adăugăm un caz special pentru status, dacă worker-ul îl trimite așa
      // Ar putea necesita ajustări în worker.js să trimită un obiect { type: 'STATUS', status: 'connected' }
      case 'STATUS': // Sau un alt tip specific definit pentru status?
         if (parsedMessage.payload && parsedMessage.payload.status) {
            handleConnectionStatus(parsedMessage.payload.status); 
         } else {
            console.warn("❓ [CHAT_ACTIONS] Received STATUS message without valid payload:", parsedMessage);
         }
         break;
      default:
        console.warn(`❓ [CHAT_ACTIONS] Received unknown message type: ${parsedMessage.type}`, parsedMessage);
        // Poate vrem să afișăm un mesaj generic în chat?
        // const { addMessage } = useChatStore.getState();
        // addMessage({ text: `Primit mesaj necunoscut: ${parsedMessage.type}`, type: "system" });
    }
  };

  // TODO: Verifică cum este gestionat statusul conexiunii. 
  // Dacă worker.onerror sau alte mecanisme gestionează statusul, s-ar putea
  // să nu fie nevoie de cazul 'STATUS' în `onmessage`.
  // Exemplu: worker.onerror = () => handleConnectionStatus('disconnected');
  
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
     // Re-atașăm handlerul onmessage dacă worker-ul a fost re-inițializat
     initializeChat(); // Re-rulează inițializarea pentru a atașa onmessage
  }

  try {
    // Formatăm mesajul conform structurii definite
    const formattedMessage = {
      type: OUTGOING_MESSAGE_TYPES.CHAT_MESSAGE, 
      content: message
    };
    
    console.log("✉️ [CHAT_ACTIONS] Sending formatted message to worker:", formattedMessage);
    
    // Trimitem direct către worker
    worker.postMessage(formattedMessage); 
    
    console.log("✅ [CHAT_ACTIONS] Message sent successfully to worker");
  } catch (error) {
    console.error("❌ [CHAT_ACTIONS] Error sending chat message:", error);
    addMessage({
      type: "error",
      text: "Sorry, there was an error sending your message. Please try again.",
    });
  }
  
  console.groupEnd();
};