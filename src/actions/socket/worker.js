/**
 * @fileoverview Interfață pentru WebSocket Worker
 * 
 * Acest modul oferă o interfață simplificată pentru comunicarea cu WebSocket Worker.
 */

import { OUTGOING_MESSAGE_TYPES } from '../types';

// Stocăm instanța worker-ului pentru reutilizare
let socketWorker = null;

/**
 * Inițializează și returnează instanța WebSocket Worker
 * 
 * @returns {Worker|null} Instanța worker-ului sau null în caz de eroare
 */
export const initializeWorker = () => {
  try {
    // Verificăm dacă worker-ul există deja
    if (socketWorker !== null) {
      return socketWorker;
    }
    
    // Creăm un nou worker
    console.log("🔌 [SOCKET] Creating new WebSocket worker");
    socketWorker = new Worker(new URL('../../workers/WebSocketWorker.js', import.meta.url), { type: 'module' });
    
    // Inițializăm conexiunea
    socketWorker.postMessage({ type: "init" });
    
    return socketWorker;
  } catch (error) {
    console.error("❌ [SOCKET] Error initializing WebSocket worker:", error);
    return null;
  }
};

/**
 * Obține instanța curentă a worker-ului sau inițializează una nouă
 * 
 * @returns {Worker|null} Instanța worker-ului sau null în caz de eroare
 */
export const getWorker = () => {
  if (socketWorker === null) {
    return initializeWorker();
  }
  return socketWorker;
};

/**
 * Trimite un mesaj către server prin WebSocket Worker
 * 
 * @param {string|Object} message - Mesajul de trimis
 * @returns {boolean} true dacă mesajul a fost trimis, false în caz contrar
 */
export const sendMessage = (message) => {
  const worker = getWorker();
  
  if (!worker) {
    console.error("❌ [SOCKET] Worker not available");
    return false;
  }
  
  try {
    // Formatăm mesajul conform protocolului
    let formattedMessage;
    
    if (typeof message === 'string') {
      // Încercăm să parsăm ca JSON
      try {
        formattedMessage = JSON.parse(message);
      } catch (e) {
        // Dacă nu e JSON, îl împachetăm în formatul standard
        formattedMessage = {
          type: OUTGOING_MESSAGE_TYPES.CHAT_MESSAGE,
          content: message
        };
      }
    } else {
      // E deja un obiect
      formattedMessage = message;
    }
    
    // Trimitem mesajul către worker
    worker.postMessage({
      type: "send_message",
      payload: formattedMessage
    });
    
    return true;
  } catch (error) {
    console.error("❌ [SOCKET] Error sending message:", error);
    return false;
  }
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
    console.error("❌ [SOCKET] Worker not available for automation action");
    return false;
  }
  
  worker.postMessage({
    type: "automation_action",
    payload: action
  });
  
  return true;
};

/**
 * Trimite o acțiune de rezervare către server
 * 
 * @param {Object} actionData - Date pentru acțiunea de rezervare
 * @param {string} actionData.action - Tipul acțiunii (create, update, delete)
 * @param {Object} [actionData.data] - Date asociate acțiunii
 * @returns {boolean} true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const sendReservationAction = (actionData) => {
  const worker = getWorker();
  
  if (!worker) {
    console.error("❌ [SOCKET] Worker not available for reservation action");
    return false;
  }
  
  if (!actionData.action) {
    console.error("❌ [SOCKET] Missing action field in reservation action");
    return false;
  }
  
  worker.postMessage({
    type: "reservation_action",
    payload: actionData
  });
  
  return true;
}; 