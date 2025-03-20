/**
 * @fileoverview Parser pentru normalizarea mesajelor primite de la server
 * 
 * Acest modul standardizează formatul mesajelor primite de la server,
 * înlăturând nevoia de a trata diferite formate în restul aplicației.
 */

import { INCOMING_MESSAGE_TYPES, CHAT_INTENTS, RESPONSE_TYPES } from '../types';

/**
 * Normalizează tipul mesajului pentru a se potrivi cu sistemul simplificat
 * 
 * @param {string} type - Tipul mesajului primit
 * @returns {string} - Tipul normalizat din INCOMING_MESSAGE_TYPES
 */
export const normalizeMessageType = (type) => {
  if (!type) return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
  
  // Convertim la majuscule pentru comparații consistente
  const upperType = type.toUpperCase();
  
  // Mapăm la cele patru tipuri principale
  if (["CHAT", "CHAT_RESPONSE", "CHAT_MESSAGE", "MESSAGE"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
  } 
  else if (["RESERVATION", "RESERVATIONS_UPDATE", "BOOKING", "RESERVATION_ACTION"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.RESERVATION_ACTION;
  }
  else if (["AUTOMATION", "AUTOMATION_ACTION", "NOTIFICATION"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION;
  }
  else if (["STATUS", "CONNECTION_STATUS"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.STATUS;
  }
  
  // Default la mesaj de chat dacă e necunoscut
  return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
};

/**
 * Procesează mesaj chat pentru a extrage și normaliza intent-ul
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {Object} Mesaj normalizat cu intent garantat
 */
export const parseChatMessage = (payload) => {
  // Caz 1: Format hotel-backend (prioritate maximă)
  if (payload.intent === 'show_calendar' && 
      payload.type === 'action' && 
      payload.action === 'show_calendar') {
    
    return {
      intent: CHAT_INTENTS.SHOW_CALENDAR,
      type: RESPONSE_TYPES.ACTION,
      message: payload.message || "📅 Se deschide calendarul rezervărilor...",
      ...payload
    };
  }
  
  // Caz 2: Mesaj cu intent explicit
  if (payload.intent) {
    return {
      intent: payload.intent,
      type: payload.type || RESPONSE_TYPES.MESSAGE,
      message: payload.message || `Processing intent: ${payload.intent}`,
      ...payload
    };
  }
  
  // Caz 3: Mesaj cu acțiune care poate fi convertită în intent
  if (payload.action && typeof payload.action === 'string' && payload.action.startsWith('show_')) {
    const intent = payload.action;
    return {
      intent: intent,
      type: RESPONSE_TYPES.ACTION,
      message: payload.message || `Acțiune: ${intent}`,
      ...payload
    };
  }
  
  // Caz 4: Mesaj de eroare
  if (payload.type === RESPONSE_TYPES.ERROR) {
    return {
      intent: CHAT_INTENTS.DEFAULT,
      type: RESPONSE_TYPES.ERROR,
      message: payload.message || "An error occurred",
      ...payload
    };
  }
  
  // Caz 5: Mesaj simplu
  if (payload.message) {
    return {
      intent: CHAT_INTENTS.DEFAULT,
      type: RESPONSE_TYPES.MESSAGE,
      message: payload.message,
      ...payload
    };
  }
  
  // Default pentru cazuri necunoscute
  return {
    intent: CHAT_INTENTS.DEFAULT,
    type: RESPONSE_TYPES.MESSAGE,
    message: "Received message in unknown format",
    originalData: payload
  };
};

/**
 * Procesează mesaj de rezervare pentru a normaliza formatul
 * 
 * @param {Object|Array} payload - Payload-ul mesajului
 * @returns {Object} Mesaj normalizat cu format standard
 */
export const parseReservationAction = (payload) => {
  // Caz 1: Array direct de rezervări
  if (Array.isArray(payload)) {
    return {
      action: "init",
      reservations: payload
    };
  }
  
  // Caz 2: Obiect cu array de rezervări
  if (payload.reservations && Array.isArray(payload.reservations)) {
    return {
      action: payload.action || "sync",
      reservations: payload.reservations,
      ...payload
    };
  }
  
  // Caz 3: Obiect cu o singură rezervare
  if (payload.reservation) {
    return {
      action: payload.action || "update",
      reservations: [payload.reservation],
      ...payload
    };
  }
  
  // Default pentru cazuri necunoscute
  return {
    action: "unknown",
    reservations: [],
    originalData: payload
  };
};

/**
 * Procesează mesaj de automatizare pentru a normaliza formatul
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {Object} Mesaj normalizat cu format standard
 */
export const parseAutomationAction = (payload) => {
  // Verificăm dacă avem un mesaj de automatizare complet
  if (payload.notification) {
    return {
      type: "automation",
      notification: {
        type: payload.notification.type,
        title: payload.notification.title || "Notificare automatizare",
        message: payload.notification.message,
        data: payload.notification.data
      }
    };
  }

  // Caz 1: Mesaj cu acțiune și mesaj
  if (payload.action && payload.message) {
    return {
      type: "automation",
      notification: {
        type: payload.type || "notification",
        title: payload.title || "Notificare automatizare",
        message: payload.message,
        data: payload.data
      }
    };
  }
  
  // Caz 2: Doar mesaj
  if (payload.message) {
    return {
      type: "automation",
      notification: {
        type: "notification",
        title: "Notificare automatizare",
        message: payload.message,
        data: payload.data
      }
    };
  }
  
  // Default pentru cazuri necunoscute
  return {
    type: "automation",
    notification: {
      type: "notification",
      title: "Notificare automatizare",
      message: "Received automation message in unknown format",
      data: payload
    }
  };
};

/**
 * Procesează mesaj de status pentru a normaliza formatul
 * 
 * @param {string|Object} payload - Payload-ul mesajului
 * @returns {Object} Mesaj normalizat cu format standard
 */
export const parseStatusMessage = (payload) => {
  // Caz 1: String direct (connected/disconnected)
  if (typeof payload === 'string') {
    return {
      status: payload,
      timestamp: new Date().toISOString()
    };
  }
  
  // Caz 2: Obiect cu status
  if (payload.status) {
    return {
      status: payload.status,
      timestamp: payload.timestamp || new Date().toISOString(),
      ...payload
    };
  }
  
  // Default pentru cazuri necunoscute
  return {
    status: "unknown",
    timestamp: new Date().toISOString(),
    originalData: payload
  };
}; 