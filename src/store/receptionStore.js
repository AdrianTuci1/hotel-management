import { create } from "zustand";
import { useCalendarStore } from "./calendarStore";

export const useReceptionStore = create((set, get) => ({
  // Demo data until API is ready
  cleaningRooms: [105, 203, 310],
  problemRooms: [
    { room: 312, issue: "Aer condiționat defect" },
    { room: 401, issue: "Bec ars" },
  ],
  cleanedRooms: [],
  financials: {
    revenue: "2.350 RON",
    lastSale: "1 apă, 2 cafele, 1 masă restaurant",
  },

  // Get unconfirmed reservations from calendar store
  getUnconfirmedArrivals: () => {
    const { reservations } = useCalendarStore.getState();
    const today = new Date().toISOString().split('T')[0];
    
    return reservations
      .filter(reservation => {
        // Check if any room in the reservation is for today and not confirmed
        return reservation.rooms.some(room => {
          const roomStartDate = room.startDate.split('T')[0];
          return roomStartDate === today && room.status === "booked";
        });
      })
      .map(reservation => ({
        id: reservation.id,
        name: reservation.guestName,
        rooms: reservation.rooms
          .filter(room => {
            const roomStartDate = room.startDate.split('T')[0];
            return roomStartDate === today && room.status === "booked";
          })
          .map(room => ({
            roomNumber: room.roomNumber,
            status: room.status
          }))
      }));
  },

  // Get departures from calendar store
  getDepartures: () => {
    const { reservations } = useCalendarStore.getState();
    const today = new Date().toISOString().split('T')[0];
    
    return reservations
      .filter(reservation => {
        // Check if any room in the reservation is departing today
        return reservation.rooms.some(room => {
          const roomEndDate = room.endDate.split('T')[0];
          return roomEndDate === today && room.status === "confirmed";
        });
      })
      .map(reservation => ({
        id: reservation.id,
        name: reservation.guestName,
        rooms: reservation.rooms
          .filter(room => {
            const roomEndDate = room.endDate.split('T')[0];
            return roomEndDate === today && room.status === "confirmed";
          })
          .map(room => ({
            roomNumber: room.roomNumber,
            checkOutTime: "12:00" // This should come from the reservation data
          }))
      }));
  },

  // Confirm arrival for specific rooms in a reservation
  confirmArrival: (reservationId, roomNumbers) => {
    const { reservations } = useCalendarStore.getState();
    const updatedReservations = reservations.map(reservation => {
      if (reservation.id === reservationId) {
        return {
          ...reservation,
          rooms: reservation.rooms.map(room => {
            if (roomNumbers.includes(room.roomNumber)) {
              return { ...room, status: "confirmed" };
            }
            return room;
          })
        };
      }
      return reservation;
    });
    
    useCalendarStore.getState().setReservations(updatedReservations);
  },

  // Toggle room cleaning status
  toggleCleanRoom: (roomNumber) => {
    set(state => ({
      cleanedRooms: state.cleanedRooms.includes(roomNumber)
        ? state.cleanedRooms.filter(room => room !== roomNumber)
        : [...state.cleanedRooms, roomNumber]
    }));
  },

  // Update financials (demo data)
  updateFinancials: (newFinancials) => {
    set({ financials: newFinancials });
  }
})); 