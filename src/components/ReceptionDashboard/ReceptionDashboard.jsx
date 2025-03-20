import { useState } from "react";
import styles from "./ReceptionDashboard.module.css";
import { useReceptionStore } from "../../store/receptionStore";

const ReceptionDashboard = () => {
  const { 
    cleaningRooms, 
    problemRooms, 
    cleanedRooms, 
    financials,
    toggleCleanRoom,
    getUnconfirmedArrivals,
    getDepartures,
    confirmArrival
  } = useReceptionStore();

  const [selectedRooms, setSelectedRooms] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  const arrivals = getUnconfirmedArrivals();
  const departures = getDepartures();

  const handleRoomSelection = (reservationId, roomNumber) => {
    setSelectedRooms(prev => ({
      ...prev,
      [reservationId]: prev[reservationId] 
        ? prev[reservationId].includes(roomNumber)
          ? prev[reservationId].filter(r => r !== roomNumber)
          : [...prev[reservationId], roomNumber]
        : [roomNumber]
    }));
  };

  const handleConfirmArrival = (reservationId) => {
    if (selectedRooms[reservationId]?.length > 0) {
      confirmArrival(reservationId, selectedRooms[reservationId]);
      setSelectedRooms(prev => {
        const newState = { ...prev };
        delete newState[reservationId];
        return newState;
      });
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>📋 Rezumat Zilnic</h2>

      <div className={styles.grid}>
        {/* Sosiri */}
        <div className={styles.card}>
          <button 
            className={styles.cardButton}
            onClick={() => toggleCard('arrivals')}
          >
            <h3>🛬 Sosiri azi</h3>
            <span className={styles.cardCount}>{arrivals.length}</span>
          </button>
          {expandedCard === 'arrivals' && (
            <ul>
              {arrivals.map((guest) => (
                <li key={guest.id} className={styles.arrivalItem}>
                  <div>
                    <strong>{guest.name}</strong>
                    <div className={styles.roomsList}>
                      {guest.rooms.map(room => (
                        <div key={room.roomNumber} className={styles.roomCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedRooms[guest.id]?.includes(room.roomNumber) || false}
                            onChange={() => handleRoomSelection(guest.id, room.roomNumber)}
                          />
                          <span>Camera {room.roomNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    className={styles.confirmButton}
                    onClick={() => handleConfirmArrival(guest.id)}
                    disabled={!selectedRooms[guest.id]?.length}
                  >
                    Confirmă Sosirea
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Plecări */}
        <div className={styles.card}>
          <button 
            className={styles.cardButton}
            onClick={() => toggleCard('departures')}
          >
            <h3>🏃 Plecări azi</h3>
            <span className={styles.cardCount}>{departures.length}</span>
          </button>
          {expandedCard === 'departures' && (
            <ul>
              {departures.map((guest) => (
                <li key={guest.id}>
                  <strong>{guest.name}</strong>
                  <div className={styles.roomsList}>
                    {guest.rooms.map(room => (
                      <div key={room.roomNumber}>
                        Camera {room.roomNumber} (ora {room.checkOutTime})
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Curățenie */}
        <div className={styles.card}>
          <button 
            className={styles.cardButton}
            onClick={() => toggleCard('cleaning')}
          >
            <h3>🧹 Curățenie finalizată</h3>
            <span className={styles.cardCount}>{cleaningRooms.length}</span>
          </button>
          {expandedCard === 'cleaning' && (
            <ul>
              {cleaningRooms.map((room) => (
                <li key={room} className={styles.cleaningItem}>
                  <input
                    type="checkbox"
                    checked={cleanedRooms.includes(room)}
                    onChange={() => toggleCleanRoom(room)}
                  />
                  <span>Camera {room}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Probleme */}
        <div className={styles.card}>
          <button 
            className={styles.cardButton}
            onClick={() => toggleCard('problems')}
          >
            <h3>🚨 Probleme</h3>
            <span className={styles.cardCount}>{problemRooms.length}</span>
          </button>
          {expandedCard === 'problems' && (
            <ul>
              {problemRooms.map((problem, index) => (
                <li key={index}>
                  <strong>Camera {problem.room}:</strong> {problem.issue}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Finanțe */}
        <div className={styles.card}>
          <button 
            className={styles.cardButton}
            onClick={() => toggleCard('financials')}
          >
            <h3>💰 Finanțe</h3>
          </button>
          {expandedCard === 'financials' && (
            <div>
              <p><strong>Încasări azi:</strong> {financials.revenue}</p>
              <p><strong>Ultima vânzare:</strong> {financials.lastSale}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;