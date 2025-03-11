import React, { useState, useEffect, useRef } from "react";
import { useCalendarStore } from "../../store/calendarStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useChatStore } from "../../store/chatStore";
import styles from "./CalendarView.module.css";

// 🔹 Generăm array-ul de zile între `startDate` și `endDate`
function generateDatesArray(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  while (current <= new Date(endDate)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const CalendarView = () => {
  const { rooms, reservations, startDate, endDate, setDateRange, fetchRooms } = useCalendarStore();
  const { highlightedRoom, selectedRooms } = useRoomOptionsStore();
  const addMessage = useChatStore((state) => state.addMessage);
  const [days, setDays] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const tableWrapperRef = useRef(null);
  const dragStartTimeRef = useRef(0);

  const setNextTwoWeeks = () => {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    setDateRange(
      today.toISOString().split('T')[0],
      twoWeeksLater.toISOString().split('T')[0]
    );
  };

  useEffect(() => {
    fetchRooms();
    setDays(generateDatesArray(startDate, endDate));
  }, [startDate, endDate]);

  const handleCellClick = (roomNumber, date) => {
    // Verificăm dacă click-ul este parte a unui drag (scroll)
    const dragDuration = Date.now() - dragStartTimeRef.current;
    if (dragDuration > 200) return; // Ignorăm click-ul dacă a fost parte a unui drag

    const reservation = reservations.find(
      (res) =>
        res.roomNumber === roomNumber &&
        date.toISOString().split("T")[0] >= res.checkInDate.split("T")[0] &&
        date.toISOString().split("T")[0] < res.checkOutDate.split("T")[0]
    );

    if (reservation) {
      // Găsim camera în lista de camere pentru a obține detaliile
      const room = rooms.find(r => r.number === roomNumber);
      if (!room) return;

      // Creăm opțiunea pentru cameră în formatul așteptat
      const options = [`Camera ${room.number} - ${room.type} (${room.basePrice} lei/noapte)`];

      // Adăugăm un mesaj în chat cu detaliile rezervării
      addMessage({
        type: "bot",
        text: `Detalii rezervare pentru Camera ${roomNumber}:`,
        reservation: {
          roomNumber: reservation.roomNumber,
          startDate: reservation.checkInDate.split("T")[0],
          endDate: reservation.checkOutDate.split("T")[0],
          // Adăugăm restul detaliilor din rezervare
          ...reservation
        },
        options: options
      });
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // doar click stânga
      setIsDragging(true);
      dragStartTimeRef.current = Date.now();
      setDragStart({
        x: e.clientX + tableWrapperRef.current.scrollLeft,
        y: e.clientY + tableWrapperRef.current.scrollTop
      });
      setScrollPosition({
        x: tableWrapperRef.current.scrollLeft,
        y: tableWrapperRef.current.scrollTop
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = dragStart.x - e.clientX;
    const dy = dragStart.y - e.clientY;

    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollLeft = dx;
      tableWrapperRef.current.scrollTop = dy;
    }

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Curățăm evenimentele când componenta este demontată
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  // Verificăm dacă o zi este în perioada selectată pentru o cameră
  const isInSelectedPeriod = (date, roomNumber) => {
    if (!highlightedRoom || highlightedRoom !== roomNumber) {
      return false;
    }
    
    const selectedRoom = selectedRooms.find(room => room.roomNumber === roomNumber);
    if (!selectedRoom?.startDate || !selectedRoom?.endDate) {
      return false;
    }

    const currentDate = new Date(date);
    const start = new Date(selectedRoom.startDate);
    const end = new Date(selectedRoom.endDate);
    return currentDate >= start && currentDate < end;
  };

  // Verificăm dacă o cameră este ocupată într-o anumită zi
  const isRoomOccupied = (roomNumber, date) => {
    const dayStr = date.toISOString().split("T")[0];
    return reservations.some((res) => {
      return (
        res.roomNumber === roomNumber &&
        dayStr >= res.checkInDate.split("T")[0] &&
        dayStr < res.checkOutDate.split("T")[0]
      );
    });
  };

  // Obținem statusul camerei pentru o anumită zi
  const getRoomStatus = (roomNumber, date) => {
    if (isRoomOccupied(roomNumber, date)) {
      const reservation = reservations.find(
        (res) =>
          res.roomNumber === roomNumber &&
          date.toISOString().split("T")[0] >= res.checkInDate.split("T")[0] &&
          date.toISOString().split("T")[0] < res.checkOutDate.split("T")[0]
      );
      return reservation.status;
    }
    return "free";
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.dateSelectors}>
        <label>Start:</label>
        <input type="date" value={startDate} onChange={(e) => setDateRange(e.target.value, endDate)} />
        <label>End:</label>
        <input type="date" value={endDate} onChange={(e) => setDateRange(startDate, e.target.value)} />
        <button 
          className={styles.quickSelectButton}
          onClick={setNextTwoWeeks}
          title="Setează perioada la următoarele 2 săptămâni"
        >
          Acum
        </button>
      </div>

      <div 
        className={`${styles.tableWrapper} ${isDragging ? styles.dragging : ''}`}
        ref={tableWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <table className={styles.calendarTable}>
          <thead>
            <tr>
              <th className={styles.headerCell}>Camere</th>
              {days.map((day) => (
                <th key={day.toISOString()} className={styles.headerCell}>
                  {day.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.number}>
                <td className={`${styles.roomCell} ${highlightedRoom === room.number ? styles.highlightedRoom : ''}`}>
                  {room.number}
                </td>
                {days.map((day) => {
                  const status = getRoomStatus(room.number, day);
                  const isHighlighted = isInSelectedPeriod(day, room.number);
                  return (
                    <td 
                      key={`${room.number}-${day.toISOString()}`} 
                      className={`
                        ${styles.dayCell} 
                        ${styles[status]} 
                        ${isHighlighted ? styles.highlighted : ''}
                        ${status !== 'free' ? styles.clickable : ''}
                      `}
                      onClick={() => handleCellClick(room.number, day)}
                    >
                      {status === "booked" ? "🔶" : status === "confirmed" ? "🔴" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarView;