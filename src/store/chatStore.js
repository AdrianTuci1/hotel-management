import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid package if not already installed

export const useChatStore = create((set) => ({
  messages: [],
  hiddenMessages: {}, // Store for messages temporarily removed from chat
  displayComponent: null,
  latestIntent: null, // Track the latest intent
  latestUserMessage: null, // Track the latest user message

  // 🔹 Adăugăm mesaj în chat
  addMessage: (message) => set((state) => {
    // Generate a unique ID for the message if not provided
    const messageWithId = {
      ...message,
      id: message.id || uuidv4()
    };
    
    // Track user messages separately
    const newState = { messages: [...state.messages, messageWithId] };
    if (messageWithId.type === "user") {
      newState.latestUserMessage = messageWithId.text;
    }
    
    return newState;
  }),

  // 🔹 Set latest intent
  setLatestIntent: (intent) => set({ latestIntent: intent }),

  // 🔹 Remove a message temporarily from chat
  removeMessage: (messageId) => set((state) => {
    const messageIndex = state.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return state;

    const message = state.messages[messageIndex];
    const newMessages = [...state.messages];
    newMessages.splice(messageIndex, 1);

    return {
      messages: newMessages,
      hiddenMessages: {
        ...state.hiddenMessages,
        [messageId]: message
      }
    };
  }),

  // 🔹 Restore a message to chat
  restoreMessage: (messageId, markAsCanceled = false) => set((state) => {
    const message = state.hiddenMessages[messageId];
    if (!message) return state;

    const restoredMessage = markAsCanceled
      ? { ...message, isCanceled: true }
      : message;

    const { [messageId]: _, ...remainingHiddenMessages } = state.hiddenMessages;

    return {
      messages: [...state.messages, restoredMessage],
      hiddenMessages: remainingHiddenMessages
    };
  }),

  setDisplayComponent: (component) => {
    console.log("🔄 Setăm displayComponent:", component); // Debugging
    set({ displayComponent: component });
  },

  closeDisplayComponent: () => {
    console.log("❌ Închidem panoul activ");
    set({ displayComponent: null });
  },

  // 🔹 Resetăm chat-ul
  resetChat: () => set({ 
    messages: [], 
    hiddenMessages: {}, 
    displayComponent: null,
    latestIntent: null,
    latestUserMessage: null
  }),
}));