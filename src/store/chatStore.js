import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid package if not already installed

export const useChatStore = create((set, get) => ({
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
  setLatestIntent: (intent) => {
    console.group("📩 [CHAT_STORE] setLatestIntent");
    console.log("Intent primit:", intent);
    
    // Verificăm dacă intent-ul este valid
    if (!intent) {
      console.warn("⚠️ Intent gol sau invalid");
      console.groupEnd();
      return;
    }
    
    // Verificăm dacă este același intent ca cel curent
    const currentIntent = get().latestIntent;
    if (currentIntent === intent) {
      console.log("ℹ️ Intent deja setat:", intent);
      console.groupEnd();
      return;
    }
    
    console.log("✅ Actualizăm latestIntent:", intent);
    console.groupEnd();
    set({ latestIntent: intent });
  },

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

  // 🔹 Setăm componenta UI activă pentru afișare
  setDisplayComponent: (component) => {
    console.group("🔄 [CHAT_STORE] setDisplayComponent");
    console.log("Componenta cerută:", component);
    
    // HOTEL-BACKEND FORMAT SPECIAL CASE
    if (component === 'show_calendar') {
      console.log("🎯🎯🎯 [CHAT_STORE] HOTEL-BACKEND FORMAT DETECTED - HIGHEST PRIORITY");
      console.trace("SHOW_CALENDAR DETECTED - Stack trace:");
      
      // Setăm direct componenta calendar
      set({ displayComponent: 'calendar' });
      
      // Verificăm că a fost setată corect
      setTimeout(() => {
        console.log("🔄 [CHAT_STORE] Verificare setare: displayComponent =", get().displayComponent);
        
        if (get().displayComponent !== 'calendar') {
          console.log("⚠️ [CHAT_STORE] FORȚARE SETARE CALENDAR după eroare!");
          set({ displayComponent: 'calendar' });
        } else {
          console.log("✅ [CHAT_STORE] Calendar setat corect!");
        }
      }, 50);
      
      console.groupEnd();
      return;
    }
    
    // Special case pentru calendar - foarte important pentru debugging
    if (component === 'calendar' || component === 'CALENDAR' || 
        component === 'show_calendar' || component === 'SHOW_CALENDAR') {
      console.log("📅📅📅 [CHAT_STORE] CALENDAR SPECIAL CASE DETECTED");
      console.trace("Calendar component stack trace:");
      
      // Pentru calendar, facem normalizare directă pentru consistență
      component = 'calendar';
      console.log("Componenta normalizată direct la:", component);
    }
    
    // Dacă primim string gol sau null, nu modificăm
    if (!component) {
      console.warn("⚠️ Încercare de a seta displayComponent cu valoare goală");
      console.groupEnd();
      return;
    }
    
    // Normalizăm componenta pentru a asigura consistență
    const normalizedComponent = typeof component === 'string' ? component.toLowerCase() : component;
    console.log("Componenta normalizată:", normalizedComponent);
    
    // Verificăm dacă deja avem aceeași componentă activă
    const currentComponent = get().displayComponent;
    if (currentComponent === normalizedComponent) {
      console.log("ℹ️ Componenta este deja activă:", normalizedComponent);
      console.groupEnd();
      return;
    }
    
    // Setăm componenta nouă și informăm
    console.log("✅ Actualizăm componenta la:", normalizedComponent);
    set({ displayComponent: normalizedComponent });
    
    // Extra logging pentru confirmare
    setTimeout(() => {
      console.log("🔄 [CHAT_STORE] displayComponent a fost setat la:", normalizedComponent);
      console.log("🔄 [CHAT_STORE] Verificare stare:", get().displayComponent);
    }, 0);
    
    console.groupEnd();
  },

  // 🔹 Închidem panoul activ
  closeDisplayComponent: () => {
    console.log("❌ [CHAT_STORE] Închidem panoul activ");
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