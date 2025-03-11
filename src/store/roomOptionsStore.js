import { create } from "zustand";

const useRoomOptionsStore = create((set) => ({
  highlightedRoom: null,
  selectedPeriod: {
    startDate: null,
    endDate: null
  },
  
  setHighlightedRoom: (roomNumber) => set({ highlightedRoom: roomNumber }),
  clearHighlightedRoom: () => set({ highlightedRoom: null }),
  
  setSelectedPeriod: (startDate, endDate) => {
    set({ selectedPeriod: { startDate, endDate } });
  }
}));

export default useRoomOptionsStore; 