import { useState, useEffect } from "react";
import styles from "./ReceptionDashboard.module.css";
import { useReceptionStore } from "../../store/receptionStore";
import { initializeChat } from "../../actions/chatActions";

const ReceptionDashboard = () => {
  const { 
    cleaningRooms, 
    problemRooms, 
    cleanedRooms, 
    financials,
    markRoomClean,
    markRoomDirty,
    reportRoomProblem,
    resolveRoomProblem,
    getUnconfirmedArrivals,
    getDepartures,
    confirmArrival,
    initializeDemoData
  } = useReceptionStore();

  const [selectedRooms, setSelectedRooms] = useState({});
  const [problemInput, setProblemInput] = useState({
    roomNumber: '',
    issue: ''
  });

  const arrivals = getUnconfirmedArrivals();
  const departures = getDepartures();

  // Initialize WebSocket connection and demo data
  useEffect(() => {
    initializeChat();
    initializeDemoData();
  }, []);

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

  const handleRoomStatusChange = async (roomNumber, action) => {
    switch (action) {
      case 'markClean':
        await markRoomClean(roomNumber);
        break;
      case 'markDirty':
        await markRoomDirty(roomNumber);
        break;
      case 'reportProblem':
        if (problemInput.roomNumber && problemInput.issue) {
          await reportRoomProblem(problemInput.roomNumber, problemInput.issue);
          setProblemInput({ roomNumber: '', issue: '' });
        }
        break;
      case 'resolveProblem':
        await resolveRoomProblem(roomNumber);
        break;
    }
  };

  return (
    <div className={styles.dashboard}>

      <div className={styles.mainContent}>
        <div className={styles.grid}>
          {/* Sosiri */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>🛬 Sosiri azi</h3>
              <span className={styles.cardCount}>{arrivals.length}</span>
            </div>
            <div className={styles.cardContent}>
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
            </div>
          </div>

          {/* Plecări */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>🏃 Plecări azi</h3>
              <span className={styles.cardCount}>{departures.length}</span>
            </div>
            <div className={styles.cardContent}>
              <ul>
                {departures.map((guest) => (
                  <li key={guest.id}>
                    <strong>{guest.name}</strong>
                    <div className={styles.roomsList}>
                      {guest.rooms.map(room => (
                        <div key={room.roomNumber} className={styles.departureRoom}>
                          <span>Camera {room.roomNumber} (ora {room.checkOutTime})</span>
                          <button 
                            className={styles.markDirtyButton}
                            onClick={() => handleRoomStatusChange(room.roomNumber, 'markDirty')}
                          >
                            Marchează murdară
                          </button>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Curățenie */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>🧹 Curățenie</h3>
              <span className={styles.cardCount}>{cleaningRooms.length}</span>
            </div>
            <div className={styles.cardContent}>
              <ul>
                {cleaningRooms.map((room) => (
                  <li key={room} className={styles.cleaningItem}>
                    <div className={styles.cleaningRoomInfo}>
                      <span>Camera {room}</span>
                      <span className={styles.cleaningStatus}>
                        {cleanedRooms.includes(room) ? '✓ Curățată' : '🔄 Necesită curățare'}
                      </span>
                    </div>
                    <div className={styles.cleaningActions}>
                      <button 
                        className={styles.markCleanButton}
                        onClick={() => handleRoomStatusChange(room, 'markClean')}
                      >
                        Marchează curată
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Probleme */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>🚨 Probleme</h3>
              <span className={styles.cardCount}>{problemRooms.length}</span>
            </div>
            <div className={styles.cardContent}>
              <ul>
                {problemRooms.map((problem, index) => (
                  <li key={index} className={styles.problemItem}>
                    <div>
                      <strong>Camera {problem.room}:</strong> {problem.issue}
                    </div>
                    <div className={styles.problemActions}>
                      <button 
                        className={styles.resolveButton}
                        onClick={() => handleRoomStatusChange(problem.room, 'resolveProblem')}
                      >
                        Rezolvat
                      </button>
                    </div>
                  </li>
                ))}
                <li className={styles.addProblemItem}>
                  <input
                    type="text"
                    placeholder="Număr cameră"
                    value={problemInput.roomNumber}
                    onChange={(e) => setProblemInput(prev => ({
                      ...prev,
                      roomNumber: e.target.value
                    }))}
                  />
                  <input
                    type="text"
                    placeholder="Descriere problemă"
                    value={problemInput.issue}
                    onChange={(e) => setProblemInput(prev => ({
                      ...prev,
                      issue: e.target.value
                    }))}
                  />
                  <button 
                    className={styles.addProblemButton}
                    onClick={() => handleRoomStatusChange(null, 'reportProblem')}
                    disabled={!problemInput.roomNumber || !problemInput.issue}
                  >
                    Adaugă problemă
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Finanțe - secțiune fixă în partea de jos */}
      <div className={styles.financesSection}>
        <div className={styles.financesTopRow}>
          <div className={styles.financeBox}>
            <div className={styles.financeIcon}>💵</div>
            <div className={styles.financeInfo}>
              <span className={styles.financeLabel}>Cash</span>
              <span className={styles.financeValue}>{financials.revenue}</span>
            </div>
          </div>
          <div className={styles.financeBox}>
            <div className={styles.financeIcon}>💳</div>
            <div className={styles.financeInfo}>
              <span className={styles.financeLabel}>Card</span>
              <span className={styles.financeValue}>{financials.revenue}</span>
            </div>
          </div>
        </div>
        <div className={styles.financeBox}>
          <div className={styles.financeIcon}>🛍️</div>
          <div className={styles.financeInfo}>
            <span className={styles.financeLabel}>Ultima vânzare</span>
            <span className={styles.financeValue}>{financials.lastSale}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;