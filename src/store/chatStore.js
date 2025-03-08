import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  displayComponent: null,

  // 🔹 Adăugăm un mesaj în chat
  addMessage: (text, type, options = null, formFields = null) =>
    set((state) => ({
      messages: [...state.messages, { text, type, options, formFields }],
    })),

  // 🔹 Setăm panoul UI activ
  setDisplayComponent: (component) => set({ displayComponent: component }),

  // 🔹 Închidem panoul activ
  closeDisplayPanel: () => set({ displayComponent: null }),

  clearMessages: () => set({ messages: [] }),
}));