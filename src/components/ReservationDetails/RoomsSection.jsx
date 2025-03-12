import React from 'react';
import styles from './ReservationDetails.module.css';

const RoomsSection = ({
  options,
  defaultDates,
  selectedRooms,
  reservationData,
  setReservationData,
  isRoomAvailable, // Din calendarStore
  addRoom,         // Din roomOptionsStore
  removeRoom,      // Din roomOptionsStore
  updateRoomPeriod,// Din roomOptionsStore
  updateRoomPrice, // Din roomOptionsStore
  extractRoomInfo
}) => {
  // Handler pentru selectarea/deselectarea unei camere
  const handleRoomSelect = (roomNumber, basePrice) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (room) {
      // Ștergem camera din roomOptionsStore
      removeRoom(roomNumber);
      
      // Actualizăm rooms în reservationData
      setReservationData(prev => ({
        ...prev,
        rooms: prev.rooms?.filter(r => r.roomNumber !== roomNumber) || []
      }));
    } else {
      if (!defaultDates.startDate || !defaultDates.endDate) {
        alert("❌ Vă rugăm să selectați perioada rezervării înainte de a adăuga o cameră!");
        return;
      }

      // Verificăm disponibilitatea folosind calendarStore
      if (!isRoomAvailable(roomNumber, defaultDates.startDate, defaultDates.endDate)) {
        alert("❌ Camera nu este disponibilă pentru perioada selectată!");
        return;
      }
      
      // Adăugăm camera în roomOptionsStore
      addRoom(roomNumber, defaultDates.startDate, defaultDates.endDate);
      updateRoomPrice(roomNumber, basePrice);

      // Actualizăm rooms în reservationData
      const roomInfo = extractRoomInfo(options.find(opt => 
        opt.includes(`Camera ${roomNumber}`)
      ));

      setReservationData(prev => ({
        ...prev,
        rooms: [
          ...(prev.rooms || []),
          {
            roomNumber,
            startDate: defaultDates.startDate,
            endDate: defaultDates.endDate,
            price: basePrice,
            type: roomInfo?.type || "",
            status: "pending"
          }
        ]
      }));
    }
  };

  // Handler pentru modificarea perioadei unei camere
  const handleRoomPeriodChange = (roomNumber, field, value) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (!room) return;

    const startDate = field === 'startDate' ? value : room.startDate;
    const endDate = field === 'endDate' ? value : room.endDate;
    
    // Verificăm disponibilitatea folosind calendarStore
    if (isRoomAvailable(roomNumber, startDate, endDate)) {
      // Actualizăm perioada în roomOptionsStore
      updateRoomPeriod(roomNumber, startDate, endDate);
      
      // Actualizăm datele rezervării
      const updatedRooms = selectedRooms.map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, startDate, endDate }
          : r
      );

      setReservationData(prev => ({
        ...prev,
        rooms: updatedRooms
      }));
    } else {
      alert("❌ Camera nu este disponibilă pentru perioada selectată!");
    }
  };

  // Handler pentru modificarea prețului unei camere
  const handleRoomPriceChange = (roomNumber, value) => {
    // Actualizăm prețul în roomOptionsStore
    updateRoomPrice(roomNumber, value);
    
    // Actualizăm datele rezervării
    setReservationData(prev => ({
      ...prev,
      rooms: selectedRooms.map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, price: value }
          : r
      )
    }));
  };

  return (
    <div className={styles.roomsSection}>
      <h5>🛏️ Camere Disponibile</h5>
      
      {/* Listă camere disponibile */}
      <div className={styles.availableRooms}>
        <div className={styles.roomsGrid}>
          {options.map((option) => {
            const roomInfo = extractRoomInfo(option);
            if (!roomInfo) return null;

            const isSelected = selectedRooms.some(r => r.roomNumber === roomInfo.roomNumber);
            
            return (
              <div 
                key={`room-option-${roomInfo.roomNumber}`}
                className={`${styles.roomOption} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleRoomSelect(roomInfo.roomNumber, roomInfo.basePrice)}
              >
                <div className={styles.roomHeader}>
                  <div className={styles.roomNumber}>Camera {roomInfo.roomNumber}</div>
                  <div className={styles.roomType}>{roomInfo.type}</div>
                </div>
                <div className={styles.roomBasePrice}>
                  Preț de bază: {roomInfo.basePrice} RON/noapte
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Camere Selectate */}
      {selectedRooms.length > 0 && (
        <div className={styles.selectedRooms}>
          <h5>🎯 Camere Selectate</h5>
          {selectedRooms.map((room) => {
            const roomInfo = extractRoomInfo(options.find(opt => 
              opt.includes(`Camera ${room.roomNumber}`)
            ));

            return (
              <div key={room.roomNumber} className={styles.selectedRoomCard}>
                <div className={styles.selectedRoomHeader}>
                  <h6>Camera {room.roomNumber} - {roomInfo?.type}</h6>
                  <button 
                    onClick={() => handleRoomSelect(room.roomNumber)}
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
                      value={room.startDate || ""}
                      onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className={styles.reservationField}>
                    <label>Check-out:</label>
                    <input
                      type="date"
                      value={room.endDate || ""}
                      onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'endDate', e.target.value)}
                      min={room.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className={styles.reservationField}>
                    <label>Preț/noapte:</label>
                    <input
                      type="number"
                      value={room.price || roomInfo?.basePrice || ""}
                      onChange={(e) => handleRoomPriceChange(room.roomNumber, e.target.value)}
                      placeholder="Preț/noapte"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsSection; 