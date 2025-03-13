import React, { useState, useEffect } from "react";
import { useCalendarStore } from "../../store/calendarStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useChatStore } from "../../store/chatStore";
import { generateDatesArray, isDateRangeOverlapping, isDateInRange } from "./utils/dateUtils";
import { useDragScroll } from "./hooks/useDragScroll";
import DateSelector from "./components/DateSelector";
import CalendarTable from "./components/CalendarTable";
import styles from "./CalendarView.module.css";

const CalendarView = () => {
  const { rooms, reservations, startDate, endDate, setDateRange, fetchRooms } = useCalendarStore();
  const { highlightedRoom, selectedRooms } = useRoomOptionsStore();
  const addMessage = useChatStore((state) => state.addMessage);
  const [days, setDays] = useState([]);
  const { isDragging, tableWrapperRef, handleMouseDown, handleMouseMove, dragStartTimeRef } = useDragScroll();

  useEffect(() => {
    fetchRooms();
    setDays(generateDatesArray(startDate, endDate));
  }, [startDate, endDate]);

  const handleCellClick = (roomNumber, date) => {
    // Verificăm dacă click-ul este parte a unui drag (scroll)
    const dragDuration = Date.now() - dragStartTimeRef.current;
    if (dragDuration > 200) return; // Ignorăm click-ul dacă a fost parte a unui drag

    const reservation = reservations.find(res =>
      res.rooms.some(room =>
        room.roomNumber === roomNumber &&
        date.toISOString().split("T")[0] >= room.startDate.split("T")[0] &&
        date.toISOString().split("T")[0] < room.endDate.split("T")[0]
      )
    );

    if (reservation) {
      // Găsim camera în lista de camere pentru a obține detaliile
      const room = rooms.find(r => r.number === roomNumber);
      if (!room) return;

      // Găsim camera specifică din rezervare
      const reservedRoom = reservation.rooms.find(r => r.roomNumber === roomNumber);
      if (!reservedRoom) return;

      // Creăm opțiunea pentru cameră în formatul așteptat
      const options = [`Camera ${room.number} - ${room.type} (${room.basePrice} lei/noapte)`];

      // Adăugăm un mesaj în chat cu detaliile rezervării
      addMessage({
        type: "bot",
        text: `Detalii rezervare pentru Camera ${roomNumber}:
Rezervat de: ${reservation.fullName}
Telefon: ${reservation.phone}`,
        reservation: {
          id: reservation.id,
          fullName: reservation.fullName,
          phone: reservation.phone,
          rooms: [{
            roomNumber: reservedRoom.roomNumber,
            startDate: reservedRoom.startDate,
            endDate: reservedRoom.endDate,
            price: reservedRoom.price,
            type: reservedRoom.type,
            status: reservedRoom.status
          }]
        },
        options: options
      });
    }
  };

  // Verificăm dacă o zi este în perioada selectată pentru o cameră
  const isInSelectedPeriod = (date, roomNumber) => {
    if (!highlightedRoom || highlightedRoom !== roomNumber) {
      return false;
    }
    
    // Verificăm mai întâi în camerele selectate
    const selectedRoom = selectedRooms.find(room => room.roomNumber === roomNumber);
    if (selectedRoom && selectedRoom.startDate && selectedRoom.endDate) {
      return isDateInRange(date, selectedRoom.startDate, selectedRoom.endDate);
    }

    // Verificăm dacă camera are rezervări în ziua respectivă
    const dayStr = date.toISOString().split("T")[0];
    const isReserved = reservations.some((res) => 
      res.rooms.some(room => 
        room.roomNumber === roomNumber &&
        dayStr >= room.startDate.split("T")[0] &&
        dayStr < room.endDate.split("T")[0]
      )
    );

    // Dacă camera este rezervată, nu o evidențiem
    if (isReserved) {
      return false;
    }

    // Dacă camera nu este rezervată și avem defaultDates, verificăm dacă ziua este în perioada default
    const defaultDates = useCalendarStore.getState().defaultDates;
    if (defaultDates?.startDate && defaultDates?.endDate) {
      return isDateInRange(date, defaultDates.startDate, defaultDates.endDate);
    }

    return false;
  };

  // Verificăm dacă o cameră este disponibilă într-o perioadă
  const isRoomAvailable = (roomNumber, startDate, endDate) => {
    return !reservations.some(res =>
      res.rooms.some(room =>
        room.roomNumber === roomNumber &&
        isDateRangeOverlapping(
          startDate,
          endDate,
          room.startDate,
          room.endDate
        )
      )
    );
  };



  // Obținem statusul camerei pentru o anumită zi
  const getRoomStatus = (roomNumber, date) => {
    const dayStr = date.toISOString().split("T")[0];
    const reservation = reservations.find(res =>
      res.rooms.some(room =>
        room.roomNumber === roomNumber &&
        dayStr >= room.startDate.split("T")[0] &&
        dayStr < room.endDate.split("T")[0]
      )
    );

    if (reservation) {
      const room = reservation.rooms.find(r => r.roomNumber === roomNumber);
      return room.status || "booked";
    }
    return "free";
  };

  // Expunem funcția de verificare disponibilitate către useCalendarStore
  useEffect(() => {
    useCalendarStore.setState({ isRoomAvailable });
  }, [reservations]);

  return (
    <div className={styles.calendarContainer}>
      <DateSelector 
        startDate={startDate} 
        endDate={endDate} 
        setDateRange={setDateRange} 
      />
      <CalendarTable
        rooms={rooms}
        days={days}
        highlightedRoom={highlightedRoom}
        isInSelectedPeriod={isInSelectedPeriod}
        getRoomStatus={getRoomStatus}
        handleCellClick={handleCellClick}
        isDragging={isDragging}
        tableWrapperRef={tableWrapperRef}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default CalendarView;