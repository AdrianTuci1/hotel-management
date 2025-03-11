import React from "react";
import styles from "./ChatMessage.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";

const ReservationDetails = ({ reservationData, setReservationData }) => {
  const { setSelectedPeriod } = useRoomOptionsStore();
  const { updateViewPeriod } = useCalendarStore();

  const handleDateChange = (field, value) => {
    const newData = { ...reservationData, [field]: value };
    setReservationData(newData);

    // Actualizăm perioada în store pentru a recalcula disponibilitatea
    if ((field === 'startDate' && reservationData.endDate) || 
        (field === 'endDate' && reservationData.startDate)) {
      const startDate = field === 'startDate' ? value : reservationData.startDate;
      const endDate = field === 'endDate' ? value : reservationData.endDate;
      
      // Actualizăm perioada în RoomOptionsStore
      setSelectedPeriod(startDate, endDate);
      
      // Actualizăm perioada de vizualizare în calendar
      updateViewPeriod(startDate, endDate);
    }
  };

  return (
    <div className={styles.reservationDetails}>
      <h4>📅 Detalii rezervare</h4>
      <div className={styles.reservationField}>
        <label>Nume client:</label>
        <input
          type="text"
          value={reservationData.guestName || ""}
          onChange={(e) => setReservationData({ ...reservationData, guestName: e.target.value })}
        />
      </div>
      <div className={styles.reservationField}>
        <label>Tip cameră:</label>
        <input
          type="text"
          value={reservationData.roomType || ""}
          onChange={(e) => setReservationData({ ...reservationData, roomType: e.target.value })}
        />
      </div>
      <div className={styles.reservationField}>
        <label>Check-in:</label>
        <input
          type="date"
          value={reservationData.startDate || ""}
          onChange={(e) => handleDateChange('startDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]} // Nu permitem date din trecut
        />
      </div>
      <div className={styles.reservationField}>
        <label>Check-out:</label>
        <input
          type="date"
          value={reservationData.endDate || ""}
          onChange={(e) => handleDateChange('endDate', e.target.value)}
          min={reservationData.startDate || new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
};

export default ReservationDetails; 