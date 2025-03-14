/**
 * Tipuri de mesaje trimise de la server către client
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
 */
export const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  CHECK_BOOKING_EMAILS: 'CHECK_BOOKING_EMAILS',
  CHECK_WHATSAPP: 'CHECK_WHATSAPP',
  ANALYZE_PRICES: 'ANALYZE_PRICES'
};

/**
 * Tipuri de componente care pot fi afișate
 */
export const DISPLAY_COMPONENTS = {
  CALENDAR: 'calendar',
  POS: 'pos',
  STOCK: 'stock',
  INVOICES: 'invoices',
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
 */
export const VALID_INTENTS = [
  "show_calendar",
  "show_pos", 
  "show_invoices",
  "show_stock"
]; 