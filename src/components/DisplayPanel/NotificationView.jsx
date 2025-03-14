import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { IconBell, IconCheck, IconX } from '@tabler/icons-react';
import styles from './DisplayPanel.module.css';

const NotificationView = ({ data }) => {
  const { removeNotification } = useChatStore();

  const handleAction = (action, notification) => {
    // Procesăm acțiunea
    switch (action) {
      case 'accept':
        // Implementăm logica de acceptare
        console.log('Notificare acceptată:', notification);
        break;
      case 'dismiss':
        // Implementăm logica de respingere
        console.log('Notificare respinsă:', notification);
        break;
      default:
        console.warn('Acțiune nesuportată:', action);
    }

    // Ștergem notificarea după procesare
    removeNotification(notification.id);
  };

  if (!data) return null;

  return (
    <div className={styles.notification}>
      <div className={styles.notificationHeader}>
        <IconBell size={24} />
        <h3>{data.title}</h3>
      </div>
      
      <div className={styles.notificationContent}>
        <p>{data.message}</p>
        
        {data.aiResponse && (
          <div className={styles.aiResponse}>
            <h4>Răspuns sugerat:</h4>
            <p>{data.aiResponse}</p>
          </div>
        )}

        {data.link && (
          <a 
            href={data.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.notificationLink}
          >
            Vezi detalii
          </a>
        )}
      </div>

      <div className={styles.notificationActions}>
        <button 
          className={styles.acceptButton}
          onClick={() => handleAction('accept', data)}
        >
          <IconCheck size={20} />
          Accept
        </button>
        <button 
          className={styles.dismissButton}
          onClick={() => handleAction('dismiss', data)}
        >
          <IconX size={20} />
          Respinge
        </button>
      </div>
    </div>
  );
};

export default NotificationView; 