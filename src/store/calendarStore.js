import { create } from "zustand";
import apiService from "../actions/apiService";

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

  setReservations: (reservations) => {
    console.log("📡 Actualizare rezervări:", reservations);
    set({ reservations: [...reservations] }); // 🔥 Copiem datele pentru a forța React să redea UI
  },
}));