/**
 * @fileoverview Definește tipurile de mesaje și constante pentru comunicarea socket.
 */

/**
 * Tipurile de mesaje primite de la server
 * 
 * @readonly
 * @enum {string}
 */
export const INCOMING_MESSAGE_TYPES = {
  /** Mesaje de chat și răspunsuri */
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  
  /** Acțiuni legate de rezervări */
  RESERVATION_ACTION: 'RESERVATION_ACTION',
  
  /** Acțiuni de automatizare și notificări */
  AUTOMATION_ACTION: 'AUTOMATION_ACTION',
  
  /** Actualizări de stare a conexiunii */
  STATUS: 'STATUS'
};

/**
 * Tipurile de mesaje trimise către server
 * 
 * @readonly
 * @enum {string}
 */
export const OUTGOING_MESSAGE_TYPES = {
  /** Mesaj de chat de la utilizator */
  CHAT_MESSAGE: 'CHAT_MESSAGE'
};

/**
 * Intenții cunoscute pentru mesajele de tip CHAT_MESSAGE
 * 
 * @readonly
 * @enum {string}
 */
export const CHAT_INTENTS = {
  /** Intent implicit pentru mesaje fără intent specific */
  DEFAULT: 'default',
  
  /** Afișare calendar */
  SHOW_CALENDAR: 'show_calendar',
  
  /** Operațiuni de rezervare */
  RESERVATION: 'reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  ADD_PHONE: 'add_phone',
  
  /** Operațiuni de cameră */
  CREATE_ROOM: 'create_room',
  MODIFY_ROOM: 'modify_room',
  
  /** Operațiuni POS */
  SHOW_POS: 'show_pos',
  SELL_PRODUCT: 'sell_product',
  
  /** Alte module */
  SHOW_INVOICES: 'show_invoices',
  SHOW_STOCK: 'show_stock',
  SHOW_REPORTS: 'show_reports'
};

/**
 * Tipuri de răspunsuri
 * 
 * @readonly
 * @enum {string}
 */
export const RESPONSE_TYPES = {
  /** Mesaj informativ */
  INFO: 'info',
  
  /** Mesaj de eroare */
  ERROR: 'error',
  
  /** Acțiune de executat */
  ACTION: 'action',
  
  /** Mesaj simplu */
  MESSAGE: 'message'
};

/**
 * Mapare între intent-uri și componentele UI corespunzătoare
 * 
 * @readonly
 * @type {Object.<string, string>}
 */
export const INTENT_TO_COMPONENT_MAP = {
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

/**
 * Tipuri de acțiuni pentru rezervări
 * 
 * @readonly
 * @enum {string}
 */
export const RESERVATION_ACTIONS = {
  /** Inițializare/sincronizare rezervări */
  INIT: 'init',
  SYNC: 'sync',
  
  /** Operațiuni CRUD */
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

/**
 * Tipuri de acțiuni de automatizare
 * 
 * @readonly
 * @enum {string}
 */
export const AUTOMATION_ACTIONS = {
  /** Verificare email-uri Booking.com */
  BOOKING_EMAIL: 'BOOKING_EMAIL',
  
  /** Verificare mesaje WhatsApp */
  WHATSAPP_MESSAGE: 'WHATSAPP_MESSAGE',
  
  /** Analiză prețuri */
  PRICE_ANALYSIS: 'PRICE_ANALYSIS'
};

/**
 * Statusuri pentru camerele de hotel
 * 
 * @readonly
 * @enum {string}
 */
export const ROOM_STATUS = {
  /** Camera este disponibilă */
  AVAILABLE: 'available',
  
  /** Camera este ocupată */
  OCCUPIED: 'occupied',
  
  /** Camera este în curs de curățare */
  CLEANING: 'cleaning',
  
  /** Camera necesită mentenanță */
  MAINTENANCE: 'maintenance',
  
  /** Camera este blocată */
  BLOCKED: 'blocked'
};

/**
 * Statusuri pentru rezervări
 * 
 * @readonly
 * @enum {string}
 */
export const RESERVATION_STATUS = {
  /** Rezervare confirmată */
  CONFIRMED: 'confirmed',
  
  /** Rezervare în așteptare */
  PENDING: 'pending',
  
  /** Rezervare anulată */
  CANCELLED: 'cancelled',
  
  /** Check-in efectuat */
  CHECKED_IN: 'checked_in',
  
  /** Check-out efectuat */
  CHECKED_OUT: 'checked_out',
  
  /** Rezervare no-show (client nu s-a prezentat) */
  NO_SHOW: 'no_show'
}; 