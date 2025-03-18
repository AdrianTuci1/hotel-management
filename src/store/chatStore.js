import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid package if not already installed

export const useChatStore = create((set, get) => ({
  messages: [],
  hiddenMessages: {}, // Store for messages temporarily removed from chat
  displayComponent: null,
  latestIntent: null, // Track the latest intent
  latestUserMessage: null, // Track the latest user message
  
  // Stare pentru overlay
  overlay: {
    isVisible: false,
    type: null,
    data: null
  },

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
  restoreMessage: (messageId, markAsCanceled = false) => {
    const state = get();
    const message = state.hiddenMessages[messageId];
    
    if (!message) {
      console.log("⚠️ [CHAT_STORE] Încercare de restaurare a unui mesaj inexistent:", messageId);
      return null;
    }

    const restoredMessage = markAsCanceled
      ? { ...message, isCanceled: true }
      : message;

    const { [messageId]: _, ...remainingHiddenMessages } = state.hiddenMessages;

    // Update state
    set({
      messages: [...state.messages, restoredMessage],
      hiddenMessages: remainingHiddenMessages
    });
    
    console.log("✅ [CHAT_STORE] Mesaj restaurat cu ID:", messageId);
    
    // Return the restored message for confirmation
    return restoredMessage;
  },

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

  // 🔹 Funcții pentru gestionarea overlay-ului
  
  // Deschide un overlay nou
  showOverlay: (type, data) => {
    console.group("🔍 [CHAT_STORE] showOverlay");
    console.log("Tip overlay:", type);
    console.log("Date:", data);
    
    set({
      overlay: {
        isVisible: true,
        type,
        data
      }
    });
    
    console.log("✅ Overlay deschis");
    console.groupEnd();
  },
  
  // Actualizează datele unui overlay existent
  updateOverlayData: (data) => {
    console.log("🔄 [CHAT_STORE] updateOverlayData:", data);
    set(state => ({
      overlay: {
        ...state.overlay,
        data: {
          ...state.overlay.data,
          ...data
        }
      }
    }));
  },
  
  // Închide overlay-ul
  closeOverlay: () => {
    console.group("❌ [CHAT_STORE] closeOverlay");
    
    // Log starea curentă a overlay-ului înainte de închidere pentru debugging
    const currentOverlay = get().overlay;
    console.log("Overlay înainte de închidere:", currentOverlay);
    
    // Dacă overlay-ul are un messageId, afișează un avertisment
    if (currentOverlay.data?.messageId) {
      console.log("⚠️ [CHAT_STORE] Overlay-ul are un messageId asociat:", currentOverlay.data.messageId);
      console.log("⚠️ [CHAT_STORE] Asigurați-vă că este gestionat corespunzător în ChatWindow");
    }
    
    set({
      overlay: {
        isVisible: false,
        type: null,
        data: null
      }
    });
    
    console.log("✅ Overlay închis");
    console.groupEnd();
  },

  // 🔹 Resetăm chat-ul
  resetChat: () => set({ 
    messages: [], 
    hiddenMessages: {}, 
    displayComponent: null,
    latestIntent: null,
    latestUserMessage: null,
    overlay: {
      isVisible: false,
      type: null,
      data: null
    }
  }),
}));