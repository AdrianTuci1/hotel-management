import { create } from 'zustand';

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Setăm ora la 00:00:00 pentru ambele date
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    checkIn: today,
    checkOut: tomorrow
  };
};

const useBookingStore = create((set) => ({
  selectedDates: getDefaultDates(),
  isCalendarOpen: false,
  
  setSelectedDates: (dates) => {
    // Asigurăm că datele sunt obiecte Date
    const processedDates = {
      checkIn: dates.checkIn ? new Date(dates.checkIn) : null,
      checkOut: dates.checkOut ? new Date(dates.checkOut) : null
    };
    set({ selectedDates: processedDates });
  },
  
  setCalendarOpen: (isOpen) => set({ isCalendarOpen: isOpen }),
  
  resetSelection: () => set({ 
    selectedDates: getDefaultDates(),
    isCalendarOpen: false 
  }),
}));

export default useBookingStore; 