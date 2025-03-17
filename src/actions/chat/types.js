/**
 * Message types sent from server to client
 * @description Defines all message types that can be received from the server
 */
export const OUTGOING_MESSAGE_TYPES = {
  // Chat messages
  CHAT_RESPONSE: 'CHAT_RESPONSE',
  
  // Data updates
  RESERVATIONS_UPDATE: 'RESERVATIONS_UPDATE',
  ROOMS_UPDATE: 'ROOMS_UPDATE',
  POS_UPDATE: 'POS_UPDATE',
  
  // Notifications and status
  NOTIFICATION: 'NOTIFICATION',
  ERROR: 'ERROR',
  STATUS: 'STATUS'
};

/**
 * Message types sent from client to server
 * @description Defines all message types that can be sent to the server
 */
export const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  RESERVATION_ACTION: 'RESERVATION_ACTION',
  AUTOMATION_ACTION: 'AUTOMATION_ACTION'
};

/**
 * Automation actions
 * @description Actions that can be triggered via automation
 */
export const AUTOMATION_ACTIONS = {
  BOOKING_EMAIL: 'BOOKING_EMAIL',
  WHATSAPP_MESSAGE: 'WHATSAPP_MESSAGE',
  PRICE_ANALYSIS: 'PRICE_ANALYSIS'
};

/**
 * Reservation actions
 * @description Actions that can be performed on reservations
 */
export const RESERVATION_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ADD_PHONE: 'ADD_PHONE'
};

/**
 * Room status values
 * @description Possible states for a room
 */
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance'
};

/**
 * Reservation status values
 * @description Possible states for a reservation
 */
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

/**
 * Chat intent types
 * @description Intents that can be received from the backend
 */
export const CHAT_INTENTS = {
  // UI display intents
  SHOW_CALENDAR: 'show_calendar',
  SHOW_STOCK: 'show_stock',
  SHOW_REPORTS: 'show_reports',
  SHOW_INVOICES: 'show_invoices',
  SHOW_POS: 'show_pos',
  
  // Reservation intents
  RESERVATION: 'reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  ADD_PHONE: 'add_phone',
  
  // Room intents
  CREATE_ROOM: 'create_room',
  MODIFY_ROOM: 'modify_room',
  
  // POS intents
  SELL_PRODUCT: 'sell_product',
  
  // Default intents
  DEFAULT: 'default',
  UNKNOWN: 'unknown'
};

/**
 * Response types from backend
 * @description Defines the types of responses that can be received from the backend
 */
export const RESPONSE_TYPES = {
  ACTION: 'action',      // UI actions (open calendar, etc)
  INFO: 'info',          // General information
  CONFIRM: 'confirm',    // Confirmations
  ROOM: 'room',          // Room operations
  POS: 'pos',            // POS operations
  ERROR: 'error',        // Errors
  MESSAGE: 'message',    // Simple messages
  FORM: 'form'           // Forms
};

/**
 * Display components
 * @description Components that can be displayed in the UI
 */
export const DISPLAY_COMPONENTS = {
  CALENDAR: 'calendar',
  POS: 'pos',
  STOCK: 'stock',
  INVOICES: 'invoices',
  REPORTS: 'reports'
};

/**
 * Notification types
 * @description Types of notifications that can be received
 */
export const NOTIFICATION_TYPES = {
  BOOKING: 'Rezervare nouă Booking.com',
  WHATSAPP: 'Mesaj WhatsApp nou',
  PRICE_ANALYSIS: 'Analiză prețuri completă'
};

/**
 * Valid intents for UI
 * @description List of intents that should trigger UI changes
 */
export const VALID_INTENTS = [
  // Intent standards
  "show_calendar",
  "show_pos", 
  "show_invoices",
  "show_stock",
  "show_reports",
  
  // Intent variants pentru robustețe
  "calendar",
  "pos",
  "invoices",
  "stock",
  "reports",
  
  // Intent-uri pentru acțiuni care afișează componente
  "reservation",
  "modify_reservation",
  "create_room",
  "modify_room",
  "sell_product"
]; 