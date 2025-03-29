import styles from './Facilities.module.css';

const facilitiesData = [
  {
    id: 1,
    name: 'Piscină',
    description: 'Bucură-te de o piscină încălzită cu apă dulce, perfectă pentru relaxare și distracție. Deschisă în sezonul cald, oferă o experiență unică de înot și relaxare.',
    image: '/pool.jpg'
  },
  {
    id: 2,
    name: 'Restaurant',
    description: 'Restaurantul nostru oferă o experiență culinară deosebită, cu preparate tradiționale și internaționale. Bucătăria noastră folosește ingrediente proaspete și de calitate.',
    image: '/restaurant.jpg'
  },
  {
    id: 3,
    name: 'Sala Fitness',
    description: 'Sala noastră de fitness este dotată cu echipamente moderne și oferă un spațiu perfect pentru menținerea formei fizice în timpul sejurului.',
    image: '/images/facilities/gym.jpg'
  },
  {
    id: 4,
    name: 'Sala de Jocuri',
    description: 'Sala de jocuri este locul perfect pentru distracție și socializare, oferind o varietate de jocuri și activități pentru toate vârstele.',
    image: '/game.jpg'
  }
];

const Facilities = () => {
  return (
    <div className={styles.facilitiesContainer}>
      {facilitiesData.map((facility) => (
        <div key={facility.id} className={styles.facilityCard}>
          <div className={styles.imageWrapper}>
            <img src={facility.image} alt={facility.name} className={styles.facilityImage} />
            <div className={styles.overlay}>
              <h2 className={styles.facilityName}>{facility.name}</h2>
            </div>
          </div>
          <div className={styles.content}>
            <p className={styles.description}>{facility.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Facilities; 