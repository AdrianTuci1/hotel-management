import React, { useState } from 'react';
import styles from './styles/InvoiceView.module.css';
import RoomsList from './components/RoomsList';
import InvoiceForm from './components/InvoiceForm';
import useRooms from './hooks/useRooms';
import useInvoiceForm from './hooks/useInvoiceForm';
import { getDefaultDateRange } from './utils/dateUtils';

const InvoiceView = () => {
  const { rooms, loading, error, refreshRooms } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  
  const {
    invoiceData,
    setInvoiceData,
    handleCompanySearch,
    handleSaveInvoice,
    handleGenerateInvoice
  } = useInvoiceForm();

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
  };

  const handleSave = () => {
    const success = handleSaveInvoice(selectedRoom);
    if (success) {
      refreshRooms();
      handleBack();
    }
  };

  return (
    <div className={styles.invoiceContainer}>
      <h2>🧾 Facturi</h2>

      {!selectedRoom ? (
        <RoomsList
          rooms={rooms}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          dateRange={dateRange}
          onSelectRoom={handleRoomSelect}
          onSearch={setSearchTerm}
          onDateChange={setDateRange}
        />
      ) : (
        <InvoiceForm
          selectedRoom={selectedRoom}
          invoiceData={invoiceData}
          onInvoiceDataChange={setInvoiceData}
          onBack={handleBack}
          onSave={handleSave}
          onGenerateInvoice={(type) => handleGenerateInvoice(type, selectedRoom)}
          onCompanySearch={handleCompanySearch}
        />
      )}
    </div>
  );
};

export default InvoiceView; 