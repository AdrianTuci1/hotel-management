// Tipuri de mesaje primite de la client
export const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message',
  RESERVATION_ACTION: 'reservation_action',
  ROOM_ACTION: 'room_action',
  POS_ACTION: 'pos_action',
  AUTOMATION_ACTION: 'automation_action'
};

// Tipuri de mesaje trimise de server
export const OUTGOING_MESSAGE_TYPES = {
  CHAT_RESPONSE: 'chat_response',
  RESERVATIONS_UPDATE: 'reservations_update',
  ROOMS_UPDATE: 'rooms_update',
  POS_UPDATE: 'pos_update',
  ERROR: 'error',
  NOTIFICATION: 'notification'
};

// Tipuri de notificări
export const NOTIFICATION_TYPES = {
  BOOKING: 'Rezervare nouă Booking.com',
  WHATSAPP: 'Mesaj WhatsApp nou',
  PRICE_ANALYSIS: 'Analiză prețuri completă'
};

// Intents valide pentru UI
export const VALID_INTENTS = [
  "show_calendar",
  "show_pos", 
  "show_invoices",
  "show_stock"
]; 