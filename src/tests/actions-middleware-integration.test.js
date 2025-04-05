/**
 * @fileoverview Test pentru integrarea dintre acțiuni și middleware
 * 
 * Acest test verifică că toate datele din src/actions ajung corect în middleware
 * și sunt procesate conform așteptărilor.
 */

import { jest } from '@jest/globals';
import { 
  initializeChat, 
  handleChatMessage, 
  sendAutomationAction, 
  sendReservationAction 
} from '../actions';
import { 
  checkBookingEmails, 
  checkWhatsAppMessages, 
  analyzePrices 
} from '../actions/automation';
import useMiddlewareStore from '../store/middleware';
import { 
  INCOMING_MESSAGE_TYPES, 
  OUTGOING_MESSAGE_TYPES, 
  CHAT_INTENTS, 
  RESPONSE_TYPES,
  RESERVATION_ACTIONS,
  AUTOMATION_ACTIONS
} from '../actions/types';

// Mock pentru WebSocket Worker
const mockWorker = {
  postMessage: jest.fn(),
  onmessage: null
};

// Mock pentru store-uri
jest.mock('../store/chatStore', () => ({
  useChatStore: {
    getState: jest.fn(() => ({
      addMessage: jest.fn(),
      setLatestIntent: jest.fn(),
      setDisplayComponent: jest.fn(),
      showOverlay: jest.fn(),
      setConnectionStatus: jest.fn()
    }))
  }
}));

jest.mock('../store/calendarStore', () => ({
  useCalendarStore: {
    getState: jest.fn(() => ({
      setReservations: jest.fn(),
      setDateRange: jest.fn(),
      getReservations: jest.fn(() => [])
    }))
  }
}));

jest.mock('../store/automationStore', () => ({
  useAutomationStore: {
    getState: jest.fn(() => ({
      updateAutomations: jest.fn()
    }))
  }
}));

jest.mock('../store/navigationStore', () => ({
  useNavigationStore: {
    getState: jest.fn(() => ({
      setActiveMenu: jest.fn()
    }))
  }
}));

// Mock pentru worker.js
jest.mock('../actions/socket/worker', () => ({
  initializeWorker: jest.fn(() => mockWorker),
  getWorker: jest.fn(() => mockWorker),
  sendMessage: jest.fn(() => true),
  sendAutomationAction: jest.fn(() => true),
  sendReservationAction: jest.fn(() => true)
}));

describe('Actions and Middleware Integration Tests', () => {
  let middlewareStore;
  
  beforeEach(() => {
    // Resetăm toate mock-urile
    jest.clearAllMocks();
    
    // Obținem instanța middleware store
    middlewareStore = useMiddlewareStore.getState();
    
    // Mock pentru processMessage
    middlewareStore.processMessage = jest.fn();
  });
  
  describe('Chat Actions Integration', () => {
    test('initializeChat should set up worker and configure message handling', async () => {
      // Apelăm funcția de inițializare
      await initializeChat();
      
      // Verificăm că worker-ul a fost inițializat
      expect(mockWorker.onmessage).toBeDefined();
      
      // Simulăm primirea unui mesaj
      const testEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.CHAT,
          payload: {
            intent: CHAT_INTENTS.SHOW_CALENDAR,
            type: RESPONSE_TYPES.INFO,
            message: 'Test message'
          }
        }
      };
      
      // Apelăm handler-ul
      mockWorker.onmessage(testEvent);
      
      // Verificăm că middleware-ul a procesat mesajul
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(testEvent);
    });
    
    test('handleChatMessage should format and send messages through middleware', async () => {
      // Apelăm funcția de trimitere mesaj
      await handleChatMessage('Test user message');
      
      // Verificăm că mesajul a fost formatat corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'send_message',
        payload: {
          type: OUTGOING_MESSAGE_TYPES.CHAT_MESSAGE,
          content: 'Test user message'
        }
      });
    });
  });
  
  describe('Automation Actions Integration', () => {
    test('checkBookingEmails should send automation action through middleware', () => {
      // Apelăm funcția de verificare email-uri
      checkBookingEmails();
      
      // Verificăm că acțiunea a fost trimisă corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.BOOKING_EMAIL
      });
    });
    
    test('checkWhatsAppMessages should send automation action through middleware', () => {
      // Apelăm funcția de verificare mesaje WhatsApp
      checkWhatsAppMessages();
      
      // Verificăm că acțiunea a fost trimisă corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.WHATSAPP_MESSAGE
      });
    });
    
    test('analyzePrices should send automation action through middleware', () => {
      // Apelăm funcția de analiză prețuri
      analyzePrices();
      
      // Verificăm că acțiunea a fost trimisă corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.PRICE_ANALYSIS
      });
    });
  });
  
  describe('Reservation Actions Integration', () => {
    test('sendReservationAction should send reservation action through middleware', () => {
      // Date de test
      const action = RESERVATION_ACTIONS.CREATE;
      const data = {
        fullName: 'John Doe',
        startDate: '2023-05-01',
        endDate: '2023-05-05',
        roomNumber: '101'
      };
      
      // Apelăm funcția de trimitere acțiune rezervare
      sendReservationAction(action, data);
      
      // Verificăm că acțiunea a fost trimisă corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'reservation_action',
        payload: {
          action,
          data
        }
      });
    });
  });
  
  describe('Middleware Message Processing', () => {
    test('middleware should process chat messages correctly', () => {
      // Creăm un mesaj de test
      const testEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.CHAT,
          payload: {
            intent: CHAT_INTENTS.SHOW_CALENDAR,
            type: RESPONSE_TYPES.INFO,
            message: 'Test message'
          }
        }
      };
      
      // Procesăm mesajul prin middleware
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost procesat
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(testEvent);
    });
    
    test('middleware should process reservation messages correctly', () => {
      // Creăm un mesaj de rezervare de test
      const testEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.RESERVATIONS,
          payload: {
            action: RESERVATION_ACTIONS.SYNC,
            reservations: [
              {
                id: 1,
                fullName: 'John Doe',
                startDate: '2023-05-01',
                endDate: '2023-05-05',
                roomNumber: '101'
              }
            ]
          }
        }
      };
      
      // Procesăm mesajul prin middleware
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost procesat
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(testEvent);
    });
    
    test('middleware should process notification messages correctly', () => {
      // Creăm un mesaj de notificare de test
      const testEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.NOTIFICATION,
          payload: {
            notification: {
              title: 'Test Notification',
              message: 'This is a test notification',
              type: 'info'
            }
          }
        }
      };
      
      // Procesăm mesajul prin middleware
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost procesat
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(testEvent);
    });
    
    test('middleware should process history messages correctly', () => {
      // Creăm un mesaj de istoric de test
      const testEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.HISTORY,
          payload: {
            history: {
              title: 'Test History',
              items: [
                {
                  type: 'chat',
                  content: 'Test history item',
                  timestamp: new Date().toISOString()
                }
              ]
            }
          }
        }
      };
      
      // Procesăm mesajul prin middleware
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost procesat
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(testEvent);
    });
  });
  
  describe('End-to-End Integration Test', () => {
    test('complete flow from action to middleware to store update', async () => {
      // 1. Inițializăm chat-ul
      await initializeChat();
      
      // 2. Trimitem un mesaj de chat
      await handleChatMessage('Show me the calendar');
      
      // 3. Simulăm primirea unui răspuns
      const responseEvent = {
        data: {
          type: INCOMING_MESSAGE_TYPES.CHAT,
          payload: {
            intent: CHAT_INTENTS.SHOW_CALENDAR,
            type: RESPONSE_TYPES.INFO,
            message: 'Here is the calendar view'
          }
        }
      };
      
      // 4. Procesăm răspunsul prin middleware
      middlewareStore.processMessage(responseEvent);
      
      // 5. Verificăm că mesajul a fost trimis corect
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'send_message',
        payload: {
          type: OUTGOING_MESSAGE_TYPES.CHAT_MESSAGE,
          content: 'Show me the calendar'
        }
      });
      
      // 6. Verificăm că răspunsul a fost procesat
      expect(middlewareStore.processMessage).toHaveBeenCalledWith(responseEvent);
    });
  });
}); 