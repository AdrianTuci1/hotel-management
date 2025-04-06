import {
  initializeChat,
  handleChatMessage,
  sendAutomationAction,
  sendReservationAction,
  INCOMING_MESSAGE_TYPES,
  OUTGOING_MESSAGE_TYPES,
  CHAT_INTENTS,
  RESPONSE_TYPES,
} from '../actions';
import { useChatStore } from '../store/chatStore';
import useMiddlewareStore from '../store/middleware';

// Mock dependencies
jest.mock('../store/chatStore');
jest.mock('../store/middleware');

// Mock the worker module, creating jest.fn() directly in the factory
jest.mock('../actions/socket/worker', () => ({
  initializeWorker: jest.fn(),
  getWorker: jest.fn(),
  sendMessage: jest.fn(),
  sendAutomationAction: jest.fn(),
  sendReservationAction: jest.fn(),
}));

// Import the mocked functions *after* jest.mock
// These will now be the jest.fn() instances created above
import {
  initializeWorker as mockWorkerInitializeWorker,
  getWorker as mockWorkerGetWorker,
  sendMessage as mockWorkerSendMessage, // Alias if needed elsewhere
  sendAutomationAction as mockWorkerSendAutomationAction,
  sendReservationAction as mockWorkerSendReservationAction, // Alias if needed elsewhere
} from '../actions/socket/worker';

// Mock WebSocket implementation remains the same
const mockWebSocket = {
  send: jest.fn(),
};
global.WebSocket = jest.fn(() => mockWebSocket);

// Mock implementations for stores
const mockAddMessage = jest.fn();
const mockProcessMessage = jest.fn();
const mockSendMessage = jest.fn(); // This is for the middleware store
const mockSendAutomationAction = jest.fn(); // This is for the middleware store
const mockSendReservationAction = jest.fn(); // This is for the middleware store

// Configure mock return values for stores
useChatStore.getState = jest.fn().mockReturnValue({ addMessage: mockAddMessage });
useMiddlewareStore.getState = jest.fn().mockReturnValue({
  processMessage: mockProcessMessage,
  sendMessage: mockSendMessage,
  sendAutomationAction: mockSendAutomationAction,
  sendReservationAction: mockSendReservationAction,
});

// --- Mock Worker Setup ---
const mockWorkerInstance = {
  postMessage: jest.fn(),
  onmessage: null,
  onerror: null,
};

// Configure return values for the *imported* mocked worker functions
mockWorkerInitializeWorker.mockResolvedValue(mockWorkerInstance);
mockWorkerGetWorker.mockReturnValue(mockWorkerInstance);

// Keep this import block for automation actions
import {
  checkBookingEmails,
  checkWhatsAppMessages,
  analyzePrices,
} from '../actions/automation';
import { AUTOMATION_ACTIONS } from '../actions/types';

describe('Actions - chatActions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reconfigure default mock returns for stores
    useChatStore.getState = jest.fn().mockReturnValue({ addMessage: mockAddMessage });
    useMiddlewareStore.getState = jest.fn().mockReturnValue({
      processMessage: mockProcessMessage,
      sendMessage: mockSendMessage,
      sendAutomationAction: mockSendAutomationAction,
      sendReservationAction: mockSendReservationAction,
    });

    // Reset imported worker mock functions
    mockWorkerInitializeWorker.mockResolvedValue(mockWorkerInstance);
    mockWorkerGetWorker.mockReturnValue(mockWorkerInstance);
    // Clear mocks using the imported references
    mockWorkerInitializeWorker.mockClear();
    mockWorkerGetWorker.mockClear();
    mockWorkerSendMessage.mockClear();
    mockWorkerSendAutomationAction.mockClear();
    mockWorkerSendReservationAction.mockClear();

    // Reset worker instance state
    mockWorkerInstance.postMessage.mockClear();
    mockWorkerInstance.onmessage = null;
  });

  describe('initializeChat', () => {
    test('should initialize worker and set onmessage handler', async () => {
      await initializeChat();

      expect(mockWorkerInitializeWorker).toHaveBeenCalledTimes(1);
      expect(mockWorkerInstance.onmessage).toBeInstanceOf(Function);

      // Simulate receiving a message
      const testEvent = { data: { type: 'test', payload: 'hello' } };
      if (mockWorkerInstance.onmessage) {
        mockWorkerInstance.onmessage(testEvent);
      }

      expect(mockProcessMessage).toHaveBeenCalledTimes(1);
      expect(mockProcessMessage).toHaveBeenCalledWith(testEvent);
    });

    test('should handle failure during worker initialization', async () => {
      mockWorkerInitializeWorker.mockResolvedValueOnce(null); // Simulate failure
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await initializeChat();

      expect(mockWorkerInitializeWorker).toHaveBeenCalledTimes(1);
      expect(mockWorkerInstance.onmessage).toBeNull();
      expect(mockProcessMessage).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [CHAT_ACTIONS] Failed to initialize chat'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleChatMessage', () => {
    test('should add user message and send formatted message via middleware', async () => {
      const testMessage = 'Hello, I want to book a room';
      mockWorkerGetWorker.mockReturnValue(mockWorkerInstance); // Ensure worker exists

      await handleChatMessage(testMessage);

      expect(mockAddMessage).toHaveBeenCalledTimes(1);
      expect(mockAddMessage).toHaveBeenCalledWith({ text: testMessage, type: 'user' });

      expect(mockSendMessage).toHaveBeenCalledTimes(1); // Check middleware's sendMessage
      const expectedFormattedMessage = {
        type: 'CHAT_MESSAGE',
        content: testMessage
      };
      expect(mockSendMessage).toHaveBeenCalledWith(expectedFormattedMessage, mockWorkerInstance);
    });

    test('should initialize worker if it does not exist', async () => {
      const testMessage = 'Test message';
      mockWorkerGetWorker.mockReturnValueOnce(null); // Simulate worker not existing initially
      mockWorkerInitializeWorker.mockResolvedValue(mockWorkerInstance); // Worker initializes successfully

      await handleChatMessage(testMessage);

      expect(mockWorkerGetWorker).toHaveBeenCalledTimes(1); // Only called once inside handleChatMessage
      expect(mockWorkerInitializeWorker).toHaveBeenCalledTimes(1); // Called because worker was null
      expect(mockAddMessage).toHaveBeenCalledWith({ text: testMessage, type: 'user' });
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
    });

    test('should handle error during message sending and attempt reconnect', async () => {
      const testMessage = 'Another message';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      
      mockWorkerGetWorker.mockReturnValue(mockWorkerInstance); // Ensure worker exists
      // Simulate middleware's sendMessage failing
      mockSendMessage.mockImplementation(() => { throw new Error('Send failed'); });

      await handleChatMessage(testMessage);

      expect(mockAddMessage).toHaveBeenCalledTimes(2); 
      expect(mockAddMessage).toHaveBeenCalledWith({ text: testMessage, type: 'user' });
      expect(mockAddMessage).toHaveBeenCalledWith({
        type: 'error',
        text: 'Sorry, there was an error communicating with the server. Please try again.',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [CHAT_ACTIONS] Error sending message:', expect.any(Error)
      );
      // Check reconnect logic (initializeChat is called via setTimeout)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(setTimeoutSpy.mock.calls[0][0]).toBe(initializeChat);

      consoleErrorSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('sendAutomationAction', () => {
    test('should send automation action via middleware if worker exists', () => {
      const testAction = 'CHECK_BOOKING';
      mockWorkerGetWorker.mockReturnValue(mockWorkerInstance);
      // Assume middleware action returns true
      mockSendAutomationAction.mockReturnValue(true); 

      const result = sendAutomationAction(testAction);

      expect(mockWorkerGetWorker).toHaveBeenCalledTimes(1);
      expect(mockSendAutomationAction).toHaveBeenCalledTimes(1);
      expect(mockSendAutomationAction).toHaveBeenCalledWith(testAction, mockWorkerInstance);
      expect(result).toBe(true);
    });

    test('should return false and log error if worker does not exist', () => {
      const testAction = 'CHECK_WHATSAPP';
      mockWorkerGetWorker.mockReturnValue(null); 
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = sendAutomationAction(testAction);

      expect(mockWorkerGetWorker).toHaveBeenCalledTimes(1);
      expect(mockSendAutomationAction).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [CHAT_ACTIONS] Worker not available for automation action'
      );
      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendReservationAction', () => {
    test('should send reservation action via middleware if worker exists', () => {
      const testAction = 'create';
      const testData = { guestName: 'John Doe', roomNumber: '101' };
      mockWorkerGetWorker.mockReturnValue(mockWorkerInstance);
      // Assume middleware action returns true
      mockSendReservationAction.mockReturnValue(true);

      const result = sendReservationAction(testAction, testData);

      expect(mockWorkerGetWorker).toHaveBeenCalledTimes(1);
      expect(mockSendReservationAction).toHaveBeenCalledTimes(1);
      expect(mockSendReservationAction).toHaveBeenCalledWith(testAction, testData, mockWorkerInstance);
      expect(result).toBe(true);
    });

    test('should return false and log error if worker does not exist', () => {
      const testAction = 'update';
      const testData = { id: 123, status: 'confirmed' };
      mockWorkerGetWorker.mockReturnValue(null);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = sendReservationAction(testAction, testData);

      expect(mockWorkerGetWorker).toHaveBeenCalledTimes(1);
      expect(mockSendReservationAction).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [CHAT_ACTIONS] Worker not available for reservation action'
      );
      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  // TODO: Remove or implement the remaining placeholder test
  /*
  test('should handle incoming chat message for reservation intent', () => {
    // TODO: Implement test for handleChatMessage with reservation intent
    // This might involve testing the middleware's processMessage logic
    // or setting up specific message flows.
  });
  */
});

describe('Actions - automation', () => {
  beforeEach(() => {
    // Reset mocks using the imported references
    mockWorkerSendAutomationAction.mockClear();
    mockWorkerGetWorker.mockClear();
    mockWorkerGetWorker.mockReturnValue(mockWorkerInstance);
  });

  // Tests now use mockWorkerSendAutomationAction directly from the top-level mock
  test('checkBookingEmails should call worker sendAutomationAction with BOOKING_EMAIL', () => {
    mockWorkerSendAutomationAction.mockReturnValue(true); // Simulate success
    const result = checkBookingEmails();

    expect(mockWorkerSendAutomationAction).toHaveBeenCalledTimes(1);
    expect(mockWorkerSendAutomationAction).toHaveBeenCalledWith(AUTOMATION_ACTIONS.BOOKING_EMAIL);
    expect(result).toBe(true);
  });

  test('checkWhatsAppMessages should call worker sendAutomationAction with WHATSAPP_MESSAGE', () => {
    mockWorkerSendAutomationAction.mockReturnValue(true); // Simulate success
    const result = checkWhatsAppMessages();

    expect(mockWorkerSendAutomationAction).toHaveBeenCalledTimes(1);
    expect(mockWorkerSendAutomationAction).toHaveBeenCalledWith(AUTOMATION_ACTIONS.WHATSAPP_MESSAGE);
    expect(result).toBe(true);
  });

  test('analyzePrices should call worker sendAutomationAction with PRICE_ANALYSIS', () => {
    mockWorkerSendAutomationAction.mockReturnValue(true); // Simulate success
    const result = analyzePrices();

    expect(mockWorkerSendAutomationAction).toHaveBeenCalledTimes(1);
    expect(mockWorkerSendAutomationAction).toHaveBeenCalledWith(AUTOMATION_ACTIONS.PRICE_ANALYSIS);
    expect(result).toBe(true);
  });

  test('automation actions should return false if worker sendAutomationAction fails', () => {
    mockWorkerSendAutomationAction.mockReturnValue(false); // Simulate failure

    const resultBooking = checkBookingEmails();
    const resultWhatsApp = checkWhatsAppMessages();
    const resultPrices = analyzePrices();

    expect(mockWorkerSendAutomationAction).toHaveBeenCalledTimes(3);
    expect(resultBooking).toBe(false);
    expect(resultWhatsApp).toBe(false);
    expect(resultPrices).toBe(false);
  });
}); 