import React from 'react';
import styles from './ReservationDetails.module.css';
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";

const ActionButtons = ({ onSave, onDelete, onCancel }) => {
  return (
    <div className={styles.actionButtons}>
      <button 
        className={styles.saveButton} 
        onClick={onSave}
      >
        <IconDeviceFloppy size={16} />
        Salvează și finalizează
      </button>
      <button 
        className={styles.cancelButton} 
        onClick={onCancel}
      >
        <IconX size={16} />
        Renunță
      </button>
      <button 
        onClick={onDelete} 
        className={styles.deleteButton}
      >
        🗑️ Șterge
      </button>
    </div>
  );
};

export default ActionButtons; 