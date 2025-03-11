import React from "react";
import styles from "./ChatMessage.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";

const RoomOptions = ({ options, onOptionSelect }) => {
  const { 
    setHighlightedRoom, 
    clearHighlightedRoom,
    selectedPeriod 
  } = useRoomOptionsStore();

  const { isRoomAvailable, getAvailableRooms } = useCalendarStore();

  const handleMouseEnter = (option) => {
    const roomNumber = option.match(/\d+/)?.[0];
    if (roomNumber) {
      setHighlightedRoom(roomNumber);
    }
  };

  const handleMouseLeave = () => {
    clearHighlightedRoom();
  };

  const handleOptionClick = (option) => {
    const roomNumber = option.match(/\d+/)?.[0];
    if (!roomNumber) return;

    if (!selectedPeriod.startDate || !selectedPeriod.endDate) {
      alert("❌ Te rog selectează perioada de cazare înainte de a alege camera!");
      return;
    }

    if (!isRoomAvailable(roomNumber, selectedPeriod.startDate, selectedPeriod.endDate)) {
      alert("❌ Camera nu este disponibilă pentru perioada selectată!");
      return;
    }

    onOptionSelect(option);
  };

  const getAvailabilityMessage = (roomNumber) => {
    if (!selectedPeriod.startDate || !selectedPeriod.endDate) {
      return "⚠️ Selectează perioada";
    }
    return isRoomAvailable(roomNumber, selectedPeriod.startDate, selectedPeriod.endDate) 
      ? "✅ Disponibilă" 
      : "❌ Indisponibilă";
  };

  // Filtrăm opțiunile pentru a arăta doar camerele disponibile primele
  const sortedOptions = [...options].sort((a, b) => {
    const roomNumberA = a.match(/\d+/)?.[0];
    const roomNumberB = b.match(/\d+/)?.[0];
    
    if (!selectedPeriod.startDate || !selectedPeriod.endDate) return 0;
    
    const isAvailableA = roomNumberA ? isRoomAvailable(roomNumberA, selectedPeriod.startDate, selectedPeriod.endDate) : false;
    const isAvailableB = roomNumberB ? isRoomAvailable(roomNumberB, selectedPeriod.startDate, selectedPeriod.endDate) : false;
    
    if (isAvailableA === isAvailableB) return 0;
    return isAvailableA ? -1 : 1;
  });

  return (
    <div className={styles.optionsContainer}>
      <h4>🛏️ Selectează o cameră</h4>
      {!selectedPeriod.startDate || !selectedPeriod.endDate ? (
        <div className={styles.warning}>
          ⚠️ Te rog selectează perioada de cazare înainte de a alege camera
        </div>
      ) : null}
      {sortedOptions.map((option, index) => {
        const roomNumber = option.match(/\d+/)?.[0];
        const isAvailable = roomNumber && selectedPeriod.startDate && selectedPeriod.endDate
          ? isRoomAvailable(roomNumber, selectedPeriod.startDate, selectedPeriod.endDate)
          : true;
        const availabilityMessage = getAvailabilityMessage(roomNumber);
        
        return (
          <div key={index} className={styles.optionWrapper}>
            <button
              className={`${styles.optionButton} ${!isAvailable ? styles.unavailable : ''}`}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => handleMouseEnter(option)}
              onMouseLeave={handleMouseLeave}
              disabled={!isAvailable}
            >
              {option}
            </button>
            <span className={`${styles.availabilityStatus} ${!isAvailable ? styles.unavailableText : styles.availableText}`}>
              {availabilityMessage}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RoomOptions; 