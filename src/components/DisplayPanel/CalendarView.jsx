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
    if (!selectedRoom) return false;

    // Verificăm dacă avem date valide pentru perioada selectată
    if (!selectedRoom.startDate || !selectedRoom.endDate) {
      return false;
    }

    const currentDate = new Date(date);
    const start = new Date(selectedRoom.startDate);
    const end = new Date(selectedRoom.endDate);

    // Ajustăm end date pentru a include și ultima zi
    end.setDate(end.getDate() - 1);

    // Setăm timpul la miezul nopții pentru comparație corectă
    currentDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return currentDate >= start && currentDate <= end;
  };

  // Verificăm dacă o cameră este ocupată într-o anumită zi
  const isRoomOccupied = (roomNumber, date) => {
    const dayStr = date.toISOString().split("T")[0];
    return reservations.some((res) => 
      res.rooms.some(room => 
        room.roomNumber === roomNumber &&
        dayStr >= room.startDate.split("T")[0] &&
        dayStr < room.endDate.split("T")[0]
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
                  const isOccupied = status !== 'free';
                  return (
                    <td 
                      key={`${room.number}-${day.toISOString()}`} 
                      className={`
                        ${styles.dayCell} 
                        ${styles[status]} 
                        ${isHighlighted ? styles.highlighted : ''}
                        ${isOccupied ? styles.clickable : ''}
                      `}
                      onClick={() => handleCellClick(room.number, day)}
                      title={isOccupied ? "Click pentru detalii rezervare" : ""}
                    >
                      {status === "confirmed" ? "🔴" : status === "pending" ? "🟡" : status === "booked" ? "🔶" : ""}
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