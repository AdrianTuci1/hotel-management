import { INCOMING_MESSAGE_TYPES, AUTOMATION_ACTIONS } from './types';

let chatWorker = null;
let isInitializing = false;

/**
 * Obține instanța curentă a WebSocket Worker-ului
 * @returns {Worker|null} Instanța worker-ului sau null dacă nu este inițializat
 */
export const getWorker = () => chatWorker;

/**
 * Inițializează și conectează WebSocket Worker-ul
 * @async
 * @returns {Worker|null} Instanța worker-ului conectată sau null în caz de eroare
 */
export const connectSocket = async () => {
  if (chatWorker || isInitializing) return chatWorker;

  try {
    isInitializing = true;
    console.log("🔄 Inițializare WebSocket Worker...");
    
    chatWorker = new Worker(new URL("../../workers/WebSocketWorker.js", import.meta.url));

    if (!chatWorker) {
      throw new Error("Nu s-a putut inițializa Web Worker-ul");
    }

    chatWorker.onerror = (error) => {
      console.error("❌ Eroare în Web Worker:", error);
      chatWorker = null;
    };

    // Trimitem comanda de inițializare către worker
    chatWorker.postMessage({ type: "init" });
    console.log("✅ Web Worker inițializat cu succes");
    
    return chatWorker;
  } catch (error) {
    console.error("❌ Eroare la inițializarea Web Worker:", error);
    chatWorker = null;
    return null;
  } finally {
    isInitializing = false;
  }
};

/**
 * Deconectează și elimină WebSocket Worker-ul
 * @returns {void}
 */
export const disconnectSocket = () => {
  if (chatWorker) {
    console.log("🔌 Deconectare WebSocket Worker");
    chatWorker.terminate();
    chatWorker = null;
  }
};

/**
 * Trimite un mesaj prin WebSocket Worker conform protocolului README
 * @param {string|Object} message - Mesajul de trimis (string sau obiect pregătit)
 * @returns {boolean} true dacă mesajul a fost trimis, false altfel
 */
export const sendMessage = (message) => {
  if (chatWorker?.postMessage) {
    console.log("📤 Trimitere mesaj prin worker:", message);
    
    chatWorker.postMessage({
      type: "send_message",
      payload: message
    });
    return true;
  }
  
  console.warn("⚠️ Nu se poate trimite mesajul - worker-ul nu este inițializat");
  return false;
}; 