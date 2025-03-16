/**
 * Tipuri de mesaje trimise de la server către client
 * Aceste tipuri sunt conform protocolului descris în README
 */
export const OUTGOING_MESSAGE_TYPES = {
  // Mesaje de chat
  CHAT_RESPONSE: 'CHAT_RESPONSE',
  
  // Actualizări de date
  RESERVATIONS_UPDATE: 'RESERVATIONS_UPDATE',
  ROOMS_UPDATE: 'ROOMS_UPDATE',
  POS_UPDATE: 'POS_UPDATE',
  
  // Notificări și status
  NOTIFICATION: 'NOTIFICATION',
  ERROR: 'ERROR',
  STATUS: 'STATUS',
  
  // Variante alternative (pentru compatibilitate)
  CHATRESPONSE: 'CHAT_RESPONSE',
  RESERVATIONSUPDATE: 'RESERVATIONS_UPDATE',
  ROOMSUPDATE: 'ROOMS_UPDATE',
  POSUPDATE: 'POS_UPDATE'
};

/**
 * Tipuri de mesaje trimise de la client către server
 * Conform protocolului din documentație
 */
export const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  AUTOMATION_ACTION: 'AUTOMATION_ACTION'
};

/**
 * Acțiuni de automatizare
 */
export const AUTOMATION_ACTIONS = {
  BOOKING_EMAIL: 'BOOKING_EMAIL',
  WHATSAPP_MESSAGE: 'WHATSAPP_MESSAGE',
  PRICE_ANALYSIS: 'PRICE_ANALYSIS'
};

/**
 * Tipuri de intenții suportate conform documentației
 */
export const CHAT_INTENTS = {
  RESERVATION: 'RESERVATION',
  MODIFY_RESERVATION: 'MODIFY_RESERVATION',
  SHOW_CALENDAR: 'SHOW_CALENDAR',
  SHOW_STOCK: 'SHOW_STOCK',
  SHOW_REPORTS: 'SHOW_REPORTS',
  SHOW_INVOICES: 'SHOW_INVOICES',
  SHOW_POS: 'SHOW_POS',
  SELL_PRODUCT: 'SELL_PRODUCT',
  DEFAULT: 'DEFAULT'
};

/**
 * Tipuri de răspunsuri conform documentației
 */
export const RESPONSE_TYPES = {
  ACTION: 'ACTION',
  ERROR: 'ERROR',
  MESSAGE: 'MESSAGE',
  FORM: 'FORM'
};

/**
 * Tipuri de componente care pot fi afișate
 */
export const DISPLAY_COMPONENTS = {
  CALENDAR: 'calendar',
  POS: 'pos',
  STOCK: 'stock',
  INVOICES: 'invoices',
  REPORTS: 'reports',
  NOTIFICATION: 'notification',
  ANALYSIS: 'analysis'
};

/**
 * Stări posibile pentru o cameră
 */
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance'
};

/**
 * Stări posibile pentru o rezervare
 * Conform documentației
 */
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

/**
 * Tipuri de notificări
 */
export const NOTIFICATION_TYPES = {
  BOOKING: 'Rezervare nouă Booking.com',
  WHATSAPP: 'Mesaj WhatsApp nou',
  PRICE_ANALYSIS: 'Analiză prețuri completă'
};

/**
 * Intents valide pentru UI
 * Corespund cu descrierea din README
 */
export const VALID_INTENTS = [
  "show_calendar",
  "show_pos", 
  "show_invoices",
  "show_stock",
  "show_reports"
]; 