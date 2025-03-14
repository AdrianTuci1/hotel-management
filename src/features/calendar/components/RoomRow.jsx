import React from 'react';
import styles from '../CalendarView.module.css';
import DayCell from './DayCell';

const RoomRow = ({ 
  room, 
  days, 
  highlightedRoom, 
  isInSelectedPeriod, 
  getRoomStatus, 
  handleCellClick 
}) => {
  return (
    <tr key={room.number}>
      <td className={`${styles.roomCell} ${highlightedRoom === room.number ? styles.highlightedRoom : ''}`}>
        {room.number}
      </td>
      {days.map((day) => {
        const status = getRoomStatus(room.number, day);
        const isHighlighted = isInSelectedPeriod(day, room.number);
        const isOccupied = status !== 'free';
        
        return (
          <DayCell
            key={`${room.number}-${day.toISOString()}`}
            status={status}
            isHighlighted={isHighlighted}
            isOccupied={isOccupied}
            onClick={handleCellClick}
            roomNumber={room.number}
            date={day}
          />
        );
      })}
    </tr>
  );
};

export default RoomRow; 