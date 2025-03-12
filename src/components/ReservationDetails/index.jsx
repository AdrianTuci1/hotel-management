import React, { useState, useEffect } from "react";
import styles from "./ReservationDetails.module.css";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import apiService from "../../actions/apiService";

// Subcomponente
import ClientSection from "./ClientSection";
import RoomsSection from "./RoomsSection";
import PaymentSection from "./PaymentSection";
import ActionButtons from "./ActionButtons";

const ReservationDetails = ({ reservationData, setReservationData, options, onFinalize }) => {
  // ===== Store Hooks =====
  // Din roomOptionsStore:
  // - selectedRooms: array cu camerele selectate curent
  // - addRoom: adaugă o cameră în selecție
  // - removeRoom: elimină o cameră din selecție
  // - updateRoomPeriod: actualizează perioada pentru o cameră
  // - updateRoomPrice: actualizează prețul pentru o cameră
  // - getRoomInfo: obține informații despre o cameră
  // - clearRooms: curăță toate camerele selectate
  const { 
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    getRoomInfo,
    clearRooms
  } = useRoomOptionsStore();

  // Din calendarStore:
  // - updateViewPeriod: actualizează perioada vizibilă în calendar
  // - isRoomAvailable: verifică disponibilitatea unei camere
  const {
    updateViewPeriod,
    isRoomAvailable
  } = useCalendarStore();

  // ===== Local State =====
  const [existingClient, setExistingClient] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isPaid: false,
    hasInvoice: false,
    hasReceipt: false
  });
  const [defaultDates, setDefaultDates] = useState({
    startDate: "",
    endDate: ""
  });

  // ===== Effects =====
  useEffect(() => {
    if (reservationData) {
      // Curățăm starea anterioară din roomOptionsStore
      clearRooms();

      // Inițializăm starea clientului
      initializeClientState();
      
      // Inițializăm datele rezervării
      initializeReservationData();

      // Configurăm perioada și camerele
      if (reservationData.startDate && reservationData.endDate) {
        setupPeriodAndRooms();
      }
    }

    return () => {
      // Curățăm starea la demontarea componentei
      clearRooms();
    };
  }, [reservationData?.id]);

  // ===== Initialization Functions =====
  const initializeClientState = () => {
    setExistingClient(!!reservationData.existingClientId);
    setPaymentStatus({
      isPaid: reservationData.isPaid || false,
      hasInvoice: reservationData.hasInvoice || false,
      hasReceipt: reservationData.hasReceipt || false
    });
  };

  const initializeReservationData = () => {
    const updatedData = {
      ...reservationData,
      fullName: reservationData.guestName || reservationData.fullName || "",
      notes: reservationData.preferences || reservationData.notes || "",
    };
    setReservationData(updatedData);
  };

  const setupPeriodAndRooms = () => {
    // Setăm perioada implicită
    setDefaultDates({
      startDate: reservationData.startDate,
      endDate: reservationData.endDate
    });

    // Actualizăm perioada vizibilă în calendar (calendarStore)
    updateViewPeriod(reservationData.startDate, reservationData.endDate);

    // Adăugăm camerele existente în roomOptionsStore
    if (reservationData.rooms?.length > 0) {
      reservationData.rooms.forEach(room => {
        if (isRoomAvailable(room.roomNumber, room.startDate, room.endDate)) {
          addRoom(room.roomNumber, room.startDate, room.endDate);
          updateRoomPrice(room.roomNumber, room.price);
        }
      });
    }
  };

  // ===== Event Handlers =====
  const handleSave = async () => {
    try {
      if (!validateReservation()) {
        return;
      }

      const dataToSave = prepareReservationData();
      await apiService.createReservation(dataToSave);
      clearRooms();
      onFinalize();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert("❌ A apărut o eroare la salvarea rezervării!");
    }
  };

  const validateReservation = () => {
    if (!reservationData.fullName && !reservationData.guestName) {
      alert("❌ Vă rugăm să completați numele clientului!");
      return false;
    }

    if (!selectedRooms.length) {
      alert("❌ Vă rugăm să selectați cel puțin o cameră!");
      return false;
    }

    return true;
  };

  const prepareReservationData = () => {
    return {
      ...reservationData,
      guestName: reservationData.fullName || reservationData.guestName,
      preferences: reservationData.notes || reservationData.preferences,
      rooms: selectedRooms.map(room => ({
        ...room,
        type: extractRoomInfo(options.find(opt => 
          extractRoomNumber(opt) === room.roomNumber
        ))?.type || ""
      }))
    };
  };

  const handleDelete = () => {
    if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
      setReservationData({});
      clearRooms();
    }
  };

  // ===== Helper Functions =====
  const extractRoomNumber = (option) => {
    const match = option.match(/Camera (\d+)/);
    return match ? match[1] : null;
  };

  const extractRoomInfo = (option) => {
    if (!option) return null;
    const match = option.match(/Camera (\d+) - (\w+) \((\d+) lei\/noapte\)/);
    if (match) {
      return {
        roomNumber: match[1],
        type: match[2],
        basePrice: parseInt(match[3])
      };
    }
    return null;
  };

  return (
    <>
      <div className={styles.reservationDetails}>
        <h4>📅 Detalii rezervare</h4>
        
        <ClientSection 
          existingClient={existingClient}
          setExistingClient={setExistingClient}
          reservationData={reservationData}
          setReservationData={setReservationData}
        />

        <RoomsSection 
          options={options}
          defaultDates={defaultDates}
          selectedRooms={selectedRooms}
          reservationData={reservationData}
          setReservationData={setReservationData}
          isRoomAvailable={isRoomAvailable}
          addRoom={addRoom}
          removeRoom={removeRoom}
          updateRoomPeriod={updateRoomPeriod}
          updateRoomPrice={updateRoomPrice}
          extractRoomInfo={extractRoomInfo}
        />

        <PaymentSection 
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          reservationData={reservationData}
          setReservationData={setReservationData}
        />
      </div>

      <ActionButtons 
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={onFinalize}
      />
    </>
  );
};

export default ReservationDetails; 