import React, { useState, useEffect } from "react";
import styles from "./ReservationDetails.module.css";
// import { useRoomOptionsStore } from "../../store/roomOptionsStore"; // Named import (incorrect)
import useRoomOptionsStore from "../../store/roomOptionsStore"; // Default import

// Subcomponente
import ClientSection from "./ClientSection";
import RoomsSection from "./RoomsSection";
import PaymentSection from "./PaymentSection";
import ActionButtons from "./ActionButtons";

const ReservationDetails = ({ 
  reservationData, 
  setReservationData, 
  onFinalize,
  onCancel,
  onDelete
}) => {
  // Get selectedRooms directly from the store for validation
  const selectedRooms = useRoomOptionsStore(state => state.selectedRooms);

  // ===== Local State =====
  const [existingClient, setExistingClient] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isPaid: false,
    hasInvoice: false,
    hasReceipt: false
  });

  // ===== Effects =====
  useEffect(() => {
    if (reservationData) {
      setExistingClient(!!reservationData.existingClientId);
      setPaymentStatus({
        isPaid: reservationData.isPaid || false,
        hasInvoice: reservationData.hasInvoice || false,
        hasReceipt: reservationData.hasReceipt || false
      });
    } else {
      // Reset state if reservationData becomes null/undefined
      setExistingClient(false);
      setPaymentStatus({ isPaid: false, hasInvoice: false, hasReceipt: false });
    }
    // Depend on reservationData object itself for re-initialization
  }, [reservationData]); 

  // ===== Event Handlers =====
  const handleSave = async () => {
    if (!validateReservation()) {
      return;
    }
    // onFinalize might use reservationData which now includes updated rooms/payment
    onFinalize(); 
  };

  const handleCancel = () => {
    console.log("🔍 [ReservationDetails] handleCancel called");
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      console.error("❌ onCancel is not a function in ReservationDetails:", onCancel);
    }
  };

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete();
    } else {
      console.error("❌ onDelete is not a function in ReservationDetails:", onDelete);
    }
  };

  const validateReservation = () => {
    if (!reservationData?.fullName) { // Use optional chaining
      alert("❌ Vă rugăm să completați numele clientului!");
      return false;
    }

    // Use selectedRooms from the store for validation
    if (!selectedRooms.length) { 
      alert("❌ Vă rugăm să selectați cel puțin o cameră!");
      return false;
    }

    // Add any other validation rules here (e.g., payment details if required)

    return true;
  };

  return (
    <>
      <div className={styles.reservationDetails}>
        <div className={styles.reservationContent}>
          <h4>📅 Detalii rezervare</h4>
          
          <ClientSection 
            existingClient={existingClient}
            setExistingClient={setExistingClient}
            reservationData={reservationData}
            setReservationData={setReservationData}
          />

          {/* Pass only setReservationData to RoomsSection */}
          <RoomsSection 
            setReservationData={setReservationData}
          />

          <PaymentSection 
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus} // Pass down setter for local state
            reservationData={reservationData}
            setReservationData={setReservationData} // Allow PaymentSection to update main data
          />
        </div>
      </div>

      <ActionButtons 
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ReservationDetails; 