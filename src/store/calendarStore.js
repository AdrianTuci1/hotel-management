import { create } from "zustand";
import apiService from "../actions/apiService";

export const useCalendarStore = create((set, get) => ({
  rooms: [],
  reservations: [],
  startDate: new Date().toISOString().split("T")[0], // Azi
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

  setDateRange: (start, end) => {
    set({ startDate: start, endDate: end });
  },

  // Verifică disponibilitatea unei camere pentru o perioadă
  isRoomAvailable: (roomNumber, startDate, endDate) => {
    const { reservations } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return !reservations.some(reservation => {
      const resStart = new Date(reservation.checkInDate);
      const resEnd = new Date(reservation.checkOutDate);
      
      return (
        reservation.roomNumber === roomNumber &&
        ((start >= resStart && start < resEnd) || // începutul perioadei se suprapune
         (end > resStart && end <= resEnd) || // sfârșitul perioadei se suprapune
         (start <= resStart && end >= resEnd)) // perioada include complet o rezervare existentă
      );
    });
  },

  // Obține toate camerele disponibile pentru o perioadă
  getAvailableRooms: (startDate, endDate) => {
    const { rooms, reservations } = get();
    if (!startDate || !endDate) return rooms.map(room => room.number);

    return rooms
      .map(room => room.number)
      .filter(roomNumber => {
        return !reservations.some(reservation => {
          const resStart = new Date(reservation.checkInDate);
          const resEnd = new Date(reservation.checkOutDate);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          return (
            reservation.roomNumber === roomNumber &&
            ((start >= resStart && start < resEnd) ||
             (end > resStart && end <= resEnd) ||
             (start <= resStart && end >= resEnd))
          );
        });
      });
  },

  // Actualizează perioada de vizualizare bazată pe datele rezervării
  updateViewPeriod: (reservationStartDate, reservationEndDate) => {
    const twoWeeksFromStart = new Date(new Date(reservationStartDate).getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    set({ 
      startDate: reservationStartDate,
      endDate: reservationEndDate > twoWeeksFromStart ? reservationEndDate : twoWeeksFromStart
    });
  },

  fetchRooms: async () => {
    try {
      const roomsData = await apiService.getRooms();
      set({ rooms: roomsData });
    } catch (error) {
      console.error("❌ Eroare la încărcarea camerelor:", error);
    }
  },

  setReservations: (reservations) => {
    console.log("📡 Actualizare rezervări:", reservations);
    set({ reservations });
  },
}));