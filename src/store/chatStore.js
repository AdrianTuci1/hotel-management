import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  displayComponent: null,

  // 🔹 Adăugăm mesaj în chat
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setDisplayComponent: (component) => {
    console.log("🔄 Setăm displayComponent:", component); // Debugging
    set({ displayComponent: component });
  },

  closeDisplayComponent: () => {
    console.log("❌ Închidem panoul activ");
    set({ displayComponent: null });
  },

  // 🔹 Resetăm chat-ul
  resetChat: () => set({ messages: [], displayComponent: null }),
}));