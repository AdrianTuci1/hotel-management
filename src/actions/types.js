/**
 * @fileoverview Definește tipurile de mesaje și constante pentru comunicarea socket.
 */

/**
 * Tipurile de mesaje primite de la server (Conform RESPONSE_DOCUMENTATION.md)
 * 
 * @readonly
 * @enum {string}
 */
export const INCOMING_MESSAGE_TYPES = {
  /** Acțiuni pentru UI overlay/view switching */
  OVERLAY: 'OVERLAY',
  
  /** Date despre programări (fostele rezervări) */
  APPOINTMENTS: 'APPOINTMENTS',
  
  /** Istoric consolidat (mesaje, notificări, evenimente) */
  HISTORY: 'HISTORY'
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
  DELETE_ROOM: 'delete_room',
  
  /** Raportare probleme cameră */
  ROOM_PROBLEM: 'room_problem',
  
  /** Operațiuni POS */
  SHOW_POS: 'show_pos',
  SELL_PRODUCT: 'sell_product',
  
  /** Alte module */
  SHOW_INVOICES: 'show_invoices',
  SHOW_STOCK: 'show_stock',
  SHOW_REPORTS: 'show_reports'
};

/**
 * Mapare între intent-uri și componentele UI corespunzătoare
 * 
 * @readonly
 * @type {Object.<string, string>}
 */
export const INTENT_TO_COMPONENT_MAP = {
  'show_calendar': 'calendar',
  'reservation': 'calendar',
  'modify_reservation': 'calendar',
  'add_phone': 'calendar',
  'create_room': 'calendar',
  'modify_room': 'calendar',
  'delete_room': 'calendar',
  'room_problem': 'calendar',
  'show_pos': 'pos',
  'sell_product': 'pos',
  'show_invoices': 'invoices',
  'show_stock': 'stock',
  'show_reports': 'reports'
};

/**
 * Tipuri de acțiuni pentru programări (Appointments)
 * 
 * @readonly
 * @enum {string}
 */
export const APPOINTMENT_ACTIONS = {
  /** Inițializare/sincronizare programări */
  INIT: 'init',
  SYNC: 'sync',
  
  /** Operațiuni CRUD */
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

/**
 * Tipuri de intrări în istoricul consolidat (HISTORY type)
 * 
 * @readonly
 * @enum {string}
 */
export const HISTORY_ENTRY_TYPES = {
  /** Mesaj text simplu */
  MESSAGE: 'message',
  
  /** Notificare despre evenimente automate/sistem */
  NOTIFICATION: 'notification',
  
  /** Eveniment semnificativ de sistem/utilizator */
  EVENT: 'event'
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