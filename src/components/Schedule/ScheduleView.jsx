import React, { useState } from 'react';
import styles from './ScheduleView.module.css';

const departments = [
  { id: 'reception', label: 'Recepție', icon: '👥' },
  { id: 'cleaning', label: 'Curățenie', icon: '🧹' },
];

const mockEmployees = {
  reception: [
    { id: 1, name: 'Ana Popescu', role: 'Receptioner', shift: 'Dimineața' },
    { id: 2, name: 'Ion Ionescu', role: 'Receptioner', shift: 'Seara' },
    { id: 3, name: 'Maria Dumitrescu', role: 'Receptioner', shift: 'Noapte' },
  ],
  cleaning: [
    { id: 4, name: 'Elena Popa', role: 'Cameristă', shift: 'Dimineața' },
    { id: 5, name: 'George Stancu', role: 'Camerist', shift: 'Dimineața' },
    { id: 6, name: 'Ioana Marinescu', role: 'Cameristă', shift: 'Seara' },
  ],
};

const ScheduleView = () => {
  const [activeDepartment, setActiveDepartment] = useState('reception');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ro-RO', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getWeekDates = () => {
    const dates = [];
    const firstDay = new Date(currentWeek);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.header}>
        <h1>Grafic de lucru</h1>
        <div className={styles.controls}>
          <button className={styles.weekControl} onClick={() => {
            const newDate = new Date(currentWeek);
            newDate.setDate(currentWeek.getDate() - 7);
            setCurrentWeek(newDate);
          }}>
            ◀️ Săptămâna anterioară
          </button>
          <button className={styles.weekControl} onClick={() => {
            const newDate = new Date(currentWeek);
            newDate.setDate(currentWeek.getDate() + 7);
            setCurrentWeek(newDate);
          }}>
            Săptămâna următoare ▶️
          </button>
        </div>
      </div>

      <div className={styles.departmentTabs}>
        {departments.map((dept) => (
          <button
            key={dept.id}
            className={`${styles.tabButton} ${activeDepartment === dept.id ? styles.active : ''}`}
            onClick={() => setActiveDepartment(dept.id)}
          >
            <span>{dept.icon}</span>
            {dept.label}
          </button>
        ))}
      </div>

      <div className={styles.scheduleGrid}>
        <div className={styles.timeColumn}>
          <div className={styles.timeHeader}>Angajat</div>
          {mockEmployees[activeDepartment].map((employee) => (
            <div key={employee.id} className={styles.employeeRow}>
              <div className={styles.employeeName}>{employee.name}</div>
              <div className={styles.employeeRole}>{employee.role}</div>
            </div>
          ))}
        </div>

        <div className={styles.daysContainer}>
          {getWeekDates().map((date, index) => (
            <div key={index} className={styles.dayColumn}>
              <div className={styles.dayHeader}>{formatDate(date)}</div>
              {mockEmployees[activeDepartment].map((employee) => (
                <div key={employee.id} className={styles.scheduleCell}>
                  {employee.shift}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton}>
          <span>➕</span> Adaugă angajat nou
        </button>
        <button className={styles.actionButton}>
          <span>📝</span> Editează program
        </button>
      </div>
    </div>
  );
};

export default ScheduleView; 