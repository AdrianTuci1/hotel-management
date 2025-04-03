import React, { useState, useEffect, useRef } from 'react';
import styles from './Calendar.module.css';
import useBookingStore from '../../store/bookingStore';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = () => {
  const calendarRef = useRef(null);
  const { selectedDates, setSelectedDates, setCalendarOpen, resetSelection } = useBookingStore();
  const [startMonth, setStartMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [daysAvailability, setDaysAvailability] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        resetSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [resetSelection]);

  useEffect(() => {
    // Simulăm date de disponibilitate (în loc de a le primi de la API)
    const newDaysAvailability = {};
    const daysInMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(startMonth.getFullYear(), startMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      // Simulăm disponibilitate aleatorie (70% disponibil, 30% indisponibil)
      newDaysAvailability[dateString] = Math.random() > 0.3 ? 'available' : 'unavailable';
    }
    
    setDaysAvailability(newDaysAvailability);
  }, [startMonth]);

  const isDateInRange = (date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck >= selectedDates.checkIn && dateToCheck <= selectedDates.checkOut;
  };

  const isDateHovered = (date) => {
    if (!hoveredDate || !selectedDates.checkIn) return false;
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck >= selectedDates.checkIn && dateToCheck <= hoveredDate;
  };

  const handleDateClick = (date) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    const dateString = clickedDate.toISOString().split('T')[0];
    
    // Verificăm dacă data este disponibilă
    if (daysAvailability[dateString] !== 'available') {
      return;
    }

    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      // Start new selection
      setSelectedDates({ checkIn: clickedDate, checkOut: null });
    } else {
      // Complete selection
      if (clickedDate < selectedDates.checkIn) {
        setSelectedDates({ checkIn: clickedDate, checkOut: selectedDates.checkIn });
      } else {
        setSelectedDates({ ...selectedDates, checkOut: clickedDate });
      }
    }
  };

  const handleDateHover = (date) => {
    if (selectedDates.checkIn && !selectedDates.checkOut) {
      const hoverDate = new Date(date);
      hoverDate.setHours(0, 0, 0, 0);
      setHoveredDate(hoverDate);
    }
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const prevMonth = () => {
    setStartMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setStartMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.calendarContainer} ref={calendarRef}>
      <div className={styles.months}>
        <div className={styles.calendar}>
          <div className={styles.weekDays}>
            {weekDays.map((day, index) => (
              <div key={index} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {Array.from({ length: startMonth.getDay() === 0 ? 6 : startMonth.getDay() - 1 }).map((_, index) => (
              <div key={`empty-${index}`} className={styles.emptyDay}></div>
            ))}

            {Array.from({ length: new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 0).getDate() }, (_, index) => {
              const dayNumber = index + 1;
              const currentDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), dayNumber);
              currentDate.setHours(0, 0, 0, 0);
              const dateString = currentDate.toISOString().split('T')[0];
              
              const isSelected = (selectedDates.checkIn && currentDate.getTime() === selectedDates.checkIn.getTime()) || 
                               (selectedDates.checkOut && currentDate.getTime() === selectedDates.checkOut.getTime());
              const isInRange = isDateInRange(currentDate);
              const isHovered = isDateHovered(currentDate);
              const isToday = currentDate.getTime() === today.getTime();
              const availability = daysAvailability[dateString];

              return (
                <div
                  key={index}
                  className={`${styles.day} ${isSelected ? styles.selected : ''} 
                             ${isInRange ? styles.inRange : ''} 
                             ${isHovered ? styles.hovered : ''}
                             ${isToday ? styles.today : ''}
                             ${availability === 'available' ? styles.available : ''}
                             ${availability === 'unavailable' ? styles.unavailable : ''}`}
                  onClick={() => handleDateClick(currentDate)}
                  onMouseEnter={() => handleDateHover(currentDate)}
                  onMouseLeave={handleDateLeave}
                >
                  <div className={styles.dayNumber}>{dayNumber}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <div className={styles.navigator}>
              <button onClick={prevMonth}>
                <FaArrowLeft />
              </button>
              <button onClick={nextMonth}>
                <FaArrowRight />
              </button>
            </div>
            <h3>
              {startMonth.toLocaleString("default", { month: "long" })}{" "}
              {startMonth.getFullYear()}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 