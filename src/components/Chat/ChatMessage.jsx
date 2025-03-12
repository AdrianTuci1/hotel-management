import React, { useState, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import apiService from "../../actions/apiService";
import ReservationDetails from "./ReservationDetails";
import { IconMinimize, IconMaximize, IconCheck } from "@tabler/icons-react";

const ChatMessage = ({ text, type, options, reservation }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const [reservationData, setReservationData] = useState(reservation);
  const { addRoom, updateRoomPeriod, clearRooms } = useRoomOptionsStore();
  const { updateViewPeriod, setReservations } = useCalendarStore();
  const [isExpanded, setIsExpanded] = useState(!!reservation);
  const [isFinalized, setIsFinalized] = useState(false);

  // Inițializăm perioada de vizualizare când primim datele rezervării
  useEffect(() => {
    if (reservation?.rooms?.[0]) {
      setIsExpanded(true);
      setIsFinalized(false);
      const firstRoom = reservation.rooms[0];
      updateViewPeriod(firstRoom.startDate, firstRoom.endDate);
      // Adăugăm camera și actualizăm perioada ei
      addRoom(firstRoom.roomNumber);
      updateRoomPeriod(firstRoom.roomNumber, firstRoom.startDate, firstRoom.endDate);
    }
  }, [reservation]);

  if (!text) return null;

  const handleReservationDataChange = (newData) => {
    setReservationData(newData);
    if (newData.rooms?.[0]) {
      const firstRoom = newData.rooms[0];
      updateViewPeriod(firstRoom.startDate, firstRoom.endDate);
      // Actualizăm perioada pentru camera selectată
      updateRoomPeriod(firstRoom.roomNumber, firstRoom.startDate, firstRoom.endDate);
    }
  };

  const handleFinalizeReservation = () => {
    setIsFinalized(true);
    setIsExpanded(false);
    clearRooms(); // Curățăm starea camerelor selectate
    
    // Adăugăm un mesaj de confirmare
    addMessage({
      type: "bot",
      text: `Rezervare finalizată cu succes pentru camera ${reservationData.rooms[0].roomNumber} în perioada ${reservationData.rooms[0].startDate} - ${reservationData.rooms[0].endDate}.`,
    });
  };

  const toggleExpand = () => {
    if (!isFinalized) {
      setIsExpanded(!isExpanded);
    }
  };

  const messageClasses = [
    styles.message,
    type === "bot" ? styles.botMessage : styles.userMessage,
    reservationData && !isFinalized ? styles.hasReservation : '',
    reservationData && isFinalized ? `${styles.hasReservation} ${styles.finalized}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={messageClasses}>
      <div className={styles.messageHeader}>
        <div className={styles.messageText}>
          <p>{text}</p>
          {reservationData && !isFinalized && (
            <button 
              className={styles.expandButton} 
              onClick={toggleExpand}
            >
              {isExpanded ? (
                <>
                  <IconMinimize size={16} />
                  Minimizează detaliile rezervării
                </>
              ) : (
                <>
                  <IconMaximize size={16} />
                  Vezi detaliile rezervării
                </>
              )}
            </button>
          )}
          {reservationData && isFinalized && (
            <div className={styles.finalizedBadge}>
              <IconCheck size={16} />
              Rezervare finalizată
            </div>
          )}
        </div>
      </div>

      {reservationData && isExpanded && !isFinalized && (
        <ReservationDetails 
          reservationData={reservationData}
          setReservationData={handleReservationDataChange}
          options={options}
          onFinalize={handleFinalizeReservation}
        />
      )}
    </div>
  );
};

export default ChatMessage;