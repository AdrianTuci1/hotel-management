import React, { useState, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import apiService from "../../actions/apiService";
import ReservationDetails from "./ReservationDetails";
import RoomOptions from "./RoomOptions";

const ChatMessage = ({ text, type, options, reservation }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const [reservationData, setReservationData] = useState(reservation || {});
  const { setSelectedPeriod } = useRoomOptionsStore();
  const { updateViewPeriod, setReservations } = useCalendarStore();

  // Inițializăm perioada de vizualizare când primim datele rezervării
  useEffect(() => {
    if (reservation?.startDate) {
      updateViewPeriod(reservation.startDate, reservation.endDate);
      setSelectedPeriod(reservation.startDate, reservation.endDate);
    }
  }, [reservation]);

  if (!text) return null;

  const handleOptionSelect = async (option) => {
    addMessage({ text: `✅ Ai selectat: ${option}`, type: "user" });
  
    if (!reservationData || Object.keys(reservationData).length === 0) {
      addMessage({ text: "❌ Informații insuficiente pentru rezervare!", type: "bot" });
      return;
    }
  
    const roomNumberMatch = option.match(/\d+/);
    if (!roomNumberMatch) {
      console.error("❌ Nu s-a putut extrage numărul camerei din opțiune:", option);
      addMessage({ text: "❌ Eroare la selectarea camerei!", type: "bot" });
      return;
    }
    const roomNumber = roomNumberMatch[0];
  
    const updatedReservation = {
      ...reservationData,
      roomNumber,
    };
  
    console.log("📩 Rezervare trimisă către API:", JSON.stringify(updatedReservation, null, 2));
  
    try {
      const response = await apiService.createReservation(updatedReservation);
      console.log("✅ Răspuns API:", response);
      addMessage({ text: `✅ ${response.message}`, type: "bot" });
    } catch (error) {
      console.error("❌ Eroare API:", error);
      addMessage({ text: "❌ Eroare la procesarea rezervării!", type: "bot" });
    }
  };

  const handleReservationDataChange = (newData) => {
    setReservationData(newData);
    if (newData.startDate && newData.endDate) {
      setSelectedPeriod(newData.startDate, newData.endDate);
      updateViewPeriod(newData.startDate, newData.endDate);
    }
  };

  return (
    <div className={`${styles.message} ${type === "bot" ? styles.botMessage : styles.userMessage}`}>
      {text}

      {reservation && (
        <ReservationDetails 
          reservationData={reservationData}
          setReservationData={handleReservationDataChange}
        />
      )}

      {type === "options" && options?.length > 0 && (
        <RoomOptions 
          options={options}
          onOptionSelect={handleOptionSelect}
        />
      )}
    </div>
  );
};

export default ChatMessage;