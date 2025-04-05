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
  if (!type) return INCOMING_MESSAGE_TYPES.CHAT;
  
  // Convertim la lowercase pentru comparații consistente
  const lowerType = type.toLowerCase();
  
  // Mapăm la cele patru tipuri principale
  if (["chat", "chat_response", "chat_message", "message"].includes(lowerType)) {
    return INCOMING_MESSAGE_TYPES.CHAT;
  } 
  else if (["reservations", "reservations_update", "booking", "reservation_action"].includes(lowerType)) {
    return INCOMING_MESSAGE_TYPES.RESERVATIONS;
  }
  else if (["notification", "automation", "automation_action"].includes(lowerType)) {
    return INCOMING_MESSAGE_TYPES.NOTIFICATION;
  }
  else if (["history", "conversation_history"].includes(lowerType)) {
    return INCOMING_MESSAGE_TYPES.HISTORY;
  }
  
  // Default la mesaj de chat dacă e necunoscut
  return INCOMING_MESSAGE_TYPES.CHAT;
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
    return payload;
  }
  
  // Caz 2: Obiect cu array de rezervări
  if (payload.reservations && Array.isArray(payload.reservations)) {
    return payload.reservations;
  }
  
  // Caz 3: Obiect cu o singură rezervare
  if (payload.reservation) {
    return [payload.reservation];
  }
  
  // Default pentru cazuri necunoscute
  return [];
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
      notification: {
        type: payload.notification.type,
        title: payload.notification.title || "Notificare automatizare",
        message: payload.notification.message,
        data: payload.notification.data
      },
      action: payload.action
    };
  }

  // Caz 1: Mesaj cu acțiune și mesaj
  if (payload.action && payload.message) {
    return {
      notification: {
        type: payload.type || "notification",
        title: payload.title || "Notificare automatizare",
        message: payload.message,
        data: payload.data
      },
      action: payload.action
    };
  }
  
  // Caz 2: Doar mesaj
  if (payload.message) {
    return {
      message: payload.message,
      action: payload.action
    };
  }
  
  // Default pentru cazuri necunoscute
  return {
    message: "Received automation message in unknown format",
    action: payload.action
  };
};

/**
 * Procesează un mesaj de istoric
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {Object} Mesaj normalizat
 */
export const parseHistoryMessage = (payload) => {
  // Caz 1: Format complet cu obiect history
  if (payload.history) {
    return {
      history: {
        title: payload.history.title || "Istoric conversații",
        items: payload.history.items || [],
        data: payload.history.data,
        component: payload.history.component
      },
      action: payload.action,
      message: payload.message
    };
  }
  
  // Caz 2: Format simplu cu mesaj
  if (payload.message) {
    return {
      message: payload.message,
      action: payload.action
    };
  }
  
  // Caz 3: Format cu acțiune
  if (payload.action) {
    return {
      action: payload.action,
      message: `Acțiune: ${payload.action}`
    };
  }
  
  // Caz 4: Format necunoscut, returnăm payload-ul original
  return payload;
}; 