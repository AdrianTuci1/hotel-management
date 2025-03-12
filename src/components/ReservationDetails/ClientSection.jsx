import React from 'react';
import styles from './ReservationDetails.module.css';

const ClientSection = ({ 
  existingClient, 
  setExistingClient, 
  reservationData, 
  setReservationData 
}) => {
  return (
    <>
      {/* Selector Client Existent */}
      <div className={styles.reservationField}>
        <label>
          <input
            type="checkbox"
            checked={existingClient}
            onChange={(e) => setExistingClient(e.target.checked)}
          />
          Client Existent
        </label>
      </div>

      {existingClient ? (
        <div className={styles.reservationField}>
          <label>Selectează Client:</label>
          <select
            value={reservationData.existingClientId || ""}
            onChange={(e) => setReservationData({ 
              ...reservationData, 
              existingClientId: e.target.value 
            })}
          >
            <option value="">Selectează un client</option>
            {/* Aici se vor popula clienții existenți */}
          </select>
        </div>
      ) : (
        <>
          <div className={styles.reservationField}>
            <label>Nume Complet:</label>
            <input
              type="text"
              value={reservationData.fullName || ""}
              onChange={(e) => setReservationData(prev => ({
                ...prev,
                fullName: e.target.value,
                guestName: e.target.value
              }))}
              placeholder="Nume și Prenume"
            />
          </div>

          <div className={styles.reservationField}>
            <label>Telefon:</label>
            <input
              type="tel"
              value={reservationData.phone || ""}
              onChange={(e) => setReservationData({ 
                ...reservationData, 
                phone: e.target.value 
              })}
              placeholder="Telefon"
            />
          </div>

          <div className={styles.reservationField}>
            <label>Email:</label>
            <input
              type="email"
              value={reservationData.email || ""}
              onChange={(e) => setReservationData({ 
                ...reservationData, 
                email: e.target.value 
              })}
              placeholder="Email"
            />
          </div>
        </>
      )}

      <div className={styles.reservationField}>
        <label>Observații:</label>
        <textarea
          value={reservationData.notes || ""}
          onChange={(e) => setReservationData({ 
            ...reservationData, 
            notes: e.target.value 
          })}
          placeholder="Observații suplimentare..."
          rows={3}
        />
      </div>
    </>
  );
};

export default ClientSection; 