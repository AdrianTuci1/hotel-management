import { INCOMING_MESSAGE_TYPES } from './types';

// Funcție helper pentru trimiterea mesajelor prin Worker
const sendWorkerMessage = (worker, type, action) => {
  if (worker?.postMessage) {
    worker.postMessage({
      type,
      action
    });
  }
};

export const triggerBookingEmailCheck = (worker) => {
  sendWorkerMessage(
    worker,
    INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION,
    'BOOKING_EMAIL'
  );
};

export const triggerWhatsAppCheck = (worker) => {
  sendWorkerMessage(
    worker,
    INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION,
    'WHATSAPP_MESSAGE'
  );
};

export const triggerPriceAnalysis = (worker) => {
  sendWorkerMessage(
    worker,
    INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION,
    'PRICE_ANALYSIS'
  );
}; 