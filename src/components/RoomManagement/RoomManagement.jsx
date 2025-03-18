/**
 * RoomManagement Component
 * 
 * Handles adding new rooms and editing existing rooms in the hotel management system.
 * Used within the overlay system for a modal-like experience.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconBed } from '@tabler/icons-react';
import styles from './RoomManagement.module.css';

/**
 * Form for managing (adding/editing) a room
 * 
 * @param {Object} props - Component props
 * @param {Object} props.room - Room data (if editing) containing type, number, price
 * @param {Function} props.onAction - Callback for form actions (save, delete)
 * @param {Function} props.onClose - Callback when form is closed/canceled
 * @returns {JSX.Element} The room management form
 */
const RoomManagement = ({ room, onAction, onClose }) => {
  const isEditing = !!room?.id;
  
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    roomType: 'standard',
    price: '',
    capacity: 2,
    features: [],
    availability: true,
    // Spread room data if it exists
    ...(room || {})
  });

  // Handle input changes for room form
  const handleRoomInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRoomFormData({ ...roomFormData, [name]: checked });
    } else {
      setRoomFormData({ ...roomFormData, [name]: value });
    }
  };

  // Handle features selection for room form
  const handleFeatureToggle = (feature) => {
    const features = [...roomFormData.features];
    if (features.includes(feature)) {
      features.splice(features.indexOf(feature), 1);
    } else {
      features.push(feature);
    }
    setRoomFormData({ ...roomFormData, features });
  };

  return (
    <div className={styles.roomManagement}>
      <div className={styles.roomManagementHeader}>
        <IconBed size={24} />
        <h3>{isEditing ? 'Editare cameră' : 'Adăugare cameră nouă'}</h3>
      </div>
      <div className={styles.roomForm}>
        <div className={styles.formGroup}>
          <label htmlFor="roomNumber">Număr cameră</label>
          <input
            type="text"
            id="roomNumber"
            name="roomNumber"
            value={roomFormData.roomNumber}
            onChange={handleRoomInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="roomType">Tip cameră</label>
          <select
            id="roomType"
            name="roomType"
            value={roomFormData.roomType}
            onChange={handleRoomInputChange}
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="apartment">Apartament</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="price">Preț pe noapte (RON)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={roomFormData.price}
            onChange={handleRoomInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="capacity">Capacitate (persoane)</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            min="1"
            max="10"
            value={roomFormData.capacity}
            onChange={handleRoomInputChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Facilități</label>
          <div className={styles.featuresGrid}>
            {['Wi-Fi', 'TV', 'Minibar', 'Balcon', 'Aer condiționat', 'Seif', 'Vedere la mare', 'Jacuzzi'].map(feature => (
              <div key={feature} className={styles.featureItem}>
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={roomFormData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                />
                <label htmlFor={`feature-${feature}`}>{feature}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="availability">Disponibilitate</label>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              id="availability"
              name="availability"
              checked={roomFormData.availability}
              onChange={handleRoomInputChange}
            />
            <label htmlFor="availability">
              {roomFormData.availability ? 'Disponibilă' : 'Indisponibilă'}
            </label>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={() => onAction(isEditing ? 'updateRoom' : 'addRoom', roomFormData)}
          className={styles.primaryButton}
        >
          {isEditing ? 'Salvează modificări' : 'Adaugă cameră'}
        </button>
        {isEditing && (
          <button
            onClick={() => onAction('deleteRoom', room)}
            className={styles.dangerButton}
          >
            Șterge cameră
          </button>
        )}
        <button onClick={onClose} className={styles.secondaryButton}>
          Anulează
        </button>
      </div>
    </div>
  );
};

RoomManagement.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roomNumber: PropTypes.string,
    roomType: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onAction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default RoomManagement; 