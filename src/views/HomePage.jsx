import InvertedCard from "../components/Hero/InvertedCard";
import LocationMap from "../components/LocationMap/LocationMap";
import MarkdownContent from "../components/MarkdownContent";
import styles from "./HomePage.module.css";

function HomePage() {

    const title = "Hotel Phoenix";
    const identifier = "Bucuresti";
    const position = [
        40.712776,
       -74.005974
    ]

  return (
  <div className={styles.main}>
    <section className={styles.hero}>
      <InvertedCard />
    </section>
      <section className={styles.descriptionMap}>
        <div className={styles.description}>
          <div className={styles.hotelInfo}>
            <h1 className={styles.title}>{title}</h1>
            <h3 className={styles.identifier}>{identifier}</h3>
          </div>
          <div className={styles.hotelDescription}>
            <MarkdownContent filePath="/content/hotel-description.md" />
          </div>
        </div>
        <div className={styles.map}>
          <LocationMap position={position} />
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.service}>
          <h3>Service 1</h3>
          <p>Description 1</p>
        </div>
        <div className={styles.service}>
          <h3>Service 2</h3>
          <p>Description 2</p>
        </div>
      </section>

      <section className={styles.services}>
        
      </section>
  </div>
  );
}

export default HomePage;
