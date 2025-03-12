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
    getRoomInfo,
    setHighlightedRoom,
    clearHighlightedRoom
  } = useRoomOptionsStore();

  const {
    updateViewPeriod,
    getAvailableRooms,
    isRoomAvailable
  } = useCalendarStore();

  const [existingClient, setExistingClient] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isPaid: false,
    hasInvoice: false,
    hasReceipt: false
  });
  
  // Adăugăm state temporar pentru perioada implicită
  const [defaultDates, setDefaultDates] = useState({
    startDate: "",
    endDate: ""
  });

  // Populăm starea inițială din reservationData
  useEffect(() => {
    if (reservationData) {
      // Resetăm camerele selectate la fiecare schimbare a reservationData
      selectedRooms.forEach(room => removeRoom(room.roomNumber));

      setExistingClient(!!reservationData.existingClientId);
      setPaymentStatus({
        isPaid: reservationData.isPaid || false,
        hasInvoice: reservationData.hasInvoice || false,
        hasReceipt: reservationData.hasReceipt || false
      });

      // Actualizăm datele rezervării cu informațiile despre client
      const updatedData = {
        ...reservationData,
        fullName: reservationData.guestName || reservationData.fullName || "",
        notes: reservationData.preferences || reservationData.notes || "",
      };
      setReservationData(updatedData);

      // Setăm datele implicite pentru perioada și actualizăm vizualizarea calendarului
      if (reservationData.startDate && reservationData.endDate) {
        setDefaultDates({
          startDate: reservationData.startDate,
          endDate: reservationData.endDate
        });

        // Actualizăm perioada de vizualizare în calendar
        updateViewPeriod(reservationData.startDate, reservationData.endDate);

        // Dacă avem camere în reservationData, le adăugăm
        if (reservationData.rooms?.length > 0) {
          reservationData.rooms.forEach(room => {
            addRoom(room.roomNumber, room.startDate, room.endDate);
            updateRoomPrice(room.roomNumber, room.price);
          });
        }

        // Dacă avem și roomType, găsim camera potrivită în opțiuni
        if (reservationData.roomType) {
          const roomInfo = options
            .map(extractRoomInfo)
            .find(info => info?.type.toLowerCase() === reservationData.roomType.toLowerCase());

          if (roomInfo) {
            // Verificăm disponibilitatea camerei pentru perioada selectată
            const isAvailable = isRoomAvailable(
              roomInfo.roomNumber,
              reservationData.startDate,
              reservationData.endDate
            );

            // Actualizăm rooms în reservationData doar dacă camera este disponibilă
            if (isAvailable) {
              setReservationData(prev => ({
                ...prev,
                rooms: [{
                  roomNumber: roomInfo.roomNumber,
                  startDate: reservationData.startDate,
                  endDate: reservationData.endDate,
                  type: reservationData.roomType,
                  status: "pending"
                }]
              }));
            }
          }
        }
      }
    }
  }, [reservationData?.id]);

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
      
      // Actualizăm rooms în reservationData
      setReservationData(prev => ({
        ...prev,
        rooms: prev.rooms?.filter(r => r.roomNumber !== roomNumber) || []
      }));
    } else {
      // Folosim datele implicite pentru perioada
      if (!defaultDates.startDate || !defaultDates.endDate) {
        alert("❌ Vă rugăm să selectați perioada rezervării înainte de a adăuga o cameră!");
        return;
      }

      // Verificăm disponibilitatea camerei pentru perioada implicită
      if (!isRoomAvailable(roomNumber, defaultDates.startDate, defaultDates.endDate)) {
        alert("❌ Camera nu este disponibilă pentru perioada selectată!");
        return;
      }
      
      addRoom(roomNumber, defaultDates.startDate, defaultDates.endDate);
      updateRoomPrice(roomNumber, basePrice);

      // Actualizăm rooms în reservationData
      const roomInfo = options
        .map(extractRoomInfo)
        .find(info => info?.roomNumber === roomNumber);

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

  const handleRoomPeriodChange = (roomNumber, field, value) => {
    const room = selectedRooms.find(r => r.roomNumber === roomNumber);
    if (!room) return;

    const startDate = field === 'startDate' ? value : room.startDate;
    const endDate = field === 'endDate' ? value : room.endDate;
    
    if (isRoomAvailable(roomNumber, startDate, endDate)) {
      updateRoomPeriod(roomNumber, startDate, endDate);
      
      // Actualizăm datele rezervării și perioada de vizualizare
      const updatedRooms = selectedRooms.map(r => 
        r.roomNumber === roomNumber 
          ? { ...r, startDate, endDate }
          : r
      );

      setReservationData(prev => ({
        ...prev,
        rooms: updatedRooms
      }));

      // Actualizăm perioada de vizualizare în calendar
      updateViewPeriod(startDate, endDate);
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
      // Validăm datele înainte de salvare
      if (!reservationData.fullName && !reservationData.guestName) {
        alert("❌ Vă rugăm să completați numele clientului!");
        return;
      }

      if (!selectedRooms.length) {
        alert("❌ Vă rugăm să selectați cel puțin o cameră!");
        return;
      }

      // Pregătim datele pentru salvare
      const dataToSave = {
        ...reservationData,
        guestName: reservationData.fullName || reservationData.guestName,
        preferences: reservationData.notes || reservationData.preferences,
        rooms: selectedRooms.map(room => ({
          ...room,
          type: options
            .map(extractRoomInfo)
            .find(info => info?.roomNumber === room.roomNumber)?.type || ""
        }))
      };

      await apiService.createReservation(dataToSave);
      onFinalize();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert("❌ A apărut o eroare la salvarea rezervării!");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
      setReservationData({});
      selectedRooms.forEach(room => removeRoom(room.roomNumber));
    }
  };

  // Funcție pentru a verifica disponibilitatea camerelor pentru perioada curentă
  const getAvailableRoomsForCurrentPeriod = () => {
    if (!defaultDates.startDate || !defaultDates.endDate) return [];
    return getAvailableRooms(defaultDates.startDate, defaultDates.endDate);
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
            onChange={(e) => setReservationData(prev => ({
              ...prev,
              fullName: e.target.value,
              guestName: e.target.value
            }))}
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
            {options.map((option) => {
              const roomInfo = extractRoomInfo(option);
              if (!roomInfo) return null;

              const isSelected = selectedRooms.some(r => r.roomNumber === roomInfo.roomNumber);
              
              return (
                <div 
                  key={`room-option-${roomInfo.roomNumber}`}
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