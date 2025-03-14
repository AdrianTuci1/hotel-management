import React from 'react';
import styles from '../CalendarView.module.css';
import RoomRow from './RoomRow';
import { formatDate } from '../utils/dateUtils';

const CalendarTable = ({
  rooms,
  days,
  highlightedRoom,
  isInSelectedPeriod,
  getRoomStatus,
  handleCellClick,
  isDragging,
  tableWrapperRef,
  handleMouseDown,
  handleMouseMove
}) => {
  return (
    <div 
      className={`${styles.tableWrapper} ${isDragging ? styles.dragging : ''}`}
      ref={tableWrapperRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <table className={styles.calendarTable}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Camere</th>
            {days.map((day) => (
              <th key={day.toISOString()} className={styles.headerCell}>
                {formatDate(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <RoomRow
              key={room.number}
              room={room}
              days={days}
              highlightedRoom={highlightedRoom}
              isInSelectedPeriod={isInSelectedPeriod}
              getRoomStatus={getRoomStatus}
              handleCellClick={handleCellClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarTable; 