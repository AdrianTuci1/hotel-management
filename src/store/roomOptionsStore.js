import { create } from "zustand";
import { useCalendarStore } from "./calendarStore";

// Simulăm datele despre tipurile de camere (în practică ar veni din API/bază de date)
const ROOM_TYPES = {
  "101": { type: "Single", basePrice: 200 },
  "102": { type: "Double", basePrice: 300 },
  "103": { type: "Twin", basePrice: 300 },
  "201": { type: "Apartament", basePrice: 500 },
  "202": { type: "Triple", basePrice: 400 },
  "203": { type: "Suite", basePrice: 600 }
};

const useRoomOptionsStore = create((set, get) => ({
  // Starea pentru camera evidențiată în calendar
  highlightedRoom: null,
  
  // Starea pentru camerele selectate
  selectedRooms: [],
  
  // Funcții pentru gestionarea camerei evidențiate
  setHighlightedRoom: (roomNumber) => set({ highlightedRoom: roomNumber }),
  clearHighlightedRoom: () => set({ highlightedRoom: null }),
  
  // Funcții pentru gestionarea camerelor selectate
  addRoom: (roomNumber, startDate = "", endDate = "") => {
    const { selectedRooms } = get();
    if (selectedRooms.some(room => room.roomNumber === roomNumber)) return;
    
    // Obținem informațiile despre cameră din options
    const calendarStore = useCalendarStore.getState();
    const roomInfo = calendarStore.rooms.find(r => r.number === roomNumber);
    
    set({
      selectedRooms: [
        ...selectedRooms,
        {
          roomNumber,
          startDate,
          endDate,
          price: roomInfo?.basePrice || 0,
          type: roomInfo?.type || "Standard"
        }
      ]
    });
  },
  
  removeRoom: (roomNumber) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.filter(room => room.roomNumber !== roomNumber)
    });
  },
  
  updateRoomPeriod: (roomNumber, startDate, endDate) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.map(room =>
        room.roomNumber === roomNumber
          ? { ...room, startDate, endDate }
          : room
      )
    });
  },
  
  updateRoomPrice: (roomNumber, price) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.map(room =>
        room.roomNumber === roomNumber
          ? { ...room, price }
          : room
      )
    });
  },
  
  // Verifică disponibilitatea unei camere pentru o perioadă
  isRoomAvailable: (roomNumber, startDate, endDate) => {
    const calendarStore = useCalendarStore.getState();
    return calendarStore.isRoomAvailable(roomNumber, startDate, endDate);
  },
  
  // Obține toate camerele disponibile pentru o perioadă
  getAvailableRooms: (startDate, endDate) => {
    const calendarStore = useCalendarStore.getState();
    return calendarStore.getAvailableRooms(startDate, endDate);
  },
  
  // Obține informații despre tipul camerei
  getRoomInfo: (roomNumber, options) => {
    const calendarStore = useCalendarStore.getState();
    const roomFromCalendar = calendarStore.rooms.find(r => r.number === roomNumber);
    if (roomFromCalendar) {
      return {
        type: roomFromCalendar.type,
        basePrice: roomFromCalendar.basePrice
      };
    }
    return null;
  },
  
  // Resetează starea
  reset: () => set({
    highlightedRoom: null,
    selectedRooms: []
  })
}));

export default useRoomOptionsStore; 