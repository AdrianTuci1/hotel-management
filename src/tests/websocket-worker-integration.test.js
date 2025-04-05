/**
 * @fileoverview Test pentru integrarea WebSocketWorker cu acțiuni și middleware
 * 
 * Acest test verifică că WebSocketWorker-ul funcționează corect cu acțiunile
 * și middleware-ul, asigurându-se că toate tipurile de mesaje sunt procesate corect.
 */

import { jest } from '@jest/globals';
import { 
  initializeChat, 
  handleChatMessage, 
  sendAutomationAction, 
  sendReservationAction 
} from '../actions/chatActions';
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

// Mock pentru WebSocketWorker
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
      setDisplayComponent: jest.fn()
    }))
  }
}));

jest.mock('../store/middleware', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({
      processMessage: jest.fn(),
      sendMessage: jest.fn(),
      sendAutomationAction: jest.fn(),
      sendReservationAction: jest.fn()
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
  initializeWorker: jest.fn(() => Promise.resolve(mockWorker)),
  getWorker: jest.fn(() => mockWorker)
}));

// Mock pentru WebSocketWorker.js
jest.mock('../workers/WebSocketWorker.js', () => {
  return function() {
    return {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      terminate: jest.fn()
    };
  };
});

describe('WebSocketWorker Integration Tests', () => {
  beforeEach(() => {
    // Resetăm toate mock-urile
    jest.clearAllMocks();
  });
  
  describe('WebSocketWorker Initialization', () => {
    test('initializeChat should create and configure WebSocketWorker', async () => {
      // Inițializăm chat-ul
      await initializeChat();
      
      // Verificăm că worker-ul a fost inițializat
      expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'init' });
      
      // Verificăm că handler-ul onmessage a fost setat
      expect(mockWorker.onmessage).toBeDefined();
      
      // Simulăm primirea unui mesaj
      const testMessage = {
        data: {
          type: 'chat',
          payload: {
            intent: 'show_calendar',
            type: 'info',
            message: 'Test message'
          }
        }
      };
      
      // Apelăm handler-ul onmessage
      mockWorker.onmessage(testMessage);
      
      // Verificăm că mesajul a fost procesat de middleware
      expect(useMiddlewareStore.getState().processMessage).toHaveBeenCalledWith(testMessage);
    });
  });
  
  describe('Message Sending Through WebSocketWorker', () => {
    test('handleChatMessage should send messages through WebSocketWorker', async () => {
      // Trimitem un mesaj
      await handleChatMessage('Test user message');
      
      // Verificăm că mesajul a fost trimis către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'send_message',
        payload: {
          type: 'CHAT_MESSAGE',
          content: 'Test user message'
        }
      });
    });
    
    test('sendAutomationAction should send automation actions through WebSocketWorker', () => {
      // Apelăm funcția de trimitere acțiune automatizare
      sendAutomationAction(AUTOMATION_ACTIONS.BOOKING_EMAIL);
      
      // Verificăm că acțiunea a fost trimisă către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.BOOKING_EMAIL
      });
    });
    
    test('sendReservationAction should send reservation actions through WebSocketWorker', () => {
      const action = 'create';
      const data = {
        startDate: '2023-05-01',
        endDate: '2023-05-05',
        roomNumber: '101'
      };
      
      // Apelăm funcția de trimitere acțiune rezervare
      sendReservationAction(action, data);
      
      // Verificăm că acțiunea a fost trimisă către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'reservation_action',
        payload: {
          action,
          data
        }
      });
    });
  });
  
  describe('Message Receiving Through WebSocketWorker', () => {
    test('should process received messages through middleware', async () => {
      // Inițializăm chat-ul
      await initializeChat();
      
      // Simulăm primirea unui mesaj
      const testMessage = {
        data: {
          type: 'chat',
          payload: {
            intent: 'show_calendar',
            type: 'info',
            message: 'Here is the calendar view'
          }
        }
      };
      
      // Apelăm handler-ul onmessage
      mockWorker.onmessage(testMessage);
      
      // Verificăm că mesajul a fost procesat de middleware
      expect(useMiddlewareStore.getState().processMessage).toHaveBeenCalledWith(testMessage);
    });
  });
  
  describe('Automation Actions Through WebSocketWorker', () => {
    test('checkBookingEmails should send action through WebSocketWorker', () => {
      // Apelăm funcția de verificare email-uri
      sendAutomationAction(AUTOMATION_ACTIONS.BOOKING_EMAIL);
      
      // Verificăm că acțiunea a fost trimisă către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.BOOKING_EMAIL
      });
    });
    
    test('checkWhatsAppMessages should send action through WebSocketWorker', () => {
      // Apelăm funcția de verificare WhatsApp
      sendAutomationAction(AUTOMATION_ACTIONS.WHATSAPP_MESSAGE);
      
      // Verificăm că acțiunea a fost trimisă către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.WHATSAPP_MESSAGE
      });
    });
    
    test('analyzePrices should send action through WebSocketWorker', () => {
      // Apelăm funcția de analiză prețuri
      sendAutomationAction(AUTOMATION_ACTIONS.PRICE_ANALYSIS);
      
      // Verificăm că acțiunea a fost trimisă către worker
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'automation_action',
        payload: AUTOMATION_ACTIONS.PRICE_ANALYSIS
      });
    });
  });
}); 