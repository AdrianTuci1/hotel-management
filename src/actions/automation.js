/**
 * @fileoverview Acțiuni de automatizare
 * 
 * Acest modul oferă funcții pentru declanșarea diferitelor acțiuni de automatizare.
 */

import { AUTOMATION_ACTIONS } from './types';
import { sendAutomationAction } from './socket/worker';

/**
 * Verifică email-urile noi de la Booking.com
 * 
 * Declanșează o acțiune automată de verificare a email-urilor noi
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {boolean} - true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const checkBookingEmails = () => {
  console.log("📨 [AUTOMATION] Checking Booking.com emails...");
  return sendAutomationAction(AUTOMATION_ACTIONS.BOOKING_EMAIL);
};

/**
 * Verifică mesajele noi de pe WhatsApp
 * 
 * Declanșează o acțiune automată de verificare a mesajelor WhatsApp
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {boolean} - true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const checkWhatsAppMessages = () => {
  console.log("📱 [AUTOMATION] Checking WhatsApp messages...");
  return sendAutomationAction(AUTOMATION_ACTIONS.WHATSAPP_MESSAGE);
};

/**
 * Declanșează analiza prețurilor
 * 
 * Declanșează o acțiune automată de analiză a prețurilor
 * Răspunsul va veni ca un mesaj AUTOMATION_ACTION
 * 
 * @returns {boolean} - true dacă acțiunea a fost trimisă, false în caz contrar
 */
export const analyzePrices = () => {
  console.log("📊 [AUTOMATION] Analyzing prices...");
  return sendAutomationAction(AUTOMATION_ACTIONS.PRICE_ANALYSIS);
}; 