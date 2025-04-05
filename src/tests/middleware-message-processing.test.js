/**
 * @fileoverview Test pentru procesarea mesajelor în middleware
 * 
 * Acest test verifică că middleware-ul poate procesa corect toate tipurile
 * de mesaje primite de la acțiuni și WebSocketWorker.
 */

import { jest } from '@jest/globals';
import useMiddlewareStore from '../store/middleware';
import { useChatStore } from '../store/chatStore';
import { useCalendarStore } from '../store/calendarStore';
import { useAutomationStore } from '../store/automationStore';
import { useNavigationStore } from '../store/navigationStore';
import { 
  INCOMING_MESSAGE_TYPES, 
  CHAT_INTENTS, 
  RESPONSE_TYPES,
  RESERVATION_ACTIONS,
  AUTOMATION_ACTIONS
} from '../actions/types';

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

describe('Middleware Message Processing Tests', () => {
  let middlewareStore;
  let chatStore;
  let calendarStore;
  let automationStore;
  let navigationStore;
  
  beforeEach(() => {
    // Resetăm toate mock-urile
    jest.clearAllMocks();
    
    // Obținem instanțele store-urilor
    middlewareStore = useMiddlewareStore.getState();
    chatStore = useChatStore.getState();
    calendarStore = useCalendarStore.getState();
    automationStore = useAutomationStore.getState();
    navigationStore = useNavigationStore.getState();
  });
  
  describe('Chat Message Processing', () => {
    test('should process chat messages with intent', () => {
      // Creăm un mesaj de chat de test
      const testEvent = {
        data: {
          type: 'CHAT',
          payload: {
            intent: CHAT_INTENTS.SHOW_CALENDAR,
            type: 'info',
            message: 'Test message'
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost adăugat în chat
      expect(chatStore.addMessage).toHaveBeenCalled();
      
      // Verificăm că intent-ul a fost setat
      expect(chatStore.setLatestIntent).toHaveBeenCalledWith(CHAT_INTENTS.SHOW_CALENDAR);
      
      // Verificăm că componenta de afișare a fost setată
      expect(chatStore.setDisplayComponent).toHaveBeenCalledWith('calendar');
    });
    
    test('should process chat messages with reservation data', () => {
      // Creăm un mesaj de chat cu date de rezervare
      const testEvent = {
        data: {
          type: 'CHAT',
          payload: {
            intent: CHAT_INTENTS.RESERVATION,
            type: 'action',
            message: 'Creating reservation',
            reservation: {
              id: 1,
              fullName: 'John Doe',
              startDate: '2023-05-01',
              endDate: '2023-05-05',
              roomNumber: '101'
            }
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că mesajul a fost adăugat în chat
      expect(chatStore.addMessage).toHaveBeenCalled();
      
      // Verificăm că intent-ul a fost setat
      expect(chatStore.setLatestIntent).toHaveBeenCalledWith(CHAT_INTENTS.RESERVATION);
      
      // Verificăm că overlay-ul a fost deschis
      expect(chatStore.showOverlay).toHaveBeenCalledWith('reservation-details', expect.any(Object));
    });
  });
  
  describe('Reservation Message Processing', () => {
    test('should process reservation sync messages', () => {
      // Creăm un mesaj de sincronizare rezervări
      const testEvent = {
        data: {
          type: 'RESERVATIONS',
          payload: {
            action: 'sync',
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
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că rezervările au fost actualizate
      expect(calendarStore.setReservations).toHaveBeenCalledWith([
        {
          id: 1,
          fullName: 'John Doe',
          startDate: '2023-05-01',
          endDate: '2023-05-05',
          roomNumber: '101'
        }
      ]);
    });
    
    test('should process reservation create messages', () => {
      // Creăm un mesaj de creare rezervare
      const testEvent = {
        data: {
          type: 'RESERVATIONS',
          payload: {
            action: 'create',
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
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că rezervările au fost actualizate
      expect(calendarStore.setReservations).toHaveBeenCalled();
    });
  });
  
  describe('Notification Message Processing', () => {
    test('should process notification messages', () => {
      // Creăm un mesaj de notificare
      const testEvent = {
        data: {
          type: 'NOTIFICATION',
          payload: {
            notification: {
              title: 'Test Notification',
              message: 'This is a test notification',
              type: 'info'
            }
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că notificarea a fost adăugată în chat
      expect(chatStore.addMessage).toHaveBeenCalled();
      
      // Verificăm că automatizările au fost actualizate
      expect(automationStore.updateAutomations).toHaveBeenCalled();
    });
    
    test('should process automation action messages', () => {
      // Creăm un mesaj de acțiune automatizare
      const testEvent = {
        data: {
          type: 'NOTIFICATION',
          payload: {
            notification: {
              title: 'Booking Email Check',
              message: 'Checking for new booking emails',
              type: 'BOOKING_EMAIL'
            },
            action: 'show_calendar'
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că notificarea a fost adăugată în chat
      expect(chatStore.addMessage).toHaveBeenCalled();
      
      // Verificăm că intent-ul a fost setat
      expect(chatStore.setLatestIntent).toHaveBeenCalledWith('show_calendar');
      
      // Verificăm că componenta de afișare a fost setată
      expect(chatStore.setDisplayComponent).toHaveBeenCalledWith('calendar');
    });
  });
  
  describe('History Message Processing', () => {
    test('should process history messages', () => {
      // Creăm un mesaj de istoric
      const testEvent = {
        data: {
          type: 'HISTORY',
          payload: {
            history: {
              title: 'Test History',
              items: [
                {
                  type: 'chat',
                  content: 'Test history item',
                  timestamp: new Date().toISOString()
                }
              ],
              component: 'history'
            }
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că istoricul a fost adăugat în chat
      expect(chatStore.addMessage).toHaveBeenCalled();
      
      // Verificăm că componenta de afișare a fost setată
      expect(chatStore.setDisplayComponent).toHaveBeenCalledWith('history');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid messages gracefully', () => {
      // Creăm un mesaj invalid
      const testEvent = {
        data: {
          // Lipsește tipul
          payload: {
            message: 'Test message'
          }
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că nu s-au apelat funcțiile de store
      expect(chatStore.addMessage).not.toHaveBeenCalled();
      expect(calendarStore.setReservations).not.toHaveBeenCalled();
      expect(automationStore.updateAutomations).not.toHaveBeenCalled();
    });
    
    test('should handle missing payload gracefully', () => {
      // Creăm un mesaj fără payload
      const testEvent = {
        data: {
          type: 'CHAT'
          // Lipsește payload
        }
      };
      
      // Procesăm mesajul
      middlewareStore.processMessage(testEvent);
      
      // Verificăm că nu s-au apelat funcțiile de store
      expect(chatStore.addMessage).not.toHaveBeenCalled();
      expect(calendarStore.setReservations).not.toHaveBeenCalled();
      expect(automationStore.updateAutomations).not.toHaveBeenCalled();
    });
  });
}); 