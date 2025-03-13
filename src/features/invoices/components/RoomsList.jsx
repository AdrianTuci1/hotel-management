import React from 'react';
import styles from '../styles/InvoiceView.module.css';

const RoomsList = ({ 
  rooms, 
  loading, 
  error, 
  onSelectRoom, 
  searchTerm, 
  dateRange, 
  onSearch, 
  onDateChange 
}) => {
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      room.guest.toLowerCase().includes(searchTerm.toLowerCase());
    
    const checkOutDate = new Date(room.checkOut);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const isInDateRange = checkOutDate >= startDate && checkOutDate <= endDate;
    
    return matchesSearch && isInDateRange && room.status === "occupied";
  });

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.loader}></span>
        <p>Se încarcă camerele...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  if (filteredRooms.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nu s-au găsit camere pentru criteriile selectate.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Caută după număr cameră sau nume oaspete..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.dateRangeGroup}>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateChange({ ...dateRange, startDate: e.target.value })}
            className={styles.dateInput}
          />
          <span className={styles.dateSeparator}>-</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateChange({ ...dateRange, endDate: e.target.value })}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.roomsGrid}>
        {filteredRooms.map((room) => (
          <div
            key={room.number}
            className={`${styles.roomCard} ${room.hasInvoice ? styles.hasInvoice : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <div className={styles.roomHeader}>
              <h3>Camera {room.number}</h3>
              {room.hasInvoice && (
                <span className={styles.invoiceStatus}>
                  Facturat ({room.invoiceNumber})
                </span>
              )}
            </div>
            <p className={styles.guestName}>{room.guest}</p>
            <div className={styles.roomDates}>
              <span>Check-in: {room.checkIn}</span>
              <span>Check-out: {room.checkOut}</span>
            </div>
            <button 
              className={`${styles.invoiceButton} ${room.hasInvoice ? styles.viewButton : ''}`}
            >
              {room.hasInvoice ? 'Vezi Factura' : 'Emite Factură'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default RoomsList; 