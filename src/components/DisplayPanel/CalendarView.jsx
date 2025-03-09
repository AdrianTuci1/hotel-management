import React, { useEffect } from "react";
import { useCalendarStore } from "../../store/calendarStore";
import styles from "./CalendarView.module.css";

const generateDatesArray = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  while (current <= new Date(endDate)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const CalendarView = () => {
  const { rooms, reservations, startDate, endDate, setDateRange, fetchRooms, initSocketListeners } = useCalendarStore();
  const days = generateDatesArray(startDate, endDate);

  useEffect(() => {
    fetchRooms();
    initSocketListeners(); // 🔥 Conectăm WebSocket-ul
  }, []);

  const getRoomStatus = (room, date) => {
    const dayStr = date.toISOString().split("T")[0];
    const reservation = reservations.find(
      (res) => res.roomNumber == room.number && dayStr >= res.checkInDate && dayStr < res.checkOutDate
    );

    if (reservation) {
      return reservation.status; // `confirmed` (galben) sau `booked` (roșu)
    }
    return "free"; // Alb (liber)
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
                <td className={styles.roomCell}>
                  {room.number}
                </td>
                {days.map((day) => {
                  const status = getRoomStatus(room, day);
                  return (
                    <td key={`${room.number}-${day.toISOString()}`} className={`${styles.dayCell} ${styles[status]}`}>
                      {status === "booked" ? "Ocupat" : status === "confirmed" ? "Rezervat" : ""}
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