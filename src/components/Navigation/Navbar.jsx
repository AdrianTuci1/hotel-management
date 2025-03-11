import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Cameră nouă disponibilă", type: "info", time: "acum 5 min" },
    { id: 2, text: "Rezervare nouă", type: "success", time: "acum 10 min" },
    { id: 3, text: "Problemă raportată la camera 203", type: "warning", time: "acum 30 min" }
  ];

  const userMenuItems = [
    { id: 'profile', label: '👤 Profil', action: () => console.log('Profile clicked') },
    { id: 'settings', label: '⚙️ Setări', action: () => console.log('Settings clicked') },
    { id: 'signout', label: '🚪 Deconectare', action: () => console.log('Sign out clicked') }
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        🏨 Hotel Manager
      </div>

      <div className={styles.actions}>
        {/* Notifications */}
        <div className={styles.notificationsWrapper}>
          <button 
            className={styles.notificationButton}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            🔔
            <span className={styles.notificationBadge}>
              {notifications.length}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className={styles.notificationsDropdown}>
              <h3>Notificări</h3>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`${styles.notification} ${styles[notification.type]}`}
                >
                  <p>{notification.text}</p>
                  <span className={styles.time}>{notification.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className={styles.userMenuWrapper}>
          <button 
            className={styles.userButton}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            👤 Admin
          </button>

          {isUserMenuOpen && (
            <div className={styles.userDropdown}>
              {userMenuItems.map(item => (
                <button
                  key={item.id}
                  className={styles.menuItem}
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 