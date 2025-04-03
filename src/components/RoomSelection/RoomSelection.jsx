import React, { useState } from 'react';
import styles from './RoomSelection.module.css';
import Calendar from '../Calendar/Calendar';
import useBookingStore from '../../store/bookingStore';

const RoomSelection = () => {
  const { selectedDates, setSelectedDates } = useBookingStore();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const roomTypes = [
    {
      id: 1,
      name: "Camera Standard",
      description: "Camera confortabilă cu pat dublu și baie privată",
      price: "200 RON/noapte",
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Camera Deluxe",
      description: "Camera spațioasă cu pat king-size și baie cu jacuzzi",
      price: "350 RON/noapte",
      image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Apartament",
      description: "Apartament cu două camere, living și bucătărie completă",
      price: "500 RON/noapte",
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  const handlePrevRoom = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : roomTypes.length - 1));
  };

  const handleNextRoom = () => {
    setCurrentIndex((prev) => (prev < roomTypes.length - 1 ? prev + 1 : 0));
  };

  const handleBook = () => {
    if (!selectedRoom || !selectedDates.checkIn || !selectedDates.checkOut) {
      alert('Vă rugăm să selectați o cameră și perioada de cazare');
      return;
    }
    // Aici vom implementa logica de rezervare
    console.log('Rezervare:', { room: selectedRoom, dates: selectedDates });
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectionGrid}>
        <div className={styles.calendarSection}>
          <Calendar />
        </div>

        <div className={styles.periodSection}>
          <div className={styles.selectionItem}>
            <div className={styles.dateInputs}>
              <input
                type="date"
                value={selectedDates.checkIn ? selectedDates.checkIn.toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedDates({ ...selectedDates, checkIn: new Date(e.target.value) })}
              />
              <input
                type="date"
                value={selectedDates.checkOut ? selectedDates.checkOut.toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedDates({ ...selectedDates, checkOut: new Date(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.selectionItem}>
            <select>
              <option value="1">1 persoană</option>
              <option value="2">2 persoane</option>
              <option value="3">3 persoane</option>
              <option value="4">4 persoane</option>
            </select>
          </div>

          <div className={styles.selectionItem}>
            <div className={styles.optionsContainer}>
              <div className={styles.optionItem}>
                <span className={styles.optionLabel}>Mic dejun inclus</span>
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.optionItem}>
                <span className={styles.optionLabel}>Camera pentru fumători</span>
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.roomTypes}>
          <div className={styles.navArrowTop} />
          <div className={styles.roomGrid}>
            {roomTypes.map((room, index) => (
              <div
                key={room.id}
                className={`${styles.roomCard} ${
                  index === currentIndex
                    ? styles.active
                    : index === currentIndex - 1
                    ? styles.prev
                    : index === currentIndex + 1
                    ? styles.next
                    : ''
                } ${selectedRoom?.id === room.id ? styles.selected : ''}`}
                onClick={() => {
                  if (index === currentIndex - 1) {
                    handlePrevRoom();
                  } else if (index === currentIndex + 1) {
                    handleNextRoom();
                  } else {
                    setSelectedRoom(room);
                  }
                }}
              >
                <img src={room.image} alt={room.name} className={styles.roomImage} />
                <div className={styles.roomInfo}>
                  <h3>{room.name}</h3>
                  <span className={styles.roomPrice}>{room.price}</span>
                  {index === currentIndex && (
                    <button className={styles.bookButton} onClick={(e) => {
                      e.stopPropagation();
                      handleBook();
                    }}>
                      Rezervă acum
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.navArrowBottom} />
        </div>
      </div>
    </div>
  );
};

export default RoomSelection; 