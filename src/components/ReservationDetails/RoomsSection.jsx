import React from 'react';
import styles from './ReservationDetails.module.css';
import { useCalendarStore } from '../../store/calendarStore';
import useRoomOptionsStore from '../../store/roomOptionsStore';

const RoomsSection = ({ setReservationData }) => {
  // Get state and actions from stores
  const { 
    rooms: calendarRooms,
    defaultDates, 
    setDefaultDates, 
    isRoomAvailable 
  } = useCalendarStore(state => ({
    rooms: state.rooms,
    defaultDates: state.defaultDates,
    setDefaultDates: state.setDefaultDates,
    isRoomAvailable: state.isRoomAvailable
  }));

  const { 
    selectedRooms, 
    addRoom, 
    removeRoom, 
    updateRoomPeriod, 
    updateRoomPrice, 
    getRoomInfo, 
    setHighlightedRoom 
  } = useRoomOptionsStore(state => ({
    selectedRooms: state.selectedRooms,
    addRoom: state.addRoom,
    removeRoom: state.removeRoom,
    updateRoomPeriod: state.updateRoomPeriod,
    updateRoomPrice: state.updateRoomPrice,
    getRoomInfo: state.getRoomInfo,
    setHighlightedRoom: state.setHighlightedRoom
  }));

  // Handler pentru modificarea perioadei de verificare
  const handleCheckPeriodChange = (field, value) => {
    const newDates = {
      ...defaultDates,
      [field]: value
    };
    setDefaultDates(newDates);
  };

  // Verifică dacă o cameră este disponibilă în perioada selectată
  const isRoomAvailableInPeriod = (roomNumber) => {
    if (!defaultDates.startDate || !defaultDates.endDate) return true;
    return isRoomAvailable(roomNumber, defaultDates.startDate, defaultDates.endDate);
  };

  // Handler pentru selectarea/deselectarea unei camere
  const handleRoomSelect = (roomNumber) => {
    const isSelected = selectedRooms.some(r => r.roomNumber === roomNumber);
    if (isSelected) {
      // Ștergem camera din roomOptionsStore
      removeRoom(roomNumber);
      
      // Actualizăm rooms în reservationData (passed up via prop)
      setReservationData(prev => ({
        ...prev,
        rooms: prev.rooms?.filter(r => r.roomNumber !== roomNumber) || []
      }));
    } else {
      // Get room info
      const roomInfo = getRoomInfo(roomNumber);
      const basePrice = roomInfo?.basePrice || 0;
      
      // Adăugăm camera în roomOptionsStore
      addRoom(roomNumber, defaultDates.startDate, defaultDates.endDate);
      updateRoomPrice(roomNumber, basePrice);

      // Actualizăm rooms în reservationData (passed up via prop)
      setReservationData(prev => ({
        ...prev,
        rooms: [
          ...(prev.rooms || []),
          {
            roomNumber,
            startDate: defaultDates.startDate || "",
            endDate: defaultDates.endDate || "",
            price: basePrice,
            type: roomInfo?.type || "Standard",
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
      
      // Actualizăm datele rezervării (passed up via prop)
      setReservationData(prev => ({
        ...prev,
        rooms: (prev.rooms || []).map(r => 
          r.roomNumber === roomNumber 
            ? { ...r, startDate, endDate }
            : r
        )
      }));
    } else {
      alert("❌ Camera nu este disponibilă pentru perioada selectată!");
    }
  };

  // Handler pentru modificarea prețului unei camere
  const handleRoomPriceChange = (roomNumber, value) => {
    const price = parseFloat(value) || 0;
    // Actualizăm prețul în roomOptionsStore
    updateRoomPrice(roomNumber, price);
    
    // Actualizăm datele rezervării (passed up via prop)
    setReservationData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, price }
          : r
      )
    }));
  };

  // Handler pentru confirmarea unei camere
  const handleRoomConfirm = (roomNumber) => {
    setReservationData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, status: "confirmed" }
          : r
      )
    }));
  };

  // Filtrăm camerele disponibile pentru perioada selectată
  const availableRooms = calendarRooms.filter(room => 
    isRoomAvailableInPeriod(room.number) || 
    selectedRooms.some(r => r.roomNumber === room.number)
  );

  return (
    <div className={styles.roomsSection}>
      {/* Perioada pentru verificarea disponibilității */}
      <div className={styles.defaultDates}>
        <h5>📅 Verificare Disponibilitate</h5>
        <div className={styles.dateInputs}>
          <div className={styles.reservationField}>
            <label>De la:</label>
            <input
              type="date"
              value={defaultDates.startDate || ""}
              onChange={(e) => handleCheckPeriodChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className={styles.reservationField}>
            <label>Până la:</label>
            <input
              type="date"
              value={defaultDates.endDate || ""}
              onChange={(e) => handleCheckPeriodChange('endDate', e.target.value)}
              min={defaultDates.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <h5>🛏️ Camere Disponibile {defaultDates.startDate && defaultDates.endDate ? `(${availableRooms.length})` : ''}</h5>
      
      {/* Listă camere disponibile */}
      <div className={styles.availableRooms}>
        <div className={styles.roomsGrid}>
          {availableRooms.map((room) => {
            const isSelected = selectedRooms.some(r => r.roomNumber === room.number);
            
            return (
              <div 
                key={`room-option-${room.number}`}
                className={`${styles.roomOption} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleRoomSelect(room.number)}
                onMouseEnter={() => setHighlightedRoom(room.number)}
                onMouseLeave={() => setHighlightedRoom(null)}
              >
                <div className={styles.roomHeader}>
                  <div className={styles.roomNumber}>Camera {room.number}</div>
                  <div className={styles.roomType}>{room.type}</div>
                </div>
                <div className={styles.roomBasePrice}>
                  {room.basePrice} RON/noapte
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
            const roomInfo = getRoomInfo(room.roomNumber);
            const reservationRoomData = (setReservationData && typeof setReservationData === 'function') 
              ? (setReservationData?.rooms || []).find(r => r.roomNumber === room.roomNumber)
              : {};
            const isConfirmed = reservationRoomData?.status === "confirmed";

            return (
              <div key={room.roomNumber} className={`${styles.selectedRoomCard} ${isConfirmed ? styles.confirmed : ''}`}>
                <div className={styles.selectedRoomHeader}>
                  <h6>Camera {room.roomNumber} - {roomInfo?.type}</h6>
                  <div className={styles.roomActions}>
                    {!isConfirmed && (
                      <button 
                        onClick={() => handleRoomConfirm(room.roomNumber)}
                        className={styles.confirmButton}
                      >
                        ✓ Confirmă
                      </button>
                    )}
                    <button 
                      onClick={() => handleRoomSelect(room.roomNumber)}
                      className={styles.removeRoomButton}
                    >
                      ✖
                    </button>
                  </div>
                </div>
                <div className={styles.selectedRoomDetails}>
                  <div className={styles.reservationField}>
                    <label>Check-in:</label>
                    <input
                      type="date"
                      value={room.startDate || ""}
                      onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={isConfirmed}
                    />
                  </div>
                  <div className={styles.reservationField}>
                    <label>Check-out:</label>
                    <input
                      type="date"
                      value={room.endDate || ""}
                      onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'endDate', e.target.value)}
                      min={room.startDate || new Date().toISOString().split('T')[0]}
                      disabled={isConfirmed}
                    />
                  </div>
                  <div className={styles.reservationField}>
                    <label>Preț/noapte:</label>
                    <input
                      type="number"
                      value={room.price !== undefined ? room.price : (roomInfo?.basePrice || "")}
                      onChange={(e) => handleRoomPriceChange(room.roomNumber, e.target.value)}
                      disabled={isConfirmed}
                      step="10"
                    />
                    <span>RON</span>
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