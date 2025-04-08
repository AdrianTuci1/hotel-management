// --- Mocking Dependencies --- (Only mock stores)
// jest.mock('../actions/socket/worker', ...); // Eliminat - Testăm handler-ele direct
// jest.mock('../actions/socket/messageParser'); // Eliminat
jest.mock('../store/chatStore');
jest.mock('../store/calendarStore');

// --- Now Imports ---
// import { initializeChat } from '../actions/chatActions'; // Eliminat
import { useChatStore } from '../store/chatStore';
import { useCalendarStore } from '../store/calendarStore';
import { CHAT_INTENTS } from '../actions/types'; 
// Importăm direct handler-ele pe care le testăm
import { handleOverlayAction } from '../actions/handlers/overlayHandler';
import { handleAppointmentsUpdate } from '../actions/handlers/appointmentHandler';
import { handleHistoryUpdate } from '../actions/handlers/historyHandler';
import {
    overlayViewSwitchData,
    overlayOpenReservationData,
    appointmentsInitData,
    historyMixedData
} from './demoData';



// --- Mock state and actions for stores --- 
const mockChatStoreState = {
  addMessage: jest.fn(),
  setDisplayComponent: jest.fn(),
  showOverlay: jest.fn(),
  setLatestIntent: jest.fn(),
};
const mockCalendarStoreState = {
  setAppointments: jest.fn(),
  getAppointments: jest.fn(() => []), 
};


// --- Test Suite --- Focus on Handlers ---

describe('Message Handlers Logic', () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Configure store mocks
    useChatStore.getState.mockReturnValue(mockChatStoreState);
    useCalendarStore.getState.mockReturnValue(mockCalendarStoreState);

    // Nu mai e nevoie de setup pentru parser sau worker
  });

  // Helper `simulateMessage` a fost eliminat.

  // --- Test Cases for Handlers --- 
  
  describe('handleOverlayAction', () => {
      test('should set display component for view switch action', () => {
        // Apelăm direct handler-ul cu datele de test
        handleOverlayAction(overlayViewSwitchData);
    
        // Verificăm că funcțiile corecte din store au fost apelate
        expect(mockChatStoreState.setLatestIntent).toHaveBeenCalledWith(CHAT_INTENTS.SHOW_STOCK);
        expect(mockChatStoreState.setDisplayComponent).toHaveBeenCalledTimes(1);
        expect(mockChatStoreState.setDisplayComponent).toHaveBeenCalledWith('stock'); 
        expect(mockChatStoreState.showOverlay).not.toHaveBeenCalled();
      });
    
      test('should show overlay for overlay open action', () => {
        // Apelăm direct handler-ul
         handleOverlayAction(overlayOpenReservationData);
    
         // Verificăm store-ul
         expect(mockChatStoreState.setLatestIntent).toHaveBeenCalledWith(CHAT_INTENTS.RESERVATION);
         expect(mockChatStoreState.showOverlay).toHaveBeenCalledTimes(1);
         expect(mockChatStoreState.showOverlay).toHaveBeenCalledWith(CHAT_INTENTS.RESERVATION, overlayOpenReservationData.payload);
         expect(mockChatStoreState.setDisplayComponent).not.toHaveBeenCalled();
       });
  });

  describe('handleAppointmentsUpdate', () => {
      test('should set appointments on init action', () => {
        // Apelăm direct handler-ul
         handleAppointmentsUpdate(appointmentsInitData);
    
         // Verificăm store-ul
         expect(mockCalendarStoreState.setAppointments).toHaveBeenCalledTimes(1);
         expect(mockCalendarStoreState.setAppointments).toHaveBeenCalledWith(appointmentsInitData.data.appointments);
       });
      
       // TODO: Adaugă teste similare pentru acțiunile CREATE, UPDATE, DELETE din handleAppointmentsUpdate
  });

  describe('handleHistoryUpdate', () => {
      test('should add messages correctly for mixed history entries', () => {
        // Apelăm direct handler-ul
         handleHistoryUpdate(historyMixedData);
    
         // Verificăm că addMessage a fost apelat pentru fiecare item
         expect(mockChatStoreState.addMessage).toHaveBeenCalledTimes(historyMixedData.data.items.length);
         
         // Verificări specifice pentru fiecare tip de intrare
         expect(mockChatStoreState.addMessage).toHaveBeenCalledWith(expect.objectContaining({
           text: "Problema raportată pentru camera 205.",
           type: "ai", 
           intent: CHAT_INTENTS.ROOM_PROBLEM,
         }));
         expect(mockChatStoreState.addMessage).toHaveBeenCalledWith(expect.objectContaining({
           type: "notification",
           notification: expect.objectContaining({ title: "Verificare Email" }),
         }));
         expect(mockChatStoreState.addMessage).toHaveBeenCalledWith(expect.objectContaining({
           text: "Eveniment: user_login - success",
           type: "system",
         }));
       });

       // TODO: Adaugă teste pentru cazuri specifice din handleHistoryUpdate (ex: paginare, item invalid)
  });

}); 