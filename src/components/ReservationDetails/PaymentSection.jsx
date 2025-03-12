import React from 'react';
import styles from './ReservationDetails.module.css';

const PaymentSection = ({
  paymentStatus,
  setPaymentStatus,
  reservationData,
  setReservationData
}) => {
  const handlePaymentStatusChange = (field, value) => {
    const newStatus = { ...paymentStatus, [field]: value };
    setPaymentStatus(newStatus);
    setReservationData({ ...reservationData, ...newStatus });
  };

  return (
    <div className={styles.paymentSection}>
      <h5>💰 Detalii Plată</h5>
      <div className={styles.paymentOptions}>
        <label>
          <input
            type="checkbox"
            checked={paymentStatus.isPaid}
            onChange={(e) => handlePaymentStatusChange('isPaid', e.target.checked)}
          />
          Achitat
        </label>
        <label>
          <input
            type="checkbox"
            checked={paymentStatus.hasReceipt}
            onChange={(e) => handlePaymentStatusChange('hasReceipt', e.target.checked)}
          />
          Bon Fiscal
        </label>
        <label>
          <input
            type="checkbox"
            checked={paymentStatus.hasInvoice}
            onChange={(e) => handlePaymentStatusChange('hasInvoice', e.target.checked)}
          />
          Factură
        </label>
      </div>
    </div>
  );
};

export default PaymentSection; 