import React, { useState, useEffect } from "react";
import styles from "./ReservationDetails.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";

// Subcomponente
import ClientSection from "./ClientSection";
import RoomsSection from "./RoomsSection";
import PaymentSection from "./PaymentSection";
import ActionButtons from "./ActionButtons";

const ReservationDetails = ({ 
  reservationData, 
  setReservationData, 
  onFinalize,
  roomManagement,
  onCancel,
  onDelete
}) => {
  // ===== Store Hooks =====
  // Din roomOptionsStore:
  // - selectedRooms: array cu camerele selectate curent
  // - addRoom: adaugă o cameră în selecție
  // - removeRoom: elimină o cameră din selecție
  // - updateRoomPeriod: actualizează perioada pentru o cameră
  // - updateRoomPrice: actualizează prețul pentru o cameră
  // - getRoomInfo: obține informații despre o cameră
  // - clearRooms: curăță toate camerele selectate




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
      // Inițializăm starea clientului
      setExistingClient(!!reservationData.existingClientId);
      setPaymentStatus({
        isPaid: reservationData.isPaid || false,
        hasInvoice: reservationData.hasInvoice || false,
        hasReceipt: reservationData.hasReceipt || false
      });
    }
  }, [reservationData?.id]);

  // ===== Event Handlers =====
  const handleSave = async () => {
    if (!validateReservation()) {
      return;
    }
    onFinalize();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleDelete = () => {
    onDelete();
  };

  const validateReservation = () => {
    if (!reservationData.fullName) {
      alert("❌ Vă rugăm să completați numele clientului!");
      return false;
    }

    if (!roomManagement.selectedRooms.length) {
      alert("❌ Vă rugăm să selectați cel puțin o cameră!");
      return false;
    }

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

          <RoomsSection 
            defaultDates={roomManagement.defaultDates}
            selectedRooms={roomManagement.selectedRooms}
            setReservationData={setReservationData}
            isRoomAvailable={roomManagement.isRoomAvailable}
            addRoom={roomManagement.addRoom}
            removeRoom={roomManagement.removeRoom}
            updateRoomPeriod={roomManagement.updateRoomPeriod}
            updateRoomPrice={roomManagement.updateRoomPrice}
            getRoomInfo={roomManagement.getRoomInfo}
            setHighlightedRoom={roomManagement.setHighlightedRoom}
            setDefaultDates={roomManagement.setDefaultDates}
          />

          <PaymentSection 
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            reservationData={reservationData}
            setReservationData={setReservationData}
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