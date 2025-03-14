import React from 'react';
import styles from '../CalendarView.module.css';

const DayCell = ({ 
  status, 
  isHighlighted, 
  isOccupied, 
  onClick, 
  roomNumber, 
  date 
}) => {
  const getStatusEmoji = (status) => {
    switch (status) {
      case "confirmed": return "🔴";
      case "pending": return "🟡";
      case "booked": return "🔶";
      default: return "";
    }
  };

  return (
    <td 
      className={`
        ${styles.dayCell} 
        ${styles[status]} 
        ${isHighlighted ? styles.highlighted : ''}
        ${isOccupied ? styles.clickable : ''}
      `}
      onClick={() => onClick(roomNumber, date)}
      title={isOccupied ? "Click pentru detalii rezervare" : ""}
    >
      {getStatusEmoji(status)}
    </td>
  );
};

export default DayCell; 