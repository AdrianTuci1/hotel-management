import { create } from "zustand";
import { useCalendarStore } from "./calendarStore";

const useRoomOptionsStore = create((set, get) => ({
  /**
   * Camera curent evidențiată în calendar sau în lista de camere
   * Folosit în:
   * - CalendarView: pentru evidențierea vizuală a camerei în tabel
   * - RoomsSection: pentru evidențierea camerei în lista de opțiuni
   */
  highlightedRoom: null,
  
  /**
   * Lista camerelor selectate pentru rezervarea curentă
   * Fiecare cameră conține: roomNumber, startDate, endDate, price, type, status
   * Folosit în:
   * - ReservationDetails: pentru gestionarea camerelor selectate
   * - CalendarView: pentru afișarea perioadelor selectate
   */
  selectedRooms: [],
  
  /**
   * Setează camera evidențiată
   * @param {string} roomNumber - Numărul camerei de evidențiat
   * Folosit în:
   * - RoomsSection: la hover pe o cameră
   * - CalendarView: la hover pe o celulă din calendar
   */
  setHighlightedRoom: (roomNumber) => set({ highlightedRoom: roomNumber }),
  
  /**
   * Șterge evidențierea camerei curente
   * Folosit în:
   * - RoomsSection: la ieșirea de pe o cameră
   * - ReservationDetails: la finalizarea rezervării
   */
  clearHighlightedRoom: () => set({ highlightedRoom: null }),
  
  /**
   * Adaugă o cameră în lista de selecție
   * @param {string} roomNumber - Numărul camerei
   * @param {string} startDate - Data de început (opțional)
   * @param {string} endDate - Data de sfârșit (opțional)
   * Folosit în:
   * - ReservationDetails: la selectarea unei camere noi
   * - ChatMessage: la inițializarea unei rezervări existente
   */
  addRoom: (roomNumber, startDate = "", endDate = "") => {
    const { selectedRooms } = get();
    if (selectedRooms.some(room => room.roomNumber === roomNumber)) return;
    
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
          type: roomInfo?.type || "Standard",
          status: "pending"
        }
      ]
    });
  },
  
  /**
   * Elimină o cameră din lista de selecție
   * @param {string} roomNumber - Numărul camerei de eliminat
   * Folosit în:
   * - RoomsSection: la deselectarea unei camere
   */
  removeRoom: (roomNumber) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.filter(room => room.roomNumber !== roomNumber)
    });
  },
  
  /**
   * Actualizează perioada pentru o cameră selectată
   * @param {string} roomNumber - Numărul camerei
   * @param {string} startDate - Noua dată de început
   * @param {string} endDate - Noua dată de sfârșit
   * Folosit în:
   * - RoomsSection: la modificarea perioadei unei camere
   * - ChatMessage: la inițializarea unei rezervări existente
   */
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
  
  /**
   * Actualizează prețul pentru o cameră selectată
   * @param {string} roomNumber - Numărul camerei
   * @param {number} price - Noul preț
   * Folosit în:
   * - RoomsSection: la modificarea prețului unei camere
   */
  updateRoomPrice: (roomNumber, price) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.map(room =>
        room.roomNumber === roomNumber
          ? { ...room, price: Number(price) }
          : room
      )
    });
  },

  /**
   * Actualizează statusul unei camere
   * @param {string} roomNumber - Numărul camerei
   * @param {string} status - Noul status (pending/confirmed/etc)
   * Folosit în:
   * - ReservationDetails: la salvarea rezervării
   */
  updateRoomStatus: (roomNumber, status) => {
    const { selectedRooms } = get();
    set({
      selectedRooms: selectedRooms.map(room =>
        room.roomNumber === roomNumber
          ? { ...room, status }
          : room
      )
    });
  },
  
  /**
   * Obține informații despre o cameră
   * @param {string} roomNumber - Numărul camerei
   * @returns {Object|null} Informații despre cameră (tip, preț de bază)
   * Folosit în:
   * - RoomsSection: la afișarea detaliilor camerei
   */
  getRoomInfo: (roomNumber) => {
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

  /**
   * Șterge toate camerele selectate
   * Folosit în:
   * - ReservationDetails: la finalizarea sau anularea rezervării
   * - ChatMessage: la minimizarea detaliilor rezervării
   */
  clearRooms: () => set({ selectedRooms: [] }),
  
  /**
   * Resetează întreaga stare a store-ului
   * Folosit în:
   * - ReservationDetails: la ștergerea rezervării
   */
  reset: () => set({
    highlightedRoom: null,
    selectedRooms: []
  })
}));

export default useRoomOptionsStore; 