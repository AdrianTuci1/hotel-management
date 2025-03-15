/**
 * ChatOverlay Component
 * 
 * Renders an overlay with different content types (reservation details, notifications, analysis)
 * based on current chat interactions. Provides a modal-like experience within the chat interface.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChatOverlay.module.css';
import ReservationDetails from '../ReservationDetails';
import { IconX, IconChartBar, IconBell } from '@tabler/icons-react';

/**
 * Overlay types enum for better type checking
 */
export const OVERLAY_TYPES = {
  RESERVATION: 'reservation',
  NOTIFICATION: 'notification',
  ANALYSIS: 'analysis'
};

/**
 * Renders a modal-like overlay for showing different content types
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the overlay is visible
 * @param {string} props.type - Type of overlay content to display
 * @param {Object} props.data - Data to be displayed in the overlay
 * @param {Function} props.onClose - Callback when overlay is closed
 * @param {Function} props.onAction - Callback for overlay actions
 * @param {Object} props.roomManagement - Room management data and functions
 * @returns {JSX.Element|null} The overlay component or null if not visible
 */
const ChatOverlay = ({ 
  isVisible, 
  type, 
  data, 
  onClose,
  onAction,
  roomManagement
}) => {
  if (!isVisible) return null;

  /**
   * Renders the appropriate content based on overlay type
   * @returns {JSX.Element} The rendered content
   */
  const renderContent = () => {
    switch (type) {
      case OVERLAY_TYPES.RESERVATION:
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

      case OVERLAY_TYPES.NOTIFICATION:
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

      case OVERLAY_TYPES.ANALYSIS:
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
                  {/* Placeholder for chart components */}
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
    <div className={styles.overlay} aria-modal="true" role="dialog">
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

// PropTypes for better documentation and validation
ChatOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(Object.values(OVERLAY_TYPES)),
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  roomManagement: PropTypes.shape({
    selectedRooms: PropTypes.array.isRequired,
    defaultDates: PropTypes.object,
    isRoomAvailable: PropTypes.func.isRequired,
    addRoom: PropTypes.func.isRequired,
    removeRoom: PropTypes.func.isRequired,
    updateRoomPeriod: PropTypes.func.isRequired,
    updateRoomPrice: PropTypes.func.isRequired,
    getRoomInfo: PropTypes.func.isRequired,
    setHighlightedRoom: PropTypes.func.isRequired
  }).isRequired
};

export default ChatOverlay; 