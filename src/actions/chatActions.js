import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";
import { OUTGOING_MESSAGE_TYPES } from './chat/types';
import { handleChatResponse, handleReservationsUpdate, handleRoomsUpdate, handleNotification } from './chat/handlers';
import { connectSocket, getWorker, sendMessage } from './chat/worker';
import { triggerBookingEmailCheck, triggerWhatsAppCheck, triggerPriceAnalysis } from './chat/automation';

/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * Acest modul coordonează comunicarea între UI, WebSocket Worker și handlere.
 */

/**
 * Normalizează tipul mesajului primit pentru a se potrivi cu OUTGOING_MESSAGE_TYPES
 * @param {string} type - Tipul mesajului primit
 * @returns {string} - Tipul normalizat
 */
const normalizeMessageType = (type) => {
  // Convertim la uppercase pentru comparare consistentă
  const upperType = type.toUpperCase();
  
  // Mapăm tipurile comune care pot veni în formate diferite
  const typeMap = {
    'STATUS': OUTGOING_MESSAGE_TYPES.STATUS,
    'CHAT_RESPONSE': OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE,
    'RESERVATIONS_UPDATE': OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
    'ROOMS_UPDATE': OUTGOING_MESSAGE_TYPES.ROOMS_UPDATE,
    'POS_UPDATE': OUTGOING_MESSAGE_TYPES.POS_UPDATE,
    'NOTIFICATION': OUTGOING_MESSAGE_TYPES.NOTIFICATION,
    'ERROR': OUTGOING_MESSAGE_TYPES.ERROR
  };

  return typeMap[upperType] || type;
};

/**
 * Inițializează sistemul de chat și configurează handler-ele pentru mesaje
 * @async
 * @returns {Promise<void>}
 */
export const initializeChat = async () => {
  console.log("🚀 Inițializare sistem de chat...");
  const worker = await connectSocket();
  
  if (!worker) {
    console.error("❌ Nu s-a putut inițializa chat-ul");
    return;
  }

  worker.onmessage = (event) => {
    const { type: rawType, payload } = event.data;
    const type = normalizeMessageType(rawType);
    const { addMessage, setDisplayComponent } = useChatStore.getState();
    const { setReservations } = useCalendarStore.getState();

    // Logging detaliat pentru mesajele WebSocket
    console.group("📩 Mesaj WebSocket Primit");
    console.log("Tip normalizat:", type);
    console.log("Payload:", payload);
    console.log("Timestamp:", new Date().toISOString());
    console.groupEnd();

    switch (type) {
      case OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE:
        handleChatResponse(payload, { addMessage, setDisplayComponent });
        break;

      case OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE:
        console.group("📅 Actualizare Rezervări Primită");
        console.log("Payload brut:", payload);
        console.log("Store înainte de actualizare:", useCalendarStore.getState().reservations);
        handleReservationsUpdate(payload, { setReservations });
        console.log("Store după actualizare:", useCalendarStore.getState().reservations);
        console.groupEnd();
        break;

      case OUTGOING_MESSAGE_TYPES.ROOMS_UPDATE:
        console.group("📋 Actualizare Camere Primită");
        console.log("Payload brut:", payload);
        handleRoomsUpdate(payload);
        console.log("Store după actualizare:", useCalendarStore.getState().rooms);
        console.groupEnd();
        break;

      case OUTGOING_MESSAGE_TYPES.POS_UPDATE:
        // Implementare actualizare POS conform documentației README
        console.log("💰 Actualizare POS primită:", payload);
        // Codul pentru procesarea actualizării va fi adăugat în viitor
        break;

      case OUTGOING_MESSAGE_TYPES.NOTIFICATION:
        handleNotification(payload);
        break;

      case OUTGOING_MESSAGE_TYPES.ERROR:
        console.error("❌ Eroare de la server:", payload);
        addMessage({
          type: "bot",
          text: "A apărut o eroare: " + payload,
        });
        break;

      case OUTGOING_MESSAGE_TYPES.STATUS:
        console.log(`ℹ️ WebSocket Status: ${payload}`);
        break;

      default:
        console.warn("⚠️ Tip de mesaj necunoscut:", rawType, "->", type);
    }
  };
};

/**
 * Procesează și trimite un mesaj de chat conform protocolului din README
 * @async
 * @param {string} message - Mesajul de trimis
 * @returns {Promise<void>}
 */
export const handleChatMessage = async (message) => {
  console.group("🚀 Trimitere mesaj chat");
  console.log("Mesaj de trimis:", message);
  
  const { addMessage } = useChatStore.getState();
  addMessage({ text: message, type: "user" });

  let worker = getWorker();
  console.log("Worker existent:", !!worker);
  
  if (!worker) {
    console.log("⚠️ Worker nu există, încercăm să ne conectăm...");
    worker = await connectSocket();
    console.log("Rezultat conectare worker:", !!worker);
  }

  try {
    console.log("Încercăm să trimitem mesajul către worker...");
    
    // Formatăm mesajul conform protocolului documentat în README
    const formattedMessage = JSON.stringify({
      type: "CHAT_MESSAGE",
      content: message
    });
    
    const result = sendMessage(formattedMessage);
    console.log("Rezultat trimitere mesaj:", result);
    
    if (!result) {
      throw new Error("Web Worker nu este disponibil");
    }
  } catch (error) {
    console.error("❌ Eroare la trimiterea mesajului:", error);
    addMessage({
      type: "bot",
      text: "Ne pare rău, dar a apărut o eroare în comunicarea cu serverul. Vă rugăm să încercați din nou.",
    });
    
    console.log("🔄 Încercăm reconectarea în 5 secunde...");
    setTimeout(initializeChat, 5000);
  }
  
  console.groupEnd();
};

/**
 * Verifică email-urile noi de la Booking.com
 * @returns {void}
 */
export const checkBookingEmails = () => {
  console.log("📨 Verificare email-uri Booking.com...");
  const worker = getWorker();
  if (worker) {
    // Formatare conform protocolului din README
    worker.postMessage({
      type: "automation_action",
      payload: "BOOKING_EMAIL"
    });
  } else {
    console.warn("⚠️ Worker nu este disponibil pentru verificarea email-urilor");
  }
};

/**
 * Verifică mesajele noi de pe WhatsApp
 * @returns {void}
 */
export const checkWhatsAppMessages = () => {
  console.log("📱 Verificare mesaje WhatsApp...");
  const worker = getWorker();
  if (worker) {
    // Formatare conform protocolului din README
    worker.postMessage({
      type: "automation_action",
      payload: "WHATSAPP_MESSAGE"
    });
  } else {
    console.warn("⚠️ Worker nu este disponibil pentru verificarea WhatsApp");
  }
};

/**
 * Declanșează analiza prețurilor
 * @returns {void}
 */
export const analyzePrices = () => {
  console.log("📊 Analiză prețuri...");
  const worker = getWorker();
  if (worker) {
    // Formatare conform protocolului din README
    worker.postMessage({
      type: "automation_action",
      payload: "PRICE_ANALYSIS"
    });
  } else {
    console.warn("⚠️ Worker nu este disponibil pentru analiza prețurilor");
  }
};