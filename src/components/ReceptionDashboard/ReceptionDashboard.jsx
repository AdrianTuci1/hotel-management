import { useState } from "react";
import styles from "./ReceptionDashboard.module.css";

const ReceptionDashboard = () => {
  const [cleanedRooms, setCleanedRooms] = useState([]);

  const arrivals = [
    { name: "Mihai Popescu", room: 102, time: "14:00" },
    { name: "Andreea Ionescu", room: 210, time: "15:30" },
  ];

  const departures = [
    { name: "Ion Marinescu", room: 305, time: "11:00" },
    { name: "Florin Georgescu", room: 412, time: "12:00" },
  ];

  const cleaningRooms = [105, 203, 310];
  const problems = [
    { room: 312, issue: "Aer condiționat defect" },
    { room: 401, issue: "Bec ars" },
  ];

  const financials = {
    revenue: "2.350 RON",
    lastSale: "1 apă, 2 cafele, 1 masă restaurant",
  };

  const toggleCleanRoom = (room) => {
    setCleanedRooms((prev) =>
      prev.includes(room.toString())
        ? prev.filter((r) => r !== room.toString())
        : [...prev, room.toString()]
    );
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>📋 Rezumat Zilnic</h2>

      <div className={styles.grid}>
        {/* Sosiri */}
        <div className={styles.card}>
          <h3>🛬 Sosiri azi</h3>
          <ul>
            {arrivals.map((guest, index) => (
              <li key={index}>
                <strong>{guest.name}</strong> - Camera {guest.room} (ora {guest.time})
              </li>
            ))}
          </ul>
        </div>

        {/* Plecări */}
        <div className={styles.card}>
          <h3>🏃 Plecări azi</h3>
          <ul>
            {departures.map((guest, index) => (
              <li key={index}>
                <strong>{guest.name}</strong> - Camera {guest.room} (ora {guest.time})
              </li>
            ))}
          </ul>
        </div>

        {/* Curățenie */}
        <div className={styles.card}>
          <h3>🧹 Curățenie finalizată</h3>
          <ul>
            {cleaningRooms.map((room) => (
              <li key={room} className={styles.cleaningItem}>
                <input
                  type="checkbox"
                  checked={cleanedRooms.includes(room.toString())}
                  onChange={() => toggleCleanRoom(room)}
                />
                <span>Camera {room}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Probleme */}
        <div className={styles.card}>
          <h3>🚨 Probleme</h3>
          <ul>
            {problems.map((problem, index) => (
              <li key={index}>
                <strong>Camera {problem.room}:</strong> {problem.issue}
              </li>
            ))}
          </ul>
        </div>

        {/* Finanțe */}
        <div className={styles.card}>
          <h3>💰 Finanțe</h3>
          <p><strong>Încasări azi:</strong> {financials.revenue}</p>
          <p><strong>Ultima vânzare:</strong> {financials.lastSale}</p>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;