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
    number: '',
    type: 'standard',
    otherType: '',
    price: '',
    // Spread room data if it exists
    ...(room || {})
  });

  // Update form data when room prop changes
  useEffect(() => {
    if (room) {
      setRoomFormData({
        number: room.number || '',
        type: room.type || 'standard',
        otherType: '',
        price: room.price || '',
      });
    }
  }, [room]);

  // Handle input changes for room form
  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setRoomFormData(prev => ({ ...prev, [name]: value }));
  };

  const isOtherType = roomFormData.type === 'other';

  const handleSubmit = () => {
    console.log('Submitting form data:', roomFormData); // Debug log
    onAction(isEditing ? 'updateRoom' : 'addRoom', {
      number: roomFormData.number,
      type: isOtherType ? roomFormData.otherType : roomFormData.type,
      price: roomFormData.price
    });
  };

  return (
    <div className={styles.roomManagement}>
      <div className={styles.roomManagementHeader}>
        <IconBed size={24} />
        <h3>{isEditing ? 'Editare cameră' : 'Adăugare cameră nouă'}</h3>
      </div>
      <div className={styles.roomForm}>
        <div className={styles.formGroup}>
          <label htmlFor="number">Număr cameră</label>
          <input
            type="text"
            id="number"
            name="number"
            value={roomFormData.number}
            onChange={handleRoomInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="type">Tip cameră</label>
          <select
            id="type"
            name="type"
            value={roomFormData.type}
            onChange={handleRoomInputChange}
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="apartment">Apartament</option>
            <option value="other">Alt tip</option>
          </select>
        </div>

        {isOtherType && (
          <div className={styles.formGroup}>
            <label htmlFor="otherType">Specificați tipul camerei</label>
            <input
              type="text"
              id="otherType"
              name="otherType"
              value={roomFormData.otherType}
              onChange={handleRoomInputChange}
              required
              placeholder="Ex: Executive, Family Room, etc."
            />
          </div>
        )}
        
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
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={handleSubmit}
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
    number: PropTypes.string,
    type: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onAction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default RoomManagement; 