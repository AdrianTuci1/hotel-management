import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";
import { OUTGOING_MESSAGE_TYPES } from './chat/types';
import { handleChatResponse, handleReservationsUpdate, handleNotification } from './chat/handlers';
import { connectSocket, getWorker, sendMessage } from './chat/worker';
import { triggerBookingEmailCheck, triggerWhatsAppCheck, triggerPriceAnalysis } from './chat/automation';

/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * Acest modul coordonează comunicarea între UI, WebSocket Worker și handlere.
 */

// Aceste variabile au fost mutate în worker.js

/**
 * Inițializează sistemul de chat și configurează handler-ele pentru mesaje
 * @async
 * @returns {Promise<void>}
 */
export const initializeChat = async () => {
  const worker = await connectSocket();
  
  if (!worker) {
    console.error("❌ Nu s-a putut inițializa chat-ul");
    return;
  }

  worker.onmessage = (event) => {
    const { type, payload } = event.data;
    const { addMessage, setDisplayComponent } = useChatStore.getState();
    const { setReservations } = useCalendarStore.getState();

    // Logging detaliat pentru mesajele WebSocket
    console.group("📩 Mesaj WebSocket Primit");
    console.log("Tip:", type);
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
        // TODO: Implementare actualizare camere
        console.log("📋 Actualizare camere primită:", payload);
        break;

      case OUTGOING_MESSAGE_TYPES.POS_UPDATE:
        // TODO: Implementare actualizare POS
        console.log("💰 Actualizare POS primită:", payload);
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

      case "status":
        console.log(`ℹ️ WebSocket Status: ${payload}`);
        break;

      default:
        console.warn("⚠️ Tip de mesaj necunoscut:", type);
    }
  };
};

/**
 * Procesează și trimite un mesaj de chat
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
    const result = sendMessage(message);
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
  const worker = getWorker();
  triggerBookingEmailCheck(worker);
};

/**
 * Verifică mesajele noi de pe WhatsApp
 * @returns {void}
 */
export const checkWhatsAppMessages = () => {
  const worker = getWorker();
  triggerWhatsAppCheck(worker);
};

/**
 * Declanșează analiza prețurilor
 * @returns {void}
 */
export const analyzePrices = () => {
  const worker = getWorker();
  triggerPriceAnalysis(worker);
};