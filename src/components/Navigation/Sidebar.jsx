import React from 'react';
import styles from './Sidebar.module.css';
import { useNavigationStore } from '../../store/navigationStore';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏨',
  },
  {
    id: 'assistants',
    label: 'Asistenți',
    icon: '🤖',
  },
  {
    id: 'schedule',
    label: 'Grafic de lucru',
    icon: '📅',
  },
  {
    id: 'history',
    label: 'Istoric',
    icon: '📋',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    icon: '🍽️',
  },
  {
    id: 'reports',
    label: 'Rapoarte',
    icon: '📈',
  },
];

const Sidebar = () => {
  const { activeMenu, setActiveMenu } = useNavigationStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuItems}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.menuItem} ${
              activeMenu === item.id ? styles.active : ''
            }`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.bottomMenu}>
        <button className={styles.menuItem}>
          <span className={styles.icon}>❓</span>
          <span className={styles.label}>Ajutor</span>
        </button>
        <button className={styles.menuItem}>
          <span className={styles.icon}>⚙️</span>
          <span className={styles.label}>Setări sistem</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 