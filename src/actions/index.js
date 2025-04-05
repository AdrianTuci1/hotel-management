/**
 * @fileoverview Punct de intrare principal pentru acțiunile aplicației
 * 
 * Exportă funcțiile principale pentru utilizare în aplicație
 */

// Exportăm acțiunile principale pentru utilizare în componente
export { 
  initializeChat, 
  handleChatMessage, 
  testReservationFlow,
  sendAutomationAction,
  sendReservationAction
} from './chatActions';

// Exportăm acțiunile de automatizare
export { 
  checkBookingEmails, 
  checkWhatsAppMessages, 
  analyzePrices 
} from './automation';

// Exportăm tipurile de mesaje (pentru utilizare în alte module)
export { 
  INCOMING_MESSAGE_TYPES, 
  OUTGOING_MESSAGE_TYPES, 
  CHAT_INTENTS, 
  RESPONSE_TYPES,
  INTENT_TO_COMPONENT_MAP,
  ROOM_STATUS,
  RESERVATION_STATUS
} from './types'; 