import { create } from "zustand";
import { useCalendarStore } from "./calendarStore";

export const useReceptionStore = create((set, get) => ({
  // Room statuses
  roomStatuses: [],
  cleaningRooms: [],
  problemRooms: [],
  cleanedRooms: [],
  financials: {
    revenue: "2.350 RON",
    lastSale: "1 apă, 2 cafele, 1 masă restaurant",
  },

  // Initialize with some demo data
  initializeDemoData: () => {
    set({
      cleaningRooms: [105, 203, 310],
      problemRooms: [
        { room: 312, issue: "Aer condiționat defect" },
        { room: 401, issue: "Bec ars" },
      ],
      cleanedRooms: []
    });
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

  // Mark room as dirty (needs cleaning)
  markRoomDirty: async (roomNumber) => {
    set(state => {
      // Check if room is already in cleaning list
      if (state.cleaningRooms.includes(roomNumber)) {
        return state;
      }
      
      return {
        cleaningRooms: [...state.cleaningRooms, roomNumber],
        // Remove from cleaned rooms if it was there
        cleanedRooms: state.cleanedRooms.filter(room => room !== roomNumber)
      };
    });
  },

  // Mark room as clean
  markRoomClean: async (roomNumber) => {
    set(state => ({
      cleaningRooms: state.cleaningRooms.filter(room => room !== roomNumber),
      cleanedRooms: [...state.cleanedRooms, roomNumber]
    }));
  },

  // Report a problem with a room
  reportRoomProblem: async (roomNumber, problem) => {
    set(state => {
      // Check if problem already exists for this room
      const existingProblem = state.problemRooms.find(p => p.room === roomNumber);
      if (existingProblem) {
        return state; // Don't add duplicate problems
      }
      
      return {
        problemRooms: [...state.problemRooms, { room: roomNumber, issue: problem }]
      };
    });
  },

  // Resolve a room problem
  resolveRoomProblem: async (roomNumber) => {
    set(state => ({
      problemRooms: state.problemRooms.filter(problem => problem.room !== roomNumber)
    }));
  },

  // Update financials (demo data)
  updateFinancials: (newFinancials) => {
    set({ financials: newFinancials });
  }
})); 