import React, { useState } from 'react';
import styles from './HistoryList.module.css';

const HistoryList = ({ historyData, search, selectedDate, selectedTypes, timeRange, customRange }) => {
  const [expanded, setExpanded] = useState(null);

  const getColorByType = (type) => {
    switch (type) {
      case 'checkout':
        return styles.checkout;
      case 'problem':
        return styles.problem;
      case 'cleaning':
        return styles.cleaning;
      case 'suggestion':
        return styles.suggestion;
      case 'service':
        return styles.service;
      case 'maintenance':
        return styles.maintenance;
      case 'report':
        return styles.report;
      default:
        return styles.default;
    }
  };

  const getTimeRangeLabel = (hour) => {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18) return 'evening';
    return 'evening'; // pentru orele 0-6
  };

  const filteredHistory = historyData.filter((item) => {
    const hour = parseInt(item.timestamp.split(' ')[1].split(':')[0]);
    const itemTimeRange = getTimeRangeLabel(hour);
    
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesDate = item.timestamp.startsWith(selectedDate);
    const matchesTimeRange = timeRange === 'all' || 
                            (timeRange === 'custom' && hour >= customRange.start && hour <= customRange.end) ||
                            itemTimeRange === timeRange;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);

    return matchesSearch && matchesDate && matchesTimeRange && matchesType;
  });

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div className={styles.historyList}>
      {filteredHistory.map((item) => (
        <div
          key={item.id}
          className={`${styles.historyItem} ${getColorByType(item.type)}`}
          onClick={() => toggleExpand(item.id)}
        >
          <div className={styles.historyContent}>
            <div className={styles.userInfo}>
              <div className={`${styles.avatar} ${item.user.isAI ? styles.aiAvatar : ''}`}>
                {item.user.avatar}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>
                  {item.user.name}
                  {item.user.isAI && <span className={styles.aiBadge}>AI</span>}
                </div>
                <div className={styles.userRole}>{item.user.role}</div>
              </div>
            </div>

            <div className={styles.historyInfo}>
              <div className={styles.historyTitle}>{item.title}</div>
              <div className={styles.historyMeta}>
                <span>{item.type.toUpperCase()}</span>
              </div>
              {expanded === item.id && (
                <div className={styles.historyDetails}>{item.details}</div>
              )}
            </div>

            <div className={styles.timestamp}>
              {item.timestamp}
            </div>
          </div>
        </div>
      ))}

      {filteredHistory.length === 0 && (
        <div className={styles.noResults}>Niciun rezultat găsit.</div>
      )}
    </div>
  );
};

export default HistoryList; 