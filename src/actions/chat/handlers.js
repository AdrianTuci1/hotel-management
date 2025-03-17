import { useChatStore } from "../../store/chatStore";
import { useCalendarStore } from "../../store/calendarStore";
import { CHAT_INTENTS, NOTIFICATION_TYPES, RESPONSE_TYPES, VALID_INTENTS, DISPLAY_COMPONENTS } from './types';

// Maparea directă între intenții și componentele care trebuie afișate
// Pentru a asigura consistența între handleIntent și DisplayPanel
const INTENT_TO_COMPONENT_MAP = {
  // Intenții directe de afișare
  'show_calendar': DISPLAY_COMPONENTS.CALENDAR,
  'calendar': DISPLAY_COMPONENTS.CALENDAR,
  'show_pos': DISPLAY_COMPONENTS.POS,
  'pos': DISPLAY_COMPONENTS.POS,
  'show_stock': DISPLAY_COMPONENTS.STOCK,
  'stock': DISPLAY_COMPONENTS.STOCK,
  'show_invoices': DISPLAY_COMPONENTS.INVOICES,
  'invoices': DISPLAY_COMPONENTS.INVOICES,
  'show_reports': DISPLAY_COMPONENTS.REPORTS,
  'reports': DISPLAY_COMPONENTS.REPORTS,
  
  // Intenții funcționale care deschid componente specifice
  'reservation': DISPLAY_COMPONENTS.CALENDAR,
  'modify_reservation': DISPLAY_COMPONENTS.CALENDAR,
  'create_room': DISPLAY_COMPONENTS.CALENDAR,
  'modify_room': DISPLAY_COMPONENTS.CALENDAR,
  'sell_product': DISPLAY_COMPONENTS.POS
};

/**
 * Process a chat response and update the UI
 * @param {Object} payload - The response to process
 * @param {Object} actions - The available actions
 */
export const handleChatResponse = (payload, { addMessage, setDisplayComponent }) => {
  console.group("🤖 [HANDLERS] Processing chat response");
  console.log("Raw payload:", payload);
  
  if (!payload) {
    console.error("❌ [HANDLERS] Payload missing for chat response");
    console.groupEnd();
    return;
  }
  
  // PRIORITY CHECK - EXACT HOTEL-BACKEND FORMAT
  if (payload.intent === 'show_calendar' && 
      payload.type === 'action' && 
      payload.action === 'show_calendar') {
    
    console.log("🎯🎯🎯 [HANDLERS] FORMAT HOTEL-BACKEND DETECTAT!");
    
    // Adăugăm mesaj în chat
    if (typeof addMessage === 'function') {
      addMessage({
        text: payload.message || '📅 Se deschide calendarul rezervărilor...',
        type: "ai",
        timestamp: new Date().toISOString()
      });
    } else {
      useChatStore.getState().addMessage({
        text: payload.message || '📅 Se deschide calendarul rezervărilor...',
        type: "ai",
        timestamp: new Date().toISOString()
      });
    }
    
    // Setăm intent-ul și componenta
    useChatStore.getState().setLatestIntent('show_calendar');
    useChatStore.getState().setDisplayComponent('calendar');
    
    console.groupEnd();
    return; // Early return - am tratat cazul special
  }
  
  // Extract data from the payload
  const { 
    intent, 
    message, 
    type: responseType, 
    extraIntents, 
    reservation, 
    room, 
    product, 
    action 
  } = payload;

  // Determine message type based on response type
  let messageType = responseType === "error" ? "error" : "bot";
  let messageData = {};
  
  // Process reservation data if present
  if (reservation) {
    messageData.reservation = {
      id: reservation.id || null,
      fullName: reservation.guestName || "New Guest",
      preferences: reservation.preferences || [],
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      roomNumber: reservation.roomNumber,
      type: reservation.roomType,
      status: reservation.status || "confirmed"
    };
  }
  
  // Process room data if present
  if (room) {
    messageData.room = {
      number: room.number || "",
      type: room.type || "",
      status: room.status || "available",
      features: room.features || []
    };
  }
  
  // Process product data if present
  if (product) {
    messageData.product = {
      id: product.id || null,
      name: product.name || "",
      price: product.price || 0,
      quantity: product.quantity || 1,
      total: product.total || 0
    };
  }

  // Add message to chat
  if (message) {
    if (typeof addMessage === 'function') {
      addMessage({
        text: message,
        type: messageType,
        ...messageData
      });
    } else {
      useChatStore.getState().addMessage({
        text: message,
        type: messageType,
        ...messageData
      });
    }
  }

  // Procesare simplificată pentru toate intent-urile
  // Verificăm dacă avem un intent și îl procesăm
  if (intent) {
    // Store the intent
    useChatStore.getState().setLatestIntent(intent.toLowerCase());
    
    // Vedem dacă avem un component UI asociat
    const componentToShow = INTENT_TO_COMPONENT_MAP[intent.toLowerCase()];
    if (componentToShow) {
      console.log(`[HANDLERS] Setting display component: ${componentToShow}`);
      
      // Setăm componenta
      if (typeof setDisplayComponent === 'function') {
        setDisplayComponent(componentToShow);
      } else {
        useChatStore.getState().setDisplayComponent(componentToShow);
      }
    }
  } 
  // Dacă nu avem intent dar avem action care poate fi interpretat ca intent
  else if (action && typeof action === 'string' && action.startsWith('show_')) {
    console.log(`[HANDLERS] Using action as intent: ${action}`);
    useChatStore.getState().setLatestIntent(action.toLowerCase());
    
    const componentToShow = INTENT_TO_COMPONENT_MAP[action.toLowerCase()];
    if (componentToShow) {
      if (typeof setDisplayComponent === 'function') {
        setDisplayComponent(componentToShow);
      } else {
        useChatStore.getState().setDisplayComponent(componentToShow);
      }
    }
  }
  
  console.groupEnd();
};

/**
 * Process a reservations update
 * @param {Object} payload - The update to process
 * @param {Object} actions - The available actions
 */
export const handleReservationsUpdate = (payload, { setReservations }) => {
  console.group("🏨 [HANDLERS] Processing reservations update");
  
  if (!payload) {
    console.error("❌ [HANDLERS] Invalid payload for reservations update");
    console.groupEnd();
    return;
  }
  
  // Handle array of reservations
  if (Array.isArray(payload)) {
    setReservations(payload);
    console.groupEnd();
    return;
  }
  
  // Handle object with reservations array
  if (payload.reservations && Array.isArray(payload.reservations)) {
    setReservations(payload.reservations);
    console.groupEnd();
    return;
  }
  
  console.error("❌ [HANDLERS] Invalid format for reservations update:", payload);
  console.groupEnd();
};

/**
 * Process a notification
 * @param {Object} payload - The notification to process
 */
export const handleNotification = (payload) => {
  const { addMessage } = useChatStore.getState();
  
  console.group("🔔 [HANDLERS] Processing notification");
  
  if (!payload || !payload.message) {
    console.error("❌ [HANDLERS] Invalid format for notification");
    console.groupEnd();
    return;
  }
  
  addMessage({
    type: 'notification',
    text: payload.message,
    title: payload.title || 'System Notification',
    ...payload
  });
  
  console.groupEnd();
};

/**
 * Process an intent and update the UI accordingly
 * @param {string} intent - The intent received
 * @param {Function} setDisplayComponent - Optional function to set the display component
 * @returns {boolean} - True if intent triggered a UI update, false otherwise
 */
export const handleIntent = (intent, setDisplayComponent) => {
  if (!intent) return false;
  
  // Standardize intent (lowercase for case-insensitive comparison)
  const standardizedIntent = intent.toLowerCase();
  
  // Store the latest intent regardless of what happens next
  useChatStore.getState().setLatestIntent(standardizedIntent);
  
  // Check if we have a direct component mapping
  if (standardizedIntent in INTENT_TO_COMPONENT_MAP) {
    const componentToShow = INTENT_TO_COMPONENT_MAP[standardizedIntent];
    
    // Use the provided setDisplayComponent or the one from the store
    if (typeof setDisplayComponent === 'function') {
      setDisplayComponent(componentToShow);
    } else {
      useChatStore.getState().setDisplayComponent(componentToShow);
    }
    
    return true;
  }
  
  // No direct mapping found
  return false;
}; 