/**
 * AddPhoneNumber Component
 * 
 * Allows adding or updating a phone number for an existing reservation.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconPhone } from '@tabler/icons-react';
import styles from './AddPhoneNumber.module.css';

/**
 * Form for adding or updating phone numbers for existing reservations
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Reservation data including the current phone number if exists
 * @param {Function} props.onAction - Callback for form actions (save)
 * @param {Function} props.onClose - Callback when form is closed/canceled
 * @returns {JSX.Element} The phone number form
 */
const AddPhoneNumber = ({ data, onAction, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber || '');

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = () => {
    onAction('updatePhone', {
      reservationId: data.id,
      phoneNumber: phoneNumber
    });
  };

  return (
    <div className={styles.addPhone}>
      <div className={styles.addPhoneHeader}>
        <IconPhone size={24} />
        <h3>Adaugă număr de telefon</h3>
      </div>
      
      {data && (
        <div className={styles.reservationInfo}>
          <p><strong>Rezervare:</strong> {data.id}</p>
          <p><strong>Client:</strong> {data.customerName}</p>
          <p><strong>Dată sosire:</strong> {data.checkInDate}</p>
        </div>
      )}
      
      <div className={styles.phoneForm}>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Număr de telefon</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+40712345678"
            required
          />
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={handleSubmit}
          className={styles.primaryButton}
          disabled={!phoneNumber.trim()}
        >
          Salvează
        </button>
        <button onClick={onClose} className={styles.secondaryButton}>
          Anulează
        </button>
      </div>
    </div>
  );
};

AddPhoneNumber.propTypes = {
  data: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddPhoneNumber; 