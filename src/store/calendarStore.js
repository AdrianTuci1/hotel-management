import { create } from "zustand";
import apiService from "../actions/apiService";

export const useCalendarStore = create((set, get) => ({
  rooms: [],
  reservations: [],
  startDate: new Date().toISOString().split("T")[0], // Azi
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  defaultDates: { startDate: "", endDate: "" },

  setDateRange: (start, end) => {
    set({ startDate: start, endDate: end });
  },

  setDefaultDates: (dates) => {
    set({ defaultDates: dates });
  },

  // Verifică disponibilitatea unei camere pentru o perioadă
  isRoomAvailable: (roomNumber, startDate, endDate) => {
    const { reservations } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return !reservations.some(reservation => 
      reservation.rooms.some(room => {
        if (room.roomNumber !== roomNumber) return false;
        const resStart = new Date(room.startDate);
        const resEnd = new Date(room.endDate);
        
        return (
          (start >= resStart && start < resEnd) ||
          (end > resStart && end <= resEnd) ||
          (start <= resStart && end >= resEnd)
        );
      })
    );
  },

  // Obține toate camerele disponibile pentru o perioadă
  getAvailableRooms: (startDate, endDate) => {
    const { rooms, reservations } = get();
    if (!startDate || !endDate) return rooms.map(room => room.number);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return rooms
      .map(room => room.number)
      .filter(roomNumber => {
        return !reservations.some(reservation =>
          reservation.rooms.some(room => {
            if (room.roomNumber !== roomNumber) return false;
            const resStart = new Date(room.startDate);
            const resEnd = new Date(room.endDate);
            
            return (
              (start >= resStart && start < resEnd) ||
              (end > resStart && end <= resEnd) ||
              (start <= resStart && end >= resEnd)
            );
          })
        );
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

  // Helper pentru a găsi o rezervare după ID
  findReservationById: (id) => {
    const { reservations } = get();
    return reservations.find(res => res.id === id);
  },

  // Helper pentru a găsi o cameră într-o rezervare
  findRoomInReservation: (reservationId, roomNumber) => {
    const reservation = get().findReservationById(reservationId);
    if (!reservation) return null;
    return reservation.rooms.find(room => room.roomNumber === roomNumber);
  }
}));