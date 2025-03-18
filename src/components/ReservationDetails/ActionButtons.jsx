import React from 'react';
import styles from './ReservationDetails.module.css';
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";

const ActionButtons = ({ onSave, onDelete, onCancel }) => {
  const handleCancel = () => {
    console.log("🔍 [ActionButtons] Cancel button clicked");
    console.log("onCancel type:", typeof onCancel);
    if (typeof onCancel === 'function') {
      console.log("Calling onCancel function");
      onCancel();
    } else {
      console.error("❌ onCancel is not a function:", onCancel);
    }
  };

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
        onClick={handleCancel}
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