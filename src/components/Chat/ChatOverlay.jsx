import React from 'react';
import styles from './ChatOverlay.module.css';
import ReservationDetails from '../ReservationDetails';
import { IconX, IconChartBar, IconBell } from '@tabler/icons-react';

const ChatOverlay = ({ 
  isVisible, 
  type, 
  data, 
  onClose,
  onAction,
  roomManagement // pentru ReservationDetails
}) => {
  if (!isVisible) return null;

  const renderContent = () => {
    switch (type) {
      case 'reservation':
        return (
          <ReservationDetails 
            reservationData={data}
            setReservationData={(newData) => onAction('updateReservation', newData)}
            onFinalize={() => onAction('finalizeReservation', data)}
            onCancel={onClose}
            onDelete={() => onAction('deleteReservation', data)}
            roomManagement={roomManagement}
          />
        );

      case 'notification':
        return (
          <div className={styles.notification}>
            <div className={styles.notificationHeader}>
              <IconBell size={24} />
              <h3>{data.title}</h3>
            </div>
            <p>{data.message}</p>
            {data.aiResponse && (
              <div className={styles.aiResponseSection}>
                <h4>Răspuns sugerat:</h4>
                <p>{data.aiResponse}</p>
                <div className={styles.actions}>
                  <button onClick={() => onAction('sendAiResponse', data)}>
                    Trimite răspuns
                  </button>
                  <button onClick={() => onAction('editAiResponse', data)}>
                    Editează răspuns
                  </button>
                </div>
              </div>
            )}
            <div className={styles.actions}>
              <button onClick={() => onAction('acceptNotification', data)}>
                Accept
              </button>
              <button onClick={() => onAction('dismissNotification', data)}>
                Dismiss
              </button>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className={styles.analysis}>
            <div className={styles.analysisHeader}>
              <IconChartBar size={24} />
              <h3>Analiză prețuri</h3>
            </div>
            <div className={styles.analysisContent}>
              {data.recommendations && (
                <div className={styles.recommendations}>
                  <h4>Recomandări</h4>
                  <ul>
                    {data.recommendations.map((rec, index) => (
                      <li key={index}>
                        <strong>{rec.title}</strong>
                        <p>{rec.description}</p>
                        {rec.action && (
                          <button onClick={() => onAction('applyRecommendation', rec)}>
                            Aplică
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.charts && (
                <div className={styles.charts}>
                  {/* Aici vom adăuga componenta pentru grafice */}
                  <pre>{JSON.stringify(data.charts, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button onClick={() => onAction('exportAnalysis', data)}>
                Exportă raport
              </button>
              <button onClick={onClose}>
                Închide
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unsupported overlay type</div>;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.closeButton} onClick={onClose}>
          <IconX size={24} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatOverlay; 