import InvertedCard from "../components/Hero/InvertedCard";
import LocationMap from "../components/LocationMap/LocationMap";
import MarkdownContent from "../components/MarkdownContent";
import styles from "./HomePage.module.css";
import Calendar from "../components/Calendar/Calendar";
import SwipeableCarousel from "../components/SwipeableCarousel/SwipeableCarousel";
import Footer from "../components/Footer/Footer";
import Services from '../components/Services/Services';
import Attractions from '../components/Attractions/Attractions';

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

      <Services />

      <section className={styles.services}>
        <div className={styles.calendarSection}>
          <div className={styles.calendar}>
            <Calendar />
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <Attractions />
      </section>

      <section className={styles.photos}>
        <SwipeableCarousel />
      </section>

      <Footer />
  </div>
  );
}

export default HomePage;
