import React, { useState, useEffect } from "react";
import styles from "./CalendarView.module.css";

function generateDatesArray(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const CalendarView = () => {
  const [rooms] = useState([101, 102, 103, 201, 202, 203, 204, 205]);
  const [startDate, setStartDate] = useState("2023-12-01");
  const [endDate, setEndDate] = useState("2023-12-10");
  const [days, setDays] = useState([]);

  // Rezervări demo
  const [reservations] = useState([
    { room: 101, startDate: "2023-12-02", endDate: "2023-12-04" },
    { room: 202, startDate: "2023-12-01", endDate: "2023-12-03" },
    { room: 205, startDate: "2023-12-05", endDate: "2023-12-06" },
  ]);

  useEffect(() => {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    setDays(generateDatesArray(sDate, eDate));
  }, [startDate, endDate]);

  const isRoomOccupied = (room, date) => {
    const dayStr = date.toISOString().split("T")[0];
    return reservations.some((res) => {
      if (res.room === room) {
        return dayStr >= res.startDate && dayStr <= res.endDate;
      }
      return false;
    });
  };

  const handleDateChange = (e, type) => {
    if (type === "start") setStartDate(e.target.value);
    if (type === "end") setEndDate(e.target.value);
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.dateSelectors}>
        <label>Start:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleDateChange(e, "start")}
        />
        <label>End:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleDateChange(e, "end")}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.calendarTable}>
          <thead>
            <tr>
              <th className={styles.headerCell}>Camere</th>
              {days.map((day) => {
                const dayStr = day.toISOString().split("T")[0];
                return (
                  <th key={dayStr} className={styles.headerCell}>
                    {day.toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((roomNum) => (
              <tr key={roomNum}>
                <td className={styles.roomCell}>{roomNum}</td>
                {days.map((day) => {
                  const occupied = isRoomOccupied(roomNum, day);
                  const keyDay = `${roomNum}-${day.toISOString()}`;
                  return (
                    <td
                      key={keyDay}
                      className={`${styles.dayCell} ${occupied ? styles.occupied : ""}`}
                    >
                      {occupied ? "Ocupat" : ""}
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