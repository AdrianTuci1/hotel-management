import React, { useState, useEffect } from "react";
import { useCalendarStore } from "../../store/calendarStore";
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
  const [days, setDays] = useState([]);

  useEffect(() => {
    fetchRooms();
    setDays(generateDatesArray(startDate, endDate));
  }, [startDate, endDate]);

  // 🔹 Verificăm dacă o cameră este ocupată într-o anumită zi
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

  // 🔥 Obținem statusul camerei pentru o anumită zi
  const getRoomStatus = (roomNumber, date) => {
    if (isRoomOccupied(roomNumber, date)) {
      const reservation = reservations.find(
        (res) =>
          res.roomNumber === roomNumber &&
          date.toISOString().split("T")[0] >= res.checkInDate.split("T")[0] &&
          date.toISOString().split("T")[0] < res.checkOutDate.split("T")[0]
      );
      return reservation.status; // Poate fi "inregistrata" (galben) sau "confirmata" (roșu)
    }
    return "free"; // Dacă nu este rezervată
  };


  return (
    <div className={styles.calendarContainer}>
      <div className={styles.dateSelectors}>
        <label>Start:</label>
        <input type="date" value={startDate} onChange={(e) => setDateRange(e.target.value, endDate)} />
        <label>End:</label>
        <input type="date" value={endDate} onChange={(e) => setDateRange(startDate, e.target.value)} />
      </div>

      <div className={styles.tableWrapper}>
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
                <td className={styles.roomCell}>{room.number}</td>
                {days.map((day) => {
                  const status = getRoomStatus(room.number, day);
                  console.log(status)
                  return (
                    <td key={`${room.number}-${day.toISOString()}`} className={`${styles.dayCell} ${styles[status]}`}>
                      {status === "booked" ? "🔶 Booked" : status === "confirmed" ? "🔴 Confirmed" : ""}
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