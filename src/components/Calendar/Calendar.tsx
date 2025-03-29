import React, { useState, useEffect } from "react";
import styles from "./Calendar.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface DayStatus {
  date: string;
  status: "available" | "unavailable";
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  numMonths?: number; // Number of months to display
  hideNavigator?: boolean; // Hide month navigation
  onSelectDate?: (date: string) => void; // Callback when a date is selected
}

const Calendar: React.FC<CalendarProps> = ({
  numMonths = 1,
  hideNavigator = false,
  onSelectDate,
}) => {
  const [startMonth, setStartMonth] = useState(new Date());
  const [daysData, setDaysData] = useState<{ [key: string]: DayStatus[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate && onSelectDate) {
      onSelectDate(selectedDate); // Trimitem data selectată către `StepCalendar`
    }
  }, [selectedDate, onSelectDate]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date); // Salvăm ziua selectată local
  };

  useEffect(() => {
    const fetchDummyData = () => {
      const newDaysData: { [key: string]: DayStatus[] } = {};

      for (let offset = 0; offset < numMonths; offset++) {
        const currentMonth = new Date(
          startMonth.getFullYear(),
          startMonth.getMonth() + offset,
          1
        );
        const totalDays = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0
        ).getDate();

        const days: DayStatus[] = [];
        for (let i = 1; i <= totalDays; i++) {
          const randomStatus = ["available", "unavailable"][
            Math.floor(Math.random() * 2)
          ] as DayStatus["status"];

          days.push({
            date: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${i}`,
            status: randomStatus,
          });
        }

        newDaysData[currentMonth.toISOString().slice(0, 7)] = days;
      }

      setDaysData(newDaysData);
    };

    fetchDummyData();
  }, [startMonth, numMonths]);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return styles.available;
      case "unavailable":
        return styles.unavailable;
      default:
        return "";
    }
  };


  const prevMonth = () => {
    setStartMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setStartMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.months}>
        {Array.from({ length: numMonths }).map((_, monthIndex) => {
          const currentMonth = new Date(
            startMonth.getFullYear(),
            startMonth.getMonth() + monthIndex,
            1
          );

          const monthKey = currentMonth.toISOString().slice(0, 7);
          const firstDayOfMonth = currentMonth.getDay();
          const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
          const daysInMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
          ).getDate();
          const monthDays = daysData[monthKey] || [];

          return (
            <div key={monthKey} className={styles.calendar}>
              <div className={styles.weekDays}>
                {weekDays.map((day, index) => (
                  <div key={index} className={styles.weekDay}>
                    {day}
                  </div>
                ))}
              </div>

              <div className={styles.grid}>
                {Array.from({ length: adjustedFirstDay }).map((_, index) => (
                  <div key={`empty-${index}`} className={styles.emptyDay}></div>
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const dayNumber = index + 1;
                  const dayData = monthDays.find(
                    (day) => new Date(day.date).getDate() === dayNumber
                  );
                  const isToday = dayData?.date === todayString;

                  return (
                    <div
                      key={index}
                      className={`${styles.day} ${dayData ? getStatusColor(dayData.status) : ""} ${
                        isToday ? styles.today : ""
                      }`}
                      onClick={() => handleDayClick(dayData?.date || "")}
                    >
                      <div className={styles.dayNumber}>{dayNumber}</div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.footer}>
                {!hideNavigator && (
                  <div className={styles.navigator}>
                    <button onClick={prevMonth}>
                      <FaArrowLeft />
                    </button>
                    <button onClick={nextMonth}>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
                <h3>
                  {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                  {currentMonth.getFullYear()}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;