/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * 
 * Acest modul coordonează comunicarea între:
 * - Interfața utilizator (UI)
 * - WebSocket Worker (canal de comunicare cu backend-ul)
 * - Handlere pentru procesarea răspunsurilor
 * 
 * Fluxul de date:
 * 1. UI trimite mesaj text către chatActions (handleChatMessage)
 * 2. chatActions formatează și trimite mesajul către WebSocketWorker
 * 3. WebSocketWorker primește răspunsul și îl trimite înapoi la chatActions
 * 4. chatActions normalizează tipul mesajului și îl direcționează către handlerul potrivit
 * 5. Handlerul actualizează UI-ul și starea aplicației
 */

import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";
import { 
  normalizeMessageType, 
  parseChatMessage, 
  parseReservationAction, 
  parseAutomationAction, 
  parseStatusMessage 
} from './socket/messageParser';
import { 
  handleChatResponse, 
  handleReservationsUpdate, 
  handleNotification, 
  handleConnectionStatus 
} from './handlers';
import { 
  initializeWorker, 
  getWorker, 
  sendMessage 
} from './socket/worker';
import { INCOMING_MESSAGE_TYPES } from './types';

/**
 * Inițializează sistemul de chat și configurează handlerii de mesaje
 * 
 * Această funcție:
 * 1. Conectează la serverul WebSocket prin intermediul unui worker
 * 2. Configurează handler-ul pentru mesajele primite
 * 3. Normalizează și direcționează mesajele către handlerele potrivite
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

  worker.onmessage = (event) => {
    console.group("📩 [CHAT_ACTIONS] Message received from worker");
    
    if (!event || !event.data) {
      console.error("❌ [CHAT_ACTIONS] Invalid event received from worker");
      console.groupEnd();
      return;
    }
    
    // Extract type and payload
    const { type: rawType, payload } = event.data;
    
    if (!payload) {
      console.error("❌ [CHAT_ACTIONS] Invalid payload received from worker");
      console.groupEnd();
      return;
    }
    
    console.log("Message type:", rawType);
    console.log("Payload:", payload);
    
    // Normalize the message type
    const messageType = normalizeMessageType(rawType);
    console.log("Normalized message type:", messageType);
    
    // Get store actions
    const { addMessage, setDisplayComponent } = useChatStore.getState();
    const { setReservations } = useCalendarStore.getState();
    
    // Process based on message type
    switch (messageType) {
      case INCOMING_MESSAGE_TYPES.CHAT_MESSAGE:
        // Parsăm și normalizăm mesajul
        const normalizedChatMessage = parseChatMessage(payload);
        console.log("Normalized chat message:", normalizedChatMessage);
        
        // Trimitem la handler
        handleChatResponse(normalizedChatMessage, { addMessage, setDisplayComponent });
        break;

      case INCOMING_MESSAGE_TYPES.RESERVATION_ACTION:
        // Parsăm și normalizăm acțiunea de rezervare
        const normalizedReservationAction = parseReservationAction(payload);
        console.log("Normalized reservation action:", normalizedReservationAction);
        
        // Trimitem la handler
        handleReservationsUpdate(normalizedReservationAction, { setReservations });
        break;

      case INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION:
        // Parsăm și normalizăm acțiunea de automatizare
        const normalizedAutomationAction = parseAutomationAction(payload);
        console.log("Normalized automation action:", normalizedAutomationAction);
        
        // Trimitem la handler
        handleNotification(normalizedAutomationAction);
        break;
        
      case INCOMING_MESSAGE_TYPES.STATUS:
        // Parsăm și normalizăm mesajul de status
        const normalizedStatus = parseStatusMessage(payload);
        console.log("Normalized status:", normalizedStatus);
        
        // Trimitem la handler
        handleConnectionStatus(normalizedStatus);
        break;

      default:
        console.warn("⚠️ [CHAT_ACTIONS] Unhandled message type:", messageType);
        // Încercăm să detectăm formatul și să-l direcționăm
        if (typeof payload === 'object') {
          if (payload.intent || payload.action) {
            // Probabil un mesaj de chat
            handleChatResponse(parseChatMessage(payload), { addMessage, setDisplayComponent });
          }
          else if (Array.isArray(payload) || payload.reservations) {
            // Probabil o acțiune de rezervare
            handleReservationsUpdate(parseReservationAction(payload), { setReservations });
          }
          else if (payload.message) {
            // Default la mesaj de chat
            handleChatResponse(parseChatMessage(payload), { addMessage, setDisplayComponent });
          }
        }
        break;
    }
    
    console.groupEnd();
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
    
    const result = sendMessage(formattedMessage);
    
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
 * Verifică email-urile noi de la Booking.com
 * 
 * Declanșează o acțiune automată de verificare a email-urilor noi
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {void}
 */
export const checkBookingEmails = () => {
  console.log("📨 [CHAT_ACTIONS] Checking Booking.com emails...");
  const worker = getWorker();
  if (worker) {
    // Formatăm acțiunea de automatizare conform protocolului
    worker.postMessage({
      type: "automation_action",
      payload: "BOOKING_EMAIL"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for checking emails");
  }
};

/**
 * Verifică mesajele noi de pe WhatsApp
 * 
 * Declanșează o acțiune automată de verificare a mesajelor WhatsApp
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {void}
 */
export const checkWhatsAppMessages = () => {
  console.log("📱 [CHAT_ACTIONS] Checking WhatsApp messages...");
  const worker = getWorker();
  if (worker) {
    // Formatăm acțiunea de automatizare conform protocolului
    worker.postMessage({
      type: "automation_action",
      payload: "WHATSAPP_MESSAGE"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for checking WhatsApp");
  }
};

/**
 * Declanșează analiza prețurilor
 * 
 * Declanșează o acțiune automată de analiză a prețurilor
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {void}
 */
export const analyzePrices = () => {
  console.log("📊 [CHAT_ACTIONS] Analyzing prices...");
  const worker = getWorker();
  if (worker) {
    // Formatăm acțiunea de automatizare conform protocolului
    worker.postMessage({
      type: "automation_action",
      payload: "PRICE_ANALYSIS"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for price analysis");
  }
};

/**
 * Testează fluxul de procesare a unui mesaj de rezervare
 * 
 * Această funcție este pentru debugging și poate fi apelată manual
 * din consolă pentru a simula primirea unui mesaj de rezervare.
 * 
 * @example
 * // Import funcția pentru test
 * import { testReservationFlow } from './path/to/chatActions';
 * 
 * // Apelează funcția
 * testReservationFlow();
 * 
 * @param {Object} customData - Opțional, date de test personalizate
 * @returns {void}
 */
export const testReservationFlow = (customData = null) => {
  console.group("🧪 [TEST] Simulăm procesare eveniment de rezervare");
  
  // Date de test, exact ca în exemplul utilizatorului
  const testEvent = customData || {
    type: 'CHAT_MESSAGE', 
    payload: {
      extraIntents: ['show_calendar'],
      intent: "reservation",
      message: "Se deschide formularul pentru o rezervare nouă pentru Ana de la 2025-03-17 până la 2025-03-18",
      reservation: {
        fullName: 'Ana', 
        roomType: 'twin', 
        startDate: '2025-03-17', 
        endDate: '2025-03-18'
      },
      type: "info"
    }
  };
  
  console.log("📩 Date de test:", testEvent);
  
  // Simulăm cum ar fi primit mesajul de la WebSocket Worker
  const { type: rawType, payload } = testEvent;
  const messageType = normalizeMessageType(rawType);
  
  console.log("Tip mesaj normalizat:", messageType);
  
  if (messageType === INCOMING_MESSAGE_TYPES.CHAT_MESSAGE) {
    console.log("Tratăm ca CHAT_MESSAGE");
    
    // Parsăm și normalizăm mesajul
    const normalizedMessage = parseChatMessage(payload);
    
    // Apelăm handleChatResponse pentru a trata mesajul
    handleChatResponse(normalizedMessage, {
      addMessage: useChatStore.getState().addMessage,
      setDisplayComponent: useChatStore.getState().setDisplayComponent
    });
    
    // Verificăm starea overlay-ului
    setTimeout(() => {
      const overlayState = useChatStore.getState().overlay;
      console.log("Starea overlay după procesare:", overlayState);
      
      if (overlayState.isVisible && overlayState.type === 'reservation') {
        console.log("✅ TEST PASSED: Overlay s-a deschis corect");
      } else {
        console.log("❌ TEST FAILED: Overlay nu s-a deschis");
      }
      
      console.groupEnd();
    }, 100);
  } else {
    console.log("❌ [TEST] Tip de mesaj nepotrivit:", messageType);
    console.groupEnd();
  }
};