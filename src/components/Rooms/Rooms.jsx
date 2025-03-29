import styles from './Rooms.module.css';
import { FaWifi, FaParking, FaSwimmingPool, FaTv, FaCoffee, FaUtensils, FaSnowflake, FaShower } from 'react-icons/fa';

const roomsData = [
  {
    id: 1,
    name: 'Camera Deluxe',
    description: 'Camera spațioasă cu vedere la oraș, mobilată elegant și dotată cu toate facilitățile necesare pentru un sejur confortabil.',
    image: '/cam1.jpg',
    price: 450,
    amenities: [
      { icon: <FaWifi />, name: 'WiFi' },
      { icon: <FaTv />, name: 'TV Smart' },
      { icon: <FaCoffee />, name: 'Cafetieră' },
      { icon: <FaSnowflake />, name: 'Aer Condiționat' },
      { icon: <FaShower />, name: 'Duș' },
      { icon: <FaUtensils />, name: 'Room Service' }
    ]
  },
  {
    id: 2,
    name: 'Camera Executive',
    description: 'Camera premium cu balcon și vedere panoramică, perfectă pentru o experiență de cazare de lux.',
    image: '/cam2.jpeg',
    price: 650,
    amenities: [
      { icon: <FaWifi />, name: 'WiFi' },
      { icon: <FaTv />, name: 'TV Smart' },
      { icon: <FaCoffee />, name: 'Cafetieră' },
      { icon: <FaSnowflake />, name: 'Aer Condiționat' },
      { icon: <FaShower />, name: 'Duș' },
      { icon: <FaUtensils />, name: 'Room Service' },
      { icon: <FaParking />, name: 'Parcare' },
      { icon: <FaSwimmingPool />, name: 'Acces Piscină' }
    ]
  }
];

const Rooms = () => {
  return (
    <div className={styles.roomsContainer}>
      {roomsData.map((room) => (
        <div key={room.id} className={styles.roomCard}>
          <div className={styles.imageSection}>
            <img src={room.image} alt={room.name} className={styles.roomImage} />

          </div>
          <div className={styles.contentSection}>
            <h2 className={styles.roomName}>{room.name}</h2>
            <p className={styles.roomDescription}>{room.description}</p>
            <div className={styles.amenities}>
              {room.amenities.map((amenity, index) => (
                <div key={index} className={styles.amenity}>
                  <span className={styles.amenityIcon}>{amenity.icon}</span>
                  <span className={styles.amenityName}>{amenity.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.priceButton}>
              de la {room.price} RON
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Rooms; 