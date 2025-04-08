/**
 * @fileoverview Date demo pentru testarea procesării mesajelor WebSocket.
 * Bazate pe RESPONSE_DOCUMENTATION.md
 */

import { 
    INCOMING_MESSAGE_TYPES, 
    HISTORY_ENTRY_TYPES,
    APPOINTMENT_ACTIONS,
    CHAT_INTENTS
} from '../actions/types';

export const overlayViewSwitchData = {
  type: INCOMING_MESSAGE_TYPES.OVERLAY,
  action: 'show_stock',
  intent: CHAT_INTENTS.SHOW_STOCK,
  payload: null,
};

export const overlayOpenReservationData = {
  type: INCOMING_MESSAGE_TYPES.OVERLAY,
  action: 'show_calendar', // Context action
  intent: CHAT_INTENTS.RESERVATION,
  payload: {
    fullName: "John Test",
    roomType: "Double",
    startDate: "2024-12-20",
    endDate: "2024-12-25",
  },
};

export const appointmentsInitData = {
  type: INCOMING_MESSAGE_TYPES.APPOINTMENTS,
  action: APPOINTMENT_ACTIONS.INIT,
  data: {
    appointments: [
      { id: 1, fullName: "Alice", startDate: "2024-05-01", endDate: "2024-05-05", rooms: [{roomNumber: '101'}] },
      { id: 2, fullName: "Bob", startDate: "2024-05-03", endDate: "2024-05-07", rooms: [{roomNumber: '102'}] },
    ],
  },
};

export const historyMixedData = {
  type: INCOMING_MESSAGE_TYPES.HISTORY,
  data: {
    items: [
      {
        id: "hist_msg_1",
        entryType: HISTORY_ENTRY_TYPES.MESSAGE,
        timestamp: "2024-04-10T10:00:00Z",
        payload: {
          intent: CHAT_INTENTS.ROOM_PROBLEM,
          message: "Problema raportată pentru camera 205.",
        },
      },
      {
        id: "hist_notif_1",
        entryType: HISTORY_ENTRY_TYPES.NOTIFICATION,
        timestamp: "2024-04-10T10:05:00Z",
        payload: {
          title: "Verificare Email",
          message: "Rezervare noua de la Booking pentru Jane Doe",
          type: "booking_email",
          data: { guestName: "Jane Doe" },
        },
      },
      {
        id: "hist_event_1",
        entryType: HISTORY_ENTRY_TYPES.EVENT,
        timestamp: "2024-04-10T10:10:00Z",
        payload: {
          eventType: "user_login",
          action: "success",
          content: { userId: "admin" },
        },
      },
    ],
  },
}; 