import styles from './Services.module.css';

const servicesData = [
  {
    id: 1,
    title: 'Piscină',
    description: 'Bucură-te de o piscină încălzită cu apă dulce, perfectă pentru relaxare și distracție.',
    image: '/pool.jpg'
  },
  {
    id: 2,
    title: 'Sala de Joacă',
    description: 'Spațiu special amenajat pentru copii, cu jucării și activități distractive pentru toate vârstele.',
    image: '/game.jpg'
  }
];

const Services = () => {
  return (
    <section className={styles.services}>
      {servicesData.map((service) => (
        <div key={service.id} className={styles.serviceCard}>
          <div className={styles.imageWrapper}>
            <img src={service.image} alt={service.title} className={styles.serviceImage} />
            <div className={styles.overlay}>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Services; 