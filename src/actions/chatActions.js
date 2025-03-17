import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";
import { INCOMING_MESSAGE_TYPES, CHAT_INTENTS, RESPONSE_TYPES } from './chat/types';
import { handleChatResponse, handleReservationsUpdate, handleNotification } from './chat/handlers';
import { connectSocket, getWorker, sendMessage } from './chat/worker';
import { triggerBookingEmailCheck, triggerWhatsAppCheck, triggerPriceAnalysis } from './chat/automation';

/**
 * @fileoverview Gestionează acțiunile principale ale sistemului de chat.
 * Acest modul coordonează comunicarea între UI, WebSocket Worker și handlere.
 */

/**
 * Normalize the message type to match our simplified system
 * @param {string} type - The message type received
 * @returns {string} - The normalized type
 */
const normalizeMessageType = (type) => {
  if (!type) return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
  
  // Convert to uppercase for consistent comparison
  const upperType = type.toUpperCase();
  
  // Map to our three main types
  if (["CHAT", "CHAT_RESPONSE", "CHAT_MESSAGE", "MESSAGE"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
  } 
  else if (["RESERVATION", "RESERVATIONS_UPDATE", "BOOKING", "RESERVATION_ACTION"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.RESERVATION_ACTION;
  }
  else if (["AUTOMATION", "AUTOMATION_ACTION", "NOTIFICATION"].includes(upperType)) {
    return INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION;
  }
  
  // Default to chat message if unknown
  return INCOMING_MESSAGE_TYPES.CHAT_MESSAGE;
};

/**
 * Initialize the chat system and set up message handlers
 * @returns {Promise<void>}
 */
export const initializeChat = async () => {
  const worker = await connectSocket();
  
  if (!worker) {
    console.error("❌ [CHAT_ACTIONS] Failed to initialize chat");
    console.groupEnd();
    return;
  }

  worker.onmessage = (event) => {
    console.group("📩 [CHAT_ACTIONS] Message received from worker");
    console.log("Raw event data:", event.data);
    console.log("Timestamp:", new Date().toISOString());
    
    const { type: rawType, payload } = event.data;
    console.log("Raw message type:", rawType);
    
    const { addMessage, setDisplayComponent } = useChatStore.getState();
    const { setReservations } = useCalendarStore.getState();

    if (!payload) {
      console.error("❌ [CHAT_ACTIONS] Empty payload received");
      console.groupEnd();
      return;
    }

    // DETECTOR FORMAT HOTEL-BACKEND
    if (payload.intent === 'show_calendar' && 
        payload.type === 'action' && 
        payload.action === 'show_calendar') {
      
      console.log("🎯 [CHAT_ACTIONS] FORMAT HOTEL-BACKEND DETECTAT");
      
      // 1. Adăugăm mesaj în chat
      addMessage({
        text: payload.message || '📅 Se deschide calendarul rezervărilor...',
        type: "ai",
        timestamp: new Date().toISOString()
      });
      
      // 2. Setăm intent-ul
      useChatStore.getState().setLatestIntent('show_calendar');
      
      // 3. Setăm componenta
      useChatStore.getState().setDisplayComponent('calendar');
      
      console.groupEnd();
      return; // Early return pentru format special
    }

    // DETECTOR GENERAL PENTRU INTENT-URI
    if (payload.intent || 
        (payload.action && typeof payload.action === 'string' && payload.action.startsWith('show_'))) {
      
      // 1. Detectăm intent-ul
      const detectedIntent = payload.intent || payload.action;
      console.log("✓ [CHAT_ACTIONS] Intent detectat:", detectedIntent);
      
      // 2. Adăugăm mesaj în chat
      const messageText = payload.message || `Procesăm intent: ${detectedIntent}`;
      addMessage({
        text: messageText,
        type: "ai",
        timestamp: new Date().toISOString()
      });
      
      // 3. Setăm intent-ul
      useChatStore.getState().setLatestIntent(detectedIntent);
      
      // 4. Setăm componenta corespunzătoare
      const componentMap = {
        'show_calendar': 'calendar',
        'calendar': 'calendar',
        'reservation': 'calendar',
        'modify_reservation': 'calendar',
        'add_phone': 'calendar',
        'create_room': 'calendar',
        'modify_room': 'calendar',
        'show_pos': 'pos',
        'pos': 'pos',
        'sell_product': 'pos',
        'show_invoices': 'invoices',
        'invoices': 'invoices',
        'show_stock': 'stock',
        'stock': 'stock',
        'show_reports': 'reports',
        'reports': 'reports'
      };
      
      const componentToShow = componentMap[detectedIntent.toLowerCase()] || null;
      
      if (componentToShow) {
        useChatStore.getState().setDisplayComponent(componentToShow);
        console.groupEnd();
        return; // Early return, am tratat cazul
      }
    }

    // Normalize the message type
    const messageType = normalizeMessageType(rawType);
    
    switch (messageType) {
      case INCOMING_MESSAGE_TYPES.CHAT_MESSAGE:
        console.log("[CHAT_ACTIONS] Processing as chat message");
        
        // SPECIAL CASE - DIRECT INTENT HANDLER
        if (payload.intent) {
          console.log("[CHAT_ACTIONS] Intent detected:", payload.intent);
          
          // Special handler pentru intent show_calendar
          if (payload.intent === 'show_calendar') {
            console.log("🎯🎯 [CHAT_ACTIONS] Show calendar intent direct detectat! (secondary detector)");
            
            // Adăugăm mesaj în chat
            addMessage({
              text: payload.message || '📅 Se deschide calendarul rezervărilor...',
              type: "ai",
              timestamp: new Date().toISOString()
            });
            
            // Setăm direct componenta UI
            console.log("✅ [CHAT_ACTIONS] Setăm direct displayComponent la 'calendar'");
            useChatStore.getState().setDisplayComponent('calendar');
            
            console.groupEnd();
            return; // Early return
          }
          
          // Pentru alte intenții, trecem la handler normal
          console.log("[CHAT_ACTIONS] Full payload:", payload);
          
          // Pass to handler, ensuring UI components update
          handleChatResponse(payload, { addMessage, setDisplayComponent });
        } 
        // Priority 2: Handle error messages
        else if (payload.type === "error") {
          console.error("[CHAT_ACTIONS] Error message:", payload.message);
          addMessage({
            type: "error",
            text: payload.message || "An error occurred"
          });
        }
        // Priority 3: Handle regular messages with message field
        else if (payload.message) {
          console.log("[CHAT_ACTIONS] Simple message:", payload.message);
          
          // If message has no intent but might need UI updates, create a minimal structure
          // that can be processed by handleChatResponse
          handleChatResponse({
            intent: payload.intent || "default",
            type: payload.type || "message",
            message: payload.message,
            // Include any other fields from the original payload
            ...payload
          }, { addMessage, setDisplayComponent });
        }
        // Fallback for completely unknown format
        else {
          console.warn("[CHAT_ACTIONS] Unknown chat message format:", payload);
          addMessage({
            type: "bot",
            text: "Received message in unknown format"
          });
        }
        break;

      case INCOMING_MESSAGE_TYPES.RESERVATION_ACTION:
        console.log("[CHAT_ACTIONS] Processing as reservation action");
        
        // Handle array of reservations
        if (Array.isArray(payload)) {
          handleReservationsUpdate({ action: "init", reservations: payload }, { setReservations });
        }
        // Handle reservation action object
        else if (payload.reservations || payload.action) {
          handleReservationsUpdate(payload, { setReservations });
        }
        // Fallback
        else {
          console.warn("[CHAT_ACTIONS] Unknown reservation format:", payload);
        }
        break;

      case INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION:
        console.log("[CHAT_ACTIONS] Processing as automation action");
        
        // Handle notification format
        if (payload.message) {
          handleNotification(payload);
        }
        // Fallback
        else {
          console.warn("[CHAT_ACTIONS] Unknown automation format:", payload);
        }
        break;

      default:
        console.warn("[CHAT_ACTIONS] Unhandled message type:", messageType);
        // Try to determine message type from payload structure and find a suitable handler
        if (typeof payload === 'object') {
          if (payload.intent) {
            // If it has an intent, treat as chat response
            handleChatResponse(payload, { addMessage, setDisplayComponent });
          }
          else if (payload.message) {
            // If it has a message, add it to chat
            addMessage({
              type: "bot",
              text: payload.message
            });
          } else {
            console.error("[CHAT_ACTIONS] Couldn't process message:", payload);
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
 * Process and send a chat message
 * @param {string} message - The message to send
 * @returns {Promise<void>}
 */
export const handleChatMessage = async (message) => {
  console.group("🚀 [CHAT_ACTIONS] Sending chat message");
  console.log("Message to send:", message);
  
  const { addMessage } = useChatStore.getState();
  // Add user message to the chat UI
  addMessage({ text: message, type: "user" });

  // Get or create worker
  let worker = getWorker();
  console.log("Worker exists:", !!worker);
  
  if (!worker) {
    console.log("[CHAT_ACTIONS] Worker doesn't exist, trying to connect...");
    worker = await connectSocket();
    console.log("Connection result:", !!worker);
  }

  try {
    console.log("Sending message to worker...");
    
    // Format message according to backend protocol
    const formattedMessage = JSON.stringify({
      type: "CHAT_MESSAGE",
      content: message
    });
    
    const result = sendMessage(formattedMessage);
    console.log("Message sent successfully:", result);
    
    if (!result) {
      throw new Error("Web Worker is not available");
    }
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
 * Check for new emails from Booking.com
 * @returns {void}
 */
export const checkBookingEmails = () => {
  console.log("📨 [CHAT_ACTIONS] Checking Booking.com emails...");
  const worker = getWorker();
  if (worker) {
    // Format automation action according to protocol
    worker.postMessage({
      type: "automation_action",
      payload: "BOOKING_EMAIL"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for checking emails");
  }
};

/**
 * Check for new WhatsApp messages
 * @returns {void}
 */
export const checkWhatsAppMessages = () => {
  console.log("📱 [CHAT_ACTIONS] Checking WhatsApp messages...");
  const worker = getWorker();
  if (worker) {
    // Format automation action according to protocol
    worker.postMessage({
      type: "automation_action",
      payload: "WHATSAPP_MESSAGE"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for checking WhatsApp");
  }
};

/**
 * Trigger price analysis
 * @returns {void}
 */
export const analyzePrices = () => {
  console.log("📊 [CHAT_ACTIONS] Analyzing prices...");
  const worker = getWorker();
  if (worker) {
    // Format automation action according to protocol
    worker.postMessage({
      type: "automation_action",
      payload: "PRICE_ANALYSIS"
    });
  } else {
    console.warn("⚠️ [CHAT_ACTIONS] Worker is not available for price analysis");
  }
};