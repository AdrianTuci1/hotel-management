import React, { useState, useEffect } from 'react';
import styles from './RoomSelection.module.css';
import useBookingStore from '../../store/bookingStore';

const RoomSelection = () => {
  const { selectedDates, setSelectedDates } = useBookingStore();
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState({
    breakfast: false,
    smokingRoom: false
  });

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (type, value) => {
    if (!value) return;
    
    const newDate = new Date(value);
    newDate.setHours(0, 0, 0, 0);
    
    if (type === 'checkIn' && selectedDates.checkOut && newDate > selectedDates.checkOut) {
      setSelectedDates({ checkIn: newDate, checkOut: null });
    } else if (type === 'checkOut' && selectedDates.checkIn && newDate < selectedDates.checkIn) {
      setSelectedDates({ checkIn: newDate, checkOut: null });
    } else {
      setSelectedDates({
        ...selectedDates,
        [type]: newDate
      });
    }
  };

  const roomTypes = [
    { 
      id: 1, 
      name: 'Camera Standard', 
      capacity: 2, 
      price: 200,
      image: '/cam1.jpg' 
    },
    { 
      id: 2, 
      name: 'Camera Deluxe', 
      capacity: 3, 
      price: 300,
      image: '/cam2.jpeg'
    },
    { 
      id: 3, 
      name: 'Apartament', 
      capacity: 4, 
      price: 400,
      image: '/cam3.avif'
    },
    { 
      id: 4, 
      name: 'Camera Executive', 
      capacity: 2, 
      price: 350,
      image: '/images/rooms/executive-room.jpg'
    },
  ];

  const handleNavigation = (direction) => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'down' && currentIndex < roomTypes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleBooking = () => {
    if (!selectedRoom || !selectedDates.checkIn || !selectedDates.checkOut) {
      alert('Vă rugăm să selectați o cameră și să specificați perioada de cazare');
      return;
    }
    // Aici putem adăuga logica de rezervare
    alert('Rezervare în curs de procesare...');
  };

  const getCardStyle = (index) => {
    const diff = index - currentIndex;
    if (diff === 0) {
      return {
        transform: 'translateY(0)',
        opacity: 1,
        zIndex: 2,
      };
    } else if (diff === 1) {
      return {
        transform: 'translateY(110%)',
        opacity: 0.5,
        zIndex: 1,
      };
    } else if (diff === -1) {
      return {
        transform: 'translateY(-110%)',
        opacity: 0.5,
        zIndex: 1,
      };
    } else {
      return {
        transform: `translateY(${diff > 0 ? '170%' : '-170%'})`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none'
      };
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectionGrid}>
        <div className={styles.selectionItem}>
          <h3>Perioada</h3>
          <div className={styles.dateInputs}>
            <input
              type="date"
              value={selectedDates.checkIn ? selectedDates.checkIn.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('checkIn', e.target.value)}
              placeholder="Check-in"
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="date"
              value={selectedDates.checkOut ? selectedDates.checkOut.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('checkOut', e.target.value)}
              placeholder="Check-out"
              min={selectedDates.checkIn ? selectedDates.checkIn.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.selectContainer}>
            <h3>Număr de persoane</h3>
            <select 
              value={guests} 
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'persoană' : 'persoane'}</option>
              ))}
            </select>
          </div>

          <div className={styles.optionsContainer}>
            <div className={styles.optionItem}>
              <span className={styles.optionLabel}>Mic dejun inclus</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={options.breakfast}
                  onChange={() => handleOptionChange('breakfast')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.optionItem}>
              <span className={styles.optionLabel}>Cameră fumători</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={options.smokingRoom}
                  onChange={() => handleOptionChange('smokingRoom')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.roomTypes}>
          <h3>Tipuri de camere disponibile</h3>
          <div className={styles.roomGrid}>
            {roomTypes.map((room, index) => (
              <div 
                key={room.id} 
                className={`${styles.roomCard} ${selectedRoom === room.id ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedRoom(room.id);
                  setCurrentIndex(index);
                }}
                style={getCardStyle(index)}
              >
                <img 
                  src={room.image} 
                  alt={room.name}
                  className={styles.roomImage}
                />
                <div className={styles.roomInfo}>
                  <h4>{room.name}</h4>
                  <p>Capacitate: {room.capacity} persoane</p>
                  <p>Preț: {room.price} RON/noapte</p>
                  <button 
                    className={styles.bookButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking();
                    }}
                  >
                    Rezervă acum
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.navigationButtons}>
            <button 
              className={styles.navButton}
              onClick={() => handleNavigation('up')}
              disabled={currentIndex === 0}
            >
              ↑
            </button>
            <button 
              className={styles.navButton}
              onClick={() => handleNavigation('down')}
              disabled={currentIndex === roomTypes.length - 1}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection; 