import { AUTOMATION_ACTIONS } from './types';

/**
 * Helper pentru trimiterea acțiunilor de automatizare în format conform documentației README
 * @param {Worker} worker - Worker WebSocket
 * @param {string} action - Tipul acțiunii de automatizare
 * @returns {void}
 */
const sendAutomationAction = (worker, action) => {
  if (worker?.postMessage) {
    // Formatăm mesajul exact cum e specificat în README
    worker.postMessage({
      type: "automation_action",
      payload: action
    });
    
    console.log(`🤖 Acțiune de automatizare trimisă: ${action}`);
  } else {
    console.warn("⚠️ Worker nu este disponibil pentru acțiunea:", action);
  }
};

/**
 * Declanșează verificarea email-urilor de pe Booking.com
 * @param {Worker} worker - Worker WebSocket
 * @returns {void}
 */
export const triggerBookingEmailCheck = (worker) => {
  console.log("📨 Verificare automată email-uri Booking.com...");
  sendAutomationAction(worker, AUTOMATION_ACTIONS.BOOKING_EMAIL);
};

/**
 * Declanșează verificarea mesajelor de pe WhatsApp
 * @param {Worker} worker - Worker WebSocket
 * @returns {void}
 */
export const triggerWhatsAppCheck = (worker) => {
  console.log("📱 Verificare automată mesaje WhatsApp...");
  sendAutomationAction(worker, AUTOMATION_ACTIONS.WHATSAPP_MESSAGE);
};

/**
 * Declanșează analiza de prețuri
 * @param {Worker} worker - Worker WebSocket
 * @returns {void}
 */
export const triggerPriceAnalysis = (worker) => {
  console.log("📊 Analiză automată prețuri...");
  sendAutomationAction(worker, AUTOMATION_ACTIONS.PRICE_ANALYSIS);
}; 