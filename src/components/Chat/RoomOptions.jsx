import React from "react";
import styles from "./ChatMessage.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";

const RoomOptions = ({ options, onOptionSelect, reservation }) => {
  const { 
    setHighlightedRoom, 
    clearHighlightedRoom,
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    isRoomAvailable,
    getRoomInfo
  } = useRoomOptionsStore();

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

    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (room) {
      removeRoom(roomNumber);
    } else {
      // Adăugăm camera cu perioada predefinită din rezervare dacă există
      addRoom(roomNumber, reservation?.startDate, reservation?.endDate);
    }

    onOptionSelect(option);
  };

  const handleRoomPeriodChange = (roomNumber, field, value) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (!room) return;

    const startDate = field === 'startDate' ? value : room.startDate;
    const endDate = field === 'endDate' ? value : room.endDate;
    
    if (isRoomAvailable(roomNumber, startDate, endDate)) {
      updateRoomPeriod(roomNumber, startDate, endDate);
    } else {
      alert("❌ Camera nu este disponibilă pentru perioada selectată!");
    }
  };

  const handleRoomPriceChange = (roomNumber, value) => {
    updateRoomPrice(roomNumber, value);
  };

  // Filtrăm opțiunile pentru a arăta doar camerele disponibile primele
  const sortedOptions = [...options].sort((a, b) => {
    const roomNumberA = a.match(/\d+/)?.[0];
    const roomNumberB = b.match(/\d+/)?.[0];
    
    if (!roomNumberA || !roomNumberB) return 0;
    
    const roomA = selectedRooms.find(r => r.roomNumber === roomNumberA);
    const roomB = selectedRooms.find(r => r.roomNumber === roomNumberB);
    
    if (roomA && !roomB) return -1;
    if (!roomA && roomB) return 1;
    return 0;
  });

  return (
    <div className={styles.optionsContainer}>
      <h4>🛏️ Selectează camere</h4>
      
      <div className={styles.roomsGrid}>
        {sortedOptions.map((option, index) => {
          const roomNumber = option.match(/\d+/)?.[0];
          if (!roomNumber) return null;

          const roomInfo = getRoomInfo(roomNumber, options);
          const isSelected = selectedRooms.some(r => r.roomNumber === roomNumber);
          
          return (
            <div 
              key={index}
              className={`${styles.roomOption} ${isSelected ? styles.selected : ''}`}
              onMouseEnter={() => handleMouseEnter(option)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleOptionClick(option)}
            >
              <div className={styles.roomHeader}>
                <div className={styles.roomNumber}>Camera {roomNumber}</div>
                {roomInfo && <div className={styles.roomType}>{roomInfo.type}</div>}
              </div>
              {roomInfo && (
                <div className={styles.roomBasePrice}>
                  Preț de bază: {roomInfo.basePrice} RON/noapte
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedRooms.length > 0 && (
        <div className={styles.selectedRooms}>
          <h5>🎯 Camere Selectate</h5>
          {selectedRooms.map((room) => (
            <div key={room.roomNumber} className={styles.selectedRoomCard}>
              <div className={styles.selectedRoomHeader}>
                <h6>Camera {room.roomNumber} - {getRoomInfo(room.roomNumber, options)?.type}</h6>
                <button 
                  onClick={() => removeRoom(room.roomNumber)}
                  className={styles.removeRoomButton}
                >
                  ✖
                </button>
              </div>
              <div className={styles.selectedRoomDetails}>
                <div className={styles.reservationField}>
                  <label>Check-in:</label>
                  <input
                    type="date"
                    value={room.startDate || reservation?.startDate || ""}
                    onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.reservationField}>
                  <label>Check-out:</label>
                  <input
                    type="date"
                    value={room.endDate || reservation?.endDate || ""}
                    onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'endDate', e.target.value)}
                    min={room.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.reservationField}>
                  <label>Preț/noapte:</label>
                  <input
                    type="number"
                    value={room.price}
                    onChange={(e) => handleRoomPriceChange(room.roomNumber, e.target.value)}
                    placeholder="Preț/noapte"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomOptions; 