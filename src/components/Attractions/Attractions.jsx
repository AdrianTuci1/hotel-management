import styles from './Attractions.module.css';

const attractionsData = [
  {
    id: 1,
    name: 'Parcul Herăstrău',
    image: '/castelul-bran2.jpg',
    isAvailable: true
  },
  {
    id: 2,
    name: 'Muzeul Național de Artă',
    image: '/brasov.jpg',
    isAvailable: true
  },
  {
    id: 3,
    name: 'Centrul Vechi',
    image: '/clabucet.jpeg',
    isAvailable: true
  },
  {
    id: 4,
    name: 'Atracție Lipsă',
    image: null,
    isAvailable: false
  }
];

const Attractions = () => {
  return (
    <div className={styles.attractionsContainer}>
      {attractionsData.map((attraction) => (
        <div 
          key={attraction.id} 
          className={`${styles.attractionCard} ${!attraction.isAvailable ? styles.emptyCard : ''}`}
        >
          <div className={styles.imageWrapper}>
            {attraction.isAvailable ? (
              <img 
                src={attraction.image} 
                alt={attraction.name} 
                className={styles.attractionImage}
              />
            ) : (
              <div className={styles.emptyImage}>
                <span className={styles.emptyText}>Atracție Lipsă</span>
              </div>
            )}
            <div className={styles.overlay}>
              <span className={styles.label}>Atracție</span>
              <span className={styles.name}>{attraction.name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Attractions; 