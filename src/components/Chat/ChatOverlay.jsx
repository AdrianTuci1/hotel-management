/**
 * ChatOverlay Component
 * 
 * Renders an overlay with different content types (reservation details, room management, product sales)
 * based on current chat interactions. Provides a modal-like experience within the chat interface.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChatOverlay.module.css';
import ReservationDetails from '../ReservationDetails';
import RoomManagement from '../RoomManagement/RoomManagement';
import ProductSales from '../ProductSales/ProductSales';
import { useChatStore } from '../../store/chatStore';

/**
 * Overlay types enum for better type checking
 */
export const OVERLAY_TYPES = {
  RESERVATION: 'reservation',
  ROOM_MANAGEMENT: 'room',
  PRODUCT_SALES: 'productSales'
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
 * @returns {JSX.Element|null} The overlay component or null if not visible
 */
const ChatOverlay = ({ 
  isVisible, 
  type, 
  data, 
  onClose,
  onAction,
}) => {
  if (!isVisible) return null;
  
  // Direct access to closeOverlay from chatStore for robust closing
  const closeOverlayFromStore = useChatStore(state => state.closeOverlay);

  /**
   * Handles closing the overlay, ensuring state cleanup.
   */
  const handleCloseWithFallback = () => {
    console.log("🔍 [ChatOverlay] handleCloseWithFallback triggered.");

    if (typeof onClose === 'function') {
      console.log("Calling onClose prop...");
      onClose();
    } else {
      console.warn("⚠️ [ChatOverlay] onClose prop is not a function. Attempting direct close.");
    }

    // Use a short timeout to check if the overlay is still visible (in case onClose failed or was async)
    // This acts as a fallback mechanism.
    setTimeout(() => {
      if (useChatStore.getState().overlay.isVisible) {
        console.warn("⚠️ [ChatOverlay] Overlay still visible after onClose attempt. Forcing close via store action.");
        closeOverlayFromStore();
      }
    }, 50); // Reduced timeout
  };

  /**
   * Renders the appropriate content based on overlay type
   * @returns {JSX.Element} The rendered content
   */
  const renderContent = () => {
    console.log(`🔍 [ChatOverlay] Rendering content for type: ${type}`);
    
    switch (type) {
      case OVERLAY_TYPES.RESERVATION:
        return (
          <ReservationDetails 
            reservationData={data} 
            setReservationData={(updatedData) => onAction('updateReservationDataOnly', updatedData)} 
            onFinalize={() => onAction('finalizeReservation', data)}
            onCancel={handleCloseWithFallback}
            onDelete={() => onAction('deleteReservation', data)}
          />
        );
        
      case OVERLAY_TYPES.ROOM_MANAGEMENT:
        return <RoomManagement 
                  room={data}
                  onAction={onAction} 
                  onClose={handleCloseWithFallback}
               />;

      case OVERLAY_TYPES.PRODUCT_SALES:
        return <ProductSales 
                  products={data?.products || []}
                  reservation={data?.reservation} 
                  onAction={onAction} 
                  onClose={handleCloseWithFallback}
               />;

      default:
        console.error(`❌ [ChatOverlay] Unsupported overlay type: ${type}`);
        return <div>Unsupported overlay type: {type}</div>;
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
};

export default ChatOverlay; 