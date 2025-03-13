import React from 'react';
import { getNextTwoWeeks } from '../utils/dateUtils';
import styles from '../CalendarView.module.css';

const DateSelector = ({ startDate, endDate, setDateRange }) => {
  const handleQuickSelect = () => {
    const { startDate, endDate } = getNextTwoWeeks();
    setDateRange(startDate, endDate);
  };

  return (
    <div className={styles.dateSelectors}>
      <label>Start:</label>
      <input 
        type="date" 
        value={startDate} 
        onChange={(e) => setDateRange(e.target.value, endDate)} 
      />
      <label>End:</label>
      <input 
        type="date" 
        value={endDate} 
        onChange={(e) => setDateRange(startDate, e.target.value)} 
      />
      <button 
        className={styles.quickSelectButton}
        onClick={handleQuickSelect}
        title="Setează perioada la următoarele 2 săptămâni"
      >
        Acum
      </button>
    </div>
  );
};

export default DateSelector; 