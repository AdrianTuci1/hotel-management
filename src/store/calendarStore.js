import { create } from "zustand";
import { io } from "socket.io-client";
import apiService from "../actions/apiService";

const socket = io("http://localhost:5001");

export const useCalendarStore = create((set) => ({
  rooms: [],
  reservations: [],
  startDate: new Date().toISOString().split("T")[0], // Azi
  endDate: (() => {
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 9);
    return futureDate.toISOString().split("T")[0]; // Azi + 9 zile
  })(),

  setDateRange: (start, end) => set({ startDate: start, endDate: end }),

  fetchRooms: async () => {
    try {
      const rooms = await apiService.getRooms();
      set({ rooms });
    } catch (error) {
      console.error("❌ Eroare la încărcarea camerelor:", error);
    }
  },

  // 📡 Ascultăm evenimentul `update_reservations`
  initSocketListeners: () => {
    socket.on("update_reservations", (reservations) => {
      console.log("📡 Rezervări actualizate:", reservations);
      set({ reservations });
    });
  },
}));