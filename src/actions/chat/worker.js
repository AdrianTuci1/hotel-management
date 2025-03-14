import { INCOMING_MESSAGE_TYPES } from './types';

let chatWorker = null;
let isInitializing = false;

export const getWorker = () => chatWorker;

export const connectSocket = async () => {
  if (chatWorker || isInitializing) return chatWorker;

  try {
    isInitializing = true;
    chatWorker = new Worker(new URL("../../workers/WebSocketWorker.js", import.meta.url));

    if (!chatWorker) {
      throw new Error("Nu s-a putut inițializa Web Worker-ul");
    }

    chatWorker.onerror = (error) => {
      console.error("❌ Eroare în Web Worker:", error);
      chatWorker = null;
    };

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

export const disconnectSocket = () => {
  if (chatWorker) {
    chatWorker.terminate();
    chatWorker = null;
  }
};

export const sendMessage = (message) => {
  if (chatWorker?.postMessage) {
    chatWorker.postMessage({
      type: "send_message",
      payload: message
    });
    return true;
  }
  return false;
}; 