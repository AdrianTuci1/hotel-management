import React, { useState } from 'react';
import styles from './HistoryView.module.css';

const HistoryView = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2025-03-19');

  const historyData = [
    {
      id: 1,
      timestamp: '2025-03-19 10:30',
      title: 'Check-out camera 101',
      type: 'checkout',
      details: 'Camera 101 mutată în status murdar',
    },
    {
      id: 2,
      timestamp: '2025-03-19 11:15',
      title: 'Problemă raportată camera 202',
      type: 'problem',
      details: 'Aer condiționat defect',
    },
    {
      id: 3,
      timestamp: '2025-03-19 12:00',
      title: 'Curățenie camera 303',
      type: 'cleaning',
      details: 'Curățenie finalizată în 15 min',
    },
  ];

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const getColorByType = (type) => {
    switch (type) {
      case 'checkout':
        return styles.checkout;
      case 'problem':
        return styles.problem;
      case 'cleaning':
        return styles.cleaning;
      default:
        return styles.default;
    }
  };

  const filteredHistory = historyData.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      item.timestamp.startsWith(selectedDate)
  );

  const resetToToday = () => setSelectedDate('2025-03-19');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Istoric Acțiuni</h2>
        <div className={styles.dateSelector}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
          <button onClick={resetToToday} className={styles.todayButton}>
            Azi
          </button>
        </div>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchInput}
            placeholder="Caută în istoric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.historyList}>
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`${styles.historyItem} ${getColorByType(item.type)}`}
              onClick={() => toggleExpand(item.id)}
            >
              <div className={styles.historyTitle}>{item.title}</div>
              <div className={styles.historyMeta}>
                <span>{item.type.toUpperCase()}</span>
                <span>{item.timestamp}</span>
              </div>
              {expanded === item.id && (
                <div className={styles.historyDetails}>{item.details}</div>
              )}
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className={styles.noResults}>Niciun rezultat găsit.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;