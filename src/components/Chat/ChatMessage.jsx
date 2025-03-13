import React, { useState, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import apiService from "../../actions/apiService";
import ReservationDetails from "../ReservationDetails";
import { IconMinimize, IconMaximize, IconCheck } from "@tabler/icons-react";

const ChatMessage = ({ text, type, reservation, onShowReservationDetails }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const { updateViewPeriod, isRoomAvailable, setDefaultDates: setCalendarDefaultDates } = useCalendarStore();
  const {
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    getRoomInfo,
    setHighlightedRoom,
    reset
  } = useRoomOptionsStore();

  // Local state
  const [reservationData, setReservationData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [defaultDates, setDefaultDates] = useState({ startDate: "", endDate: "" });

  // Curățăm state-ul la montare/demontare
  useEffect(() => {
    reset();
    return () => reset();
  }, []);

  // Sincronizăm defaultDates cu CalendarStore
  useEffect(() => {
    setCalendarDefaultDates(defaultDates);
  }, [defaultDates]);

  // Inițializăm datele când primim o rezervare nouă
  useEffect(() => {
    if (reservation) {
      // Reset state
      reset();
      setIsFinalized(false);
      
      // Initialize reservation data
      const initialData = {
        id: reservation.id,
        fullName: reservation.fullName || reservation.guestName || "",
        phone: reservation.phone || "",
        email: reservation.email || "",
        notes: reservation.notes || "",
        isPaid: reservation.isPaid || false,
        hasInvoice: reservation.hasInvoice || false,
        hasReceipt: reservation.hasReceipt || false,
        rooms: reservation.rooms || [] // Adăugăm rooms direct în initialData
      };

      // Handle different reservation models
      if (reservation.rooms) {
        // Existing reservation from calendar
        const firstRoom = reservation.rooms[0];
        setDefaultDates({
          startDate: firstRoom.startDate,
          endDate: firstRoom.endDate
        });
        updateViewPeriod(firstRoom.startDate, firstRoom.endDate);

        // Add all rooms from the reservation
        reservation.rooms.forEach(room => {
          addRoom(room.roomNumber, room.startDate, room.endDate);
          updateRoomPrice(room.roomNumber, room.price || room.basePrice);
          setHighlightedRoom(room.roomNumber);
        });
      } else {
        // New reservation from chat
        setDefaultDates({
          startDate: reservation.startDate || "",
          endDate: reservation.endDate || ""
        });
        
        if (reservation.startDate && reservation.endDate) {
          updateViewPeriod(reservation.startDate, reservation.endDate);
        }
      }

      setReservationData(initialData);
      setIsExpanded(true);
    }
  }, [reservation?.id]);

  // Extragem informații despre cameră din opțiune
  const extractRoomInfo = (roomNumber) => {
    const roomInfo = getRoomInfo(roomNumber);
    if (roomInfo) {
      return {
        roomNumber,
        type: roomInfo.type,
        basePrice: roomInfo.basePrice
      };
    }
    return null;
  };

  const handleReservationDataChange = (newData) => {
    setReservationData(newData);
  };

  const handleSaveReservation = async () => {
    try {
      // Prepare final data
      const finalData = {
        ...reservationData,
        rooms: selectedRooms.map(room => ({
          ...room,
          type: getRoomInfo(room.roomNumber)?.type || "Standard"
        }))
      };

      // Save to API
      await apiService.createReservation(finalData);

      // Add confirmation message
      if (selectedRooms[0]) {
        const room = selectedRooms[0];
        addMessage({
          type: "bot",
          text: `Rezervare finalizată cu succes pentru camera ${room.roomNumber} în perioada ${room.startDate} - ${room.endDate}.`
        });
      }

      // Update UI
      setIsFinalized(true);
      setIsExpanded(false);
      reset();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert("❌ A apărut o eroare la salvarea rezervării!");
    }
  };

  const handleCloseReservation = () => {
    setIsExpanded(false);
    setReservationData(null);
  };

  const handleDeleteReservation = () => {
    if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
      setIsExpanded(false);
      setReservationData(null);
      reset();
    }
  };

  const toggleExpand = () => {
    if (!isFinalized) {
      if (isExpanded) {
        setIsExpanded(false);
        setReservationData(null);
      } else {
        setIsExpanded(true);
        if (reservation?.rooms) {
          // Repopulate rooms when expanding
          reservation.rooms.forEach(room => {
            addRoom(room.roomNumber, room.startDate, room.endDate);
            updateRoomPrice(room.roomNumber, room.price || room.basePrice);
            setHighlightedRoom(room.roomNumber);
          });
        }
      }
    }
  };

  const handleReservationClick = () => {
    if (reservation) {
      onShowReservationDetails(reservation);
    }
  };

  if (!text) return null;

  const messageClasses = [
    styles.message,
    type === "bot" ? styles.botMessage : styles.userMessage,
    isExpanded ? styles.expanded : "",
    reservationData && !isFinalized ? styles.hasReservation : "",
    reservationData && isFinalized ? `${styles.hasReservation} ${styles.finalized}` : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={messageClasses} onClick={handleReservationClick}>
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
          onFinalize={handleSaveReservation}
          onCancel={handleCloseReservation}
          onDelete={handleDeleteReservation}
          roomManagement={{
            selectedRooms: reservationData.rooms?.length ? reservationData.rooms : selectedRooms,
            defaultDates,
            isRoomAvailable,
            addRoom,
            removeRoom,
            updateRoomPeriod,
            updateRoomPrice,
            getRoomInfo,
            setHighlightedRoom,
            extractRoomInfo,
            setDefaultDates
          }}
        />
      )}
    </div>
  );
};

export default ChatMessage;