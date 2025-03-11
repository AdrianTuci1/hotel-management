import React, { useState, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import apiService from "../../actions/apiService";
import ReservationDetails from "./ReservationDetails";

const ChatMessage = ({ text, type, options, reservation }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const [reservationData, setReservationData] = useState(reservation || {});
  const { addRoom, updateRoomPeriod } = useRoomOptionsStore();
  const { updateViewPeriod, setReservations } = useCalendarStore();

  // Inițializăm perioada de vizualizare când primim datele rezervării
  useEffect(() => {
    if (reservation?.startDate && reservation?.roomNumber) {
      updateViewPeriod(reservation.startDate, reservation.endDate);
      // Adăugăm camera și actualizăm perioada ei
      addRoom(reservation.roomNumber);
      updateRoomPeriod(reservation.roomNumber, reservation.startDate, reservation.endDate);
    }
  }, [reservation]);

  if (!text) return null;

  const handleReservationDataChange = (newData) => {
    setReservationData(newData);
    if (newData.startDate && newData.endDate && newData.roomNumber) {
      updateViewPeriod(newData.startDate, newData.endDate);
      // Actualizăm perioada pentru camera selectată
      updateRoomPeriod(newData.roomNumber, newData.startDate, newData.endDate);
    }
  };

  return (
    <div className={`${styles.message} ${type === "bot" ? styles.botMessage : styles.userMessage}`}>
      {text}

      {reservation && (
        <ReservationDetails 
          reservationData={reservationData}
          setReservationData={handleReservationDataChange}
          options={options}
        />
      )}
    </div>
  );
};

export default ChatMessage;