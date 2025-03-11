import React, { useState, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import apiService from "../../actions/apiService";

const ReservationDetails = ({ reservationData, setReservationData, options, onFinalize }) => {
  const { 
    highlightedRoom,
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    isRoomAvailable,
    getRoomInfo,
    setHighlightedRoom,
    clearHighlightedRoom
  } = useRoomOptionsStore();

  const [existingClient, setExistingClient] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isPaid: false,
    hasInvoice: false,
    hasReceipt: false
  });

  // Populăm starea inițială din reservationData
  useEffect(() => {
    if (reservationData) {
      setExistingClient(!!reservationData.existingClientId);
      setPaymentStatus({
        isPaid: reservationData.isPaid || false,
        hasInvoice: reservationData.hasInvoice || false,
        hasReceipt: reservationData.hasReceipt || false
      });
    }
  }, [reservationData]);

  const extractRoomInfo = (option) => {
    const match = option.match(/Camera (\d+) - (\w+) \((\d+) lei\/noapte\)/);
    if (match) {
      return {
        roomNumber: match[1],
        type: match[2],
        basePrice: parseInt(match[3])
      };
    }
    return null;
  };

  const handleMouseEnter = (roomNumber) => {
    setHighlightedRoom(roomNumber);
  };

  const handleMouseLeave = () => {
    clearHighlightedRoom();
  };

  const handleRoomSelect = (roomNumber, basePrice) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (room) {
      removeRoom(roomNumber);
    } else {
      // Adăugăm camera cu perioada și prețul de bază
      addRoom(roomNumber, reservationData?.startDate, reservationData?.endDate);
      updateRoomPrice(roomNumber, basePrice);
    }

    // Actualizăm datele rezervării
    setReservationData({
      ...reservationData,
      rooms: selectedRooms
    });
  };

  const handleRoomPeriodChange = (roomNumber, field, value) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (!room) return;

    const startDate = field === 'startDate' ? value : room.startDate;
    const endDate = field === 'endDate' ? value : room.endDate;
    
    if (isRoomAvailable(roomNumber, startDate, endDate)) {
      updateRoomPeriod(roomNumber, startDate, endDate);
      // Actualizăm datele rezervării
      setReservationData({
        ...reservationData,
        rooms: selectedRooms.map(r => 
          r.roomNumber === roomNumber 
            ? { ...r, startDate, endDate }
            : r
        )
      });
    } else {
      alert("❌ Camera nu este disponibilă pentru perioada selectată!");
    }
  };

  const handleRoomPriceChange = (roomNumber, value) => {
    updateRoomPrice(roomNumber, value);
    // Actualizăm datele rezervării
    setReservationData({
      ...reservationData,
      rooms: selectedRooms.map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, price: value }
          : r
      )
    });
  };

  const handleSave = async () => {
    try {
      // Logica de salvare existentă
      await apiService.createReservation(reservationData);
      onFinalize(); // Apelăm funcția de finalizare după salvare
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
      setReservationData({});
      selectedRooms.forEach(room => removeRoom(room.roomNumber));
    }
  };

  return (
    <div className={styles.reservationDetails}>
      <h4>📅 Detalii rezervare</h4>
      
      {/* Selector Client Existent */}
      <div className={styles.reservationField}>
        <label>
          <input
            type="checkbox"
            checked={existingClient}
            onChange={(e) => setExistingClient(e.target.checked)}
          />
          Client Existent
        </label>
      </div>

      {existingClient ? (
        <div className={styles.reservationField}>
          <label>Selectează Client:</label>
          <select
            value={reservationData.existingClientId || ""}
            onChange={(e) => setReservationData({ ...reservationData, existingClientId: e.target.value })}
          >
            <option value="">Selectează un client</option>
            {/* Aici se vor popula clienții existenți */}
          </select>
        </div>
      ) : (
        <div className={styles.reservationField}>
          <label>Nume Complet:</label>
          <input
            type="text"
            value={reservationData.fullName || ""}
            onChange={(e) => setReservationData({ ...reservationData, fullName: e.target.value })}
            placeholder="Nume și Prenume"
          />
        </div>
      )}

      {/* Date Contact */}
      <div className={styles.reservationField}>
        <label>Telefon:</label>
        <input
          type="tel"
          value={reservationData.phone || ""}
          onChange={(e) => setReservationData({ ...reservationData, phone: e.target.value })}
          placeholder="Telefon"
        />
      </div>
      <div className={styles.reservationField}>
        <label>Email:</label>
        <input
          type="email"
          value={reservationData.email || ""}
          onChange={(e) => setReservationData({ ...reservationData, email: e.target.value })}
          placeholder="Email"
        />
      </div>

      {/* Secțiunea Camere */}
      <div className={styles.roomsSection}>
        <h5>🛏️ Camere Disponibile</h5>
        
        {/* Listă camere disponibile */}
        <div className={styles.availableRooms}>
          <div className={styles.roomsGrid}>
            {options.map((option, index) => {
              const roomInfo = extractRoomInfo(option);
              if (!roomInfo) return null;

              const isSelected = selectedRooms.some(r => r.roomNumber === roomInfo.roomNumber);
              
              return (
                <div 
                  key={index}
                  className={`${styles.roomOption} ${isSelected ? styles.selected : ''}`}
                  onMouseEnter={() => handleMouseEnter(roomInfo.roomNumber)}
                  onMouseLeave={handleMouseLeave}
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
              const roomInfo = options
                .map(extractRoomInfo)
                .find(info => info?.roomNumber === room.roomNumber);

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
                        value={room.startDate || reservationData?.startDate || ""}
                        onChange={(e) => handleRoomPeriodChange(room.roomNumber, 'startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className={styles.reservationField}>
                      <label>Check-out:</label>
                      <input
                        type="date"
                        value={room.endDate || reservationData?.endDate || ""}
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

      {/* Observații */}
      <div className={styles.reservationField}>
        <label>Observații:</label>
        <textarea
          value={reservationData.notes || ""}
          onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
          placeholder="Observații suplimentare..."
          rows={3}
        />
      </div>

      {/* Secțiunea Plată */}
      <div className={styles.paymentSection}>
        <h5>💰 Detalii Plată</h5>
        <div className={styles.paymentOptions}>
          <label>
            <input
              type="checkbox"
              checked={paymentStatus.isPaid}
              onChange={(e) => {
                const newStatus = { ...paymentStatus, isPaid: e.target.checked };
                setPaymentStatus(newStatus);
                setReservationData({ ...reservationData, ...newStatus });
              }}
            />
            Achitat
          </label>
          <label>
            <input
              type="checkbox"
              checked={paymentStatus.hasReceipt}
              onChange={(e) => {
                const newStatus = { ...paymentStatus, hasReceipt: e.target.checked };
                setPaymentStatus(newStatus);
                setReservationData({ ...reservationData, ...newStatus });
              }}
            />
            Bon Fiscal
          </label>
          <label>
            <input
              type="checkbox"
              checked={paymentStatus.hasInvoice}
              onChange={(e) => {
                const newStatus = { ...paymentStatus, hasInvoice: e.target.checked };
                setPaymentStatus(newStatus);
                setReservationData({ ...reservationData, ...newStatus });
              }}
            />
            Factură
          </label>
        </div>
      </div>

      {/* Butoane Acțiuni */}
      <div className={styles.actionButtons}>
        <button 
          className={styles.saveButton} 
          onClick={handleSave}
        >
          <IconDeviceFloppy size={16} />
          Salvează și finalizează
        </button>
        <button 
          className={styles.cancelButton} 
          onClick={onFinalize}
        >
          <IconX size={16} />
          Renunță
        </button>
        <button onClick={handleDelete} className={styles.deleteButton}>
          🗑️ Șterge
        </button>
      </div>
    </div>
  );
};

export default ReservationDetails; 