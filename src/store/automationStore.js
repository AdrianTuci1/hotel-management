import { create } from "zustand";

export const AUTOMATION_TYPES = {
  WHATSAPP: "whatsapp_message",
  EMAIL: "booking_email",
  PRICE: "price_analysis"
};

export const useAutomationStore = create((set, get) => ({
  // Stare pentru automatizări
  automations: {
    [AUTOMATION_TYPES.WHATSAPP]: [],
    [AUTOMATION_TYPES.EMAIL]: [],
    [AUTOMATION_TYPES.PRICE]: []
  },

  // Stare pentru statusul automatizărilor
  status: {
    [AUTOMATION_TYPES.WHATSAPP]: false,
    [AUTOMATION_TYPES.EMAIL]: false,
    [AUTOMATION_TYPES.PRICE]: false
  },

  // Stare pentru erori
  errors: {
    [AUTOMATION_TYPES.WHATSAPP]: null,
    [AUTOMATION_TYPES.EMAIL]: null,
    [AUTOMATION_TYPES.PRICE]: null
  },

  // 🔹 Actualizăm automatizările primite de la socket
  updateAutomations: (type, data) => set((state) => {
    // Verificăm dacă tipul este valid
    if (!Object.values(AUTOMATION_TYPES).includes(type)) {
      console.error(`Invalid automation type: ${type}`);
      return state;
    }

    return {
      automations: {
        ...state.automations,
        [type]: [...state.automations[type], data]
      }
    };
  }),

  // 🔹 Actualizăm statusul unei automatizări
  updateStatus: (type, isRunning) => set((state) => {
    if (!Object.values(AUTOMATION_TYPES).includes(type)) {
      console.error(`Invalid automation type: ${type}`);
      return state;
    }

    return {
      status: {
        ...state.status,
        [type]: isRunning
      }
    };
  }),

  // 🔹 Actualizăm erorile
  updateError: (type, error) => set((state) => {
    if (!Object.values(AUTOMATION_TYPES).includes(type)) {
      console.error(`Invalid automation type: ${type}`);
      return state;
    }

    return {
      errors: {
        ...state.errors,
        [type]: error
      }
    };
  }),

  // 🔹 Resetăm erorile
  resetErrors: () => set((state) => ({
    errors: {
      [AUTOMATION_TYPES.WHATSAPP]: null,
      [AUTOMATION_TYPES.EMAIL]: null,
      [AUTOMATION_TYPES.PRICE]: null
    }
  })),

  // 🔹 Curățăm toate datele
  clearAutomations: () => set((state) => ({
    automations: {
      [AUTOMATION_TYPES.WHATSAPP]: [],
      [AUTOMATION_TYPES.EMAIL]: [],
      [AUTOMATION_TYPES.PRICE]: []
    },
    status: {
      [AUTOMATION_TYPES.WHATSAPP]: false,
      [AUTOMATION_TYPES.EMAIL]: false,
      [AUTOMATION_TYPES.PRICE]: false
    },
    errors: {
      [AUTOMATION_TYPES.WHATSAPP]: null,
      [AUTOMATION_TYPES.EMAIL]: null,
      [AUTOMATION_TYPES.PRICE]: null
    }
  }))
})); 