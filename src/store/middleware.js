/**
 * @fileoverview Middleware store pentru procesarea și rutarea mesajelor WebSocket
 * 
 * Acest middleware:
 * 1. Procesează toate tipurile de mesaje primite de la WebSocketWorker
 * 2. Normalizează formatul mesajelor pentru consistență
 * 3. Rutează mesajele către store-urile corespunzătoare în funcție de tip
 * 4. Oferă un singur punct de acces pentru toate acțiunile legate de WebSocket
 */

import { create } from 'zustand';
import { useChatStore } from './chatStore';
import { useCalendarStore } from './calendarStore';
import { useAutomationStore } from './automationStore';
import useRoomOptionsStore from './roomOptionsStore';
import { useNavigationStore } from './navigationStore';

// Constante pentru tipuri de mesaje
export const MESSAGE_TYPES = {
  CHAT: 'chat',
  RESERVATIONS: 'reservations',
  NOTIFICATION: 'notification',
  HISTORY: 'history',
  STATUS: 'status'
};

// Tipuri normalizate pentru acțiuni de intent
export const INTENT_TYPES = {
  SHOW_CALENDAR: 'show_calendar',
  SHOW_RESERVATIONS: 'show_reservations',
  SHOW_ROOMS: 'show_rooms',
  CREATE_RESERVATION: 'create_reservation',
  UPDATE_RESERVATION: 'update_reservation'
};

// Funcție pentru normalizarea tipurilor de mesaje
const normalizeMessageType = (type) => {
  if (!type) return MESSAGE_TYPES.CHAT;
  
  const upperType = type.toUpperCase();
  
  if (upperType === 'CHAT_MESSAGE' || upperType === 'CHAT' || upperType === 'MESSAGE') {
    return MESSAGE_TYPES.CHAT;
  }
  
  if (upperType === 'RESERVATIONS' || upperType === 'RESERVATION_ACTION' || upperType === 'BOOKING') {
    return MESSAGE_TYPES.RESERVATIONS;
  }
  
  if (upperType === 'NOTIFICATION' || upperType === 'AUTOMATION_ACTION' || upperType === 'ALERT') {
    return MESSAGE_TYPES.NOTIFICATION;
  }
  
  if (upperType === 'HISTORY') {
    return MESSAGE_TYPES.HISTORY;
  }
  
  if (upperType === 'STATUS') {
    return MESSAGE_TYPES.STATUS;
  }
  
  return MESSAGE_TYPES.CHAT; // Default type
};

const useMiddlewareStore = create((set, get) => ({
  // Starea de procesare a mesajelor
  processing: false,
  lastProcessedMessage: null,
  
  // Funcție pentru procesarea mesajelor primite de la WebSocketWorker
  processMessage: (event) => {
    if (!event || !event.data) {
      console.error("❌ [MIDDLEWARE] Invalid event received");
      return;
    }
    
    // Extragem tipul și payload-ul
    const { type: rawType, payload } = event.data;
    
    if (!payload) {
      console.error("❌ [MIDDLEWARE] Invalid payload received");
      return;
    }
    
    // Normalizăm tipul mesajului
    const messageType = normalizeMessageType(rawType);
    
    // Marcăm starea de procesare
    set({ processing: true, lastProcessedMessage: { type: messageType, payload }});
    
    console.group("📩 [MIDDLEWARE] Processing message");
    console.log("Raw type:", rawType);
    console.log("Normalized type:", messageType);
    console.log("Payload:", payload);
    
    // Preluăm toate acțiunile necesare din store-uri
    const { 
      addMessage, 
      setLatestIntent, 
      setDisplayComponent, 
      showOverlay 
    } = useChatStore.getState();
    
    const { setReservations } = useCalendarStore.getState();
    const { updateAutomations } = useAutomationStore.getState();
    const { setActiveMenu } = useNavigationStore.getState();
    
    // Procesăm mesajul în funcție de tip
    switch (messageType) {
      case MESSAGE_TYPES.CHAT:
        // Procesare mesaj chat
        _processChatMessage(payload);
        break;
        
      case MESSAGE_TYPES.RESERVATIONS:
        // Procesare mesaj rezervări
        _processReservationsMessage(payload);
        break;
        
      case MESSAGE_TYPES.NOTIFICATION:
        // Procesare notificare/automatizare
        _processNotificationMessage(payload);
        break;
        
      case MESSAGE_TYPES.HISTORY:
        // Procesare istoric
        _processHistoryMessage(payload);
        break;
        
      case MESSAGE_TYPES.STATUS:
        // Procesare status
        _processStatusMessage(payload);
        break;
        
      default:
        console.warn("⚠️ [MIDDLEWARE] Unknown message type:", messageType);
        // Pentru orice alt tip, adăugăm ca mesaj în chat
        addMessage({
          type: "system",
          text: `Received message of unknown type: ${messageType}`,
          data: payload
        });
    }
    
    // Finalizăm procesarea
    set({ processing: false });
    console.groupEnd();
  },
  
  // Funcție pentru trimiterea mesajelor către WebSocketWorker
  sendMessage: (message, worker) => {
    if (!worker) {
      console.error("❌ [MIDDLEWARE] WebSocket worker not available");
      return false;
    }
    
    try {
      // Formatăm mesajul
      let formattedMessage;
      
      if (typeof message === 'string') {
        try {
          // Încercăm să parsăm ca JSON
          formattedMessage = JSON.parse(message);
        } catch (e) {
          // Dacă nu e JSON, îl împachetăm în format standard
          formattedMessage = {
            type: "CHAT_MESSAGE",
            content: message
          };
        }
      } else {
        // E deja obiect
        formattedMessage = message;
      }
      
      // Trimitem mesajul către worker
      worker.postMessage({
        type: "send_message",
        payload: formattedMessage
      });
      
      return true;
    } catch (error) {
      console.error("❌ [MIDDLEWARE] Error sending message:", error);
      return false;
    }
  },
  
  // Funcție pentru trimiterea acțiunilor de automatizare
  sendAutomationAction: (action, worker) => {
    if (!worker) {
      console.error("❌ [MIDDLEWARE] WebSocket worker not available");
      return false;
    }
    
    worker.postMessage({
      type: "automation_action",
      payload: action
    });
    
    return true;
  },
  
  // Funcție pentru trimiterea acțiunilor de rezervare
  sendReservationAction: (action, data, worker) => {
    if (!worker) {
      console.error("❌ [MIDDLEWARE] WebSocket worker not available");
      return false;
    }
    
    if (!action) {
      console.error("❌ [MIDDLEWARE] Missing action field in reservation action");
      return false;
    }
    
    worker.postMessage({
      type: "reservation_action",
      payload: {
        action,
        data: data || {}
      }
    });
    
    return true;
  }
}));

// Funcții interne pentru procesarea mesajelor (private)

/**
 * Procesează mesaje de tip chat
 * @param {Object} payload - Datele mesajului
 * @private
 */
function _processChatMessage(payload) {
  const { 
    addMessage, 
    setLatestIntent, 
    setDisplayComponent 
  } = useChatStore.getState();
  
  // 1. Extragem intent-ul și acțiunea
  const intent = payload.intent || (payload.action && payload.action.startsWith('show_') ? payload.action : null);
  const message = payload.message || payload.content || "Mesaj primit";
  const type = payload.type || "message";
  
  // 2. Adăugăm mesajul în chat
  addMessage({
    type: type === "action" ? "system" : "assistant",
    text: message,
    data: payload
  });
  
  // 3. Actualizăm intent-ul curent
  if (intent) {
    setLatestIntent(intent);
    
    // 4. Tratăm acțiuni speciale pentru intent-uri
    switch (intent) {
      case INTENT_TYPES.SHOW_CALENDAR:
        // Afișăm componenta de calendar
        setDisplayComponent("calendar");
        break;
        
      case INTENT_TYPES.SHOW_RESERVATIONS:
        // Afișăm componenta de rezervări
        setDisplayComponent("reservations");
        break;
        
      case INTENT_TYPES.SHOW_ROOMS:
        // Afișăm componenta de camere
        setDisplayComponent("rooms");
        break;
        
      case INTENT_TYPES.CREATE_RESERVATION:
        // Afișăm overlay pentru creare rezervare
        useChatStore.getState().showOverlay("reservation-details", { 
          isNew: true,
          startDate: payload.startDate || "",
          endDate: payload.endDate || "",
          messageId: payload.messageId
        });
        break;
        
      case INTENT_TYPES.UPDATE_RESERVATION:
        // Afișăm overlay pentru actualizare rezervare
        if (payload.reservationId) {
          useChatStore.getState().showOverlay("reservation-details", { 
            isNew: false,
            reservationId: payload.reservationId,
            messageId: payload.messageId
          });
        }
        break;
    }
  }
}

/**
 * Procesează mesaje de tip rezervări
 * @param {Object} payload - Datele mesajului
 * @private
 */
function _processReservationsMessage(payload) {
  console.log("🏨 [MIDDLEWARE] Processing reservations message");
  
  // Actualizăm rezervările în store
  if (Array.isArray(payload)) {
    // Este un array direct de rezervări
    useCalendarStore.getState().setReservations(payload);
  } else if (payload.reservations && Array.isArray(payload.reservations)) {
    // Este un obiect cu array de rezervări
    useCalendarStore.getState().setReservations(payload.reservations);
  } else if (payload.data && payload.data.reservations && Array.isArray(payload.data.reservations)) {
    // Format din API: {type, action, data: {reservations: []}}
    useCalendarStore.getState().setReservations(payload.data.reservations);
  }
  
  // Dacă avem o acțiune specifică, procesăm corespunzător
  if (payload.action) {
    switch (payload.action) {
      case "show_calendar":
        // Actualizăm datele de afișare în calendar și deschidem calendarul
        if (payload.startDate && payload.endDate) {
          useCalendarStore.getState().setDateRange(payload.startDate, payload.endDate);
        }
        useChatStore.getState().setDisplayComponent("calendar");
        break;
        
      case "update":
      case "sync":
        // Doar sincronizăm datele, fără a face alte acțiuni
        // Am făcut deja setReservations mai sus
        break;
        
      case "show_details":
        // Afișăm detaliile unei rezervări
        if (payload.reservationId) {
          useChatStore.getState().showOverlay("reservation-details", { 
            isNew: false,
            reservationId: payload.reservationId
          });
        }
        break;
    }
  }
  
  // Adăugăm mesaj în chat despre actualizarea rezervărilor
  const { addMessage } = useChatStore.getState();
  addMessage({
    type: "system",
    text: payload.message || "Rezervările au fost actualizate",
    timestamp: new Date().toISOString()
  });
}

/**
 * Procesează mesaje de tip notificare
 * @param {Object} payload - Datele mesajului
 * @private
 */
function _processNotificationMessage(payload) {
  console.log("🔔 [MIDDLEWARE] Processing notification message");
  
  const { addMessage } = useChatStore.getState();
  
  // Extragem datele notificării
  let notificationData = {};
  let message = "Notificare primită";
  
  if (payload.notification) {
    // Format direct cu obiect notification
    notificationData = payload.notification;
    message = payload.notification.message || payload.notification.title || message;
  } else if (payload.title && payload.message) {
    // Format cu title și message separate
    notificationData = {
      type: payload.type || "notification",
      title: payload.title,
      message: payload.message,
      data: payload.data
    };
    message = payload.message;
  } else if (payload.message) {
    // Doar mesaj
    notificationData = {
      type: "notification",
      title: "Notificare",
      message: payload.message,
      data: payload.data
    };
    message = payload.message;
  }
  
  // Adăugăm în chat
  addMessage({
    type: "automation",
    notification: notificationData,
    timestamp: new Date().toISOString()
  });
  
  // Actualizăm store-ul de automatizări dacă avem un tip specific
  if (notificationData.type) {
    useAutomationStore.getState().updateAutomations(
      notificationData.type, 
      notificationData
    );
  }
  
  // Procesăm acțiuni
  if (payload.action && payload.action.startsWith('show_')) {
    useChatStore.getState().setLatestIntent(payload.action);
    useChatStore.getState().setDisplayComponent(payload.action.replace('show_', ''));
  }
}

/**
 * Procesează mesaje de istoric
 * @param {Object} payload - Datele mesajului
 * @private
 */
function _processHistoryMessage(payload) {
  console.log("📜 [MIDDLEWARE] Processing history message");
  
  // Adăugăm mesaj în chat
  const { addMessage } = useChatStore.getState();
  addMessage({
    type: "system",
    text: payload.message || "Istoric actualizat",
    data: {
      history: payload.data || payload.items || []
    },
    timestamp: new Date().toISOString()
  });
  
  // Dacă avem o componentă specifică de afișat
  if (payload.component) {
    useChatStore.getState().setDisplayComponent(payload.component);
  }
}

/**
 * Procesează mesaje de status
 * @param {string} payload - Status-ul conexiunii
 * @private
 */
function _processStatusMessage(payload) {
  // Nu logăm mesajele de status pentru a reduce zgomotul în consolă
  
  // Dacă avem status disconnected, putem notifica utilizatorul
  if (payload === "disconnected") {
    useChatStore.getState().addMessage({
      type: "system",
      text: "Conexiunea la server a fost întreruptă. Se încearcă reconectarea..."
    });
  }
}

export default useMiddlewareStore; 