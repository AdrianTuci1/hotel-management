import React, { useState, useEffect, useRef } from "react";
import { useCalendarStore } from "../../store/calendarStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
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
  const { highlightedRoom, selectedPeriod } = useRoomOptionsStore();
  const [days, setDays] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const tableWrapperRef = useRef(null);

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

  const handleMouseDown = (e) => {
    if (e.button === 0) { // doar click stânga
      setIsDragging(true);
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

  // Verificăm dacă o zi este în perioada selectată
  const isInSelectedPeriod = (date, roomNumber) => {
    if (!selectedPeriod.startDate || !selectedPeriod.endDate || !highlightedRoom || highlightedRoom !== roomNumber) {
      return false;
    }
    const currentDate = new Date(date);
    const start = new Date(selectedPeriod.startDate);
    const end = new Date(selectedPeriod.endDate);
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
                      `}
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