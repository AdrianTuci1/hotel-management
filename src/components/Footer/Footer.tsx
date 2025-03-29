import React from 'react';
import styles from './Footer.module.css';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Column 1: Logo and Powered By */}
        <div className={styles.footerColumn}>
          <div className={styles.footerLogo}>
            <img src="/logoclinic.png" alt="Clinic Logo" className={styles.clinicLogo} />
            <h3 className={styles.clinicName}>Shinedent</h3>
          </div>
          <p className={styles.poweredBy}>Powered by Simplu</p>
        </div>

        {/* Column 2: Contact and Social Media */}
        <div className={styles.footerColumn}>
          <h3 className={styles.contactTitle}>Contact Us</h3>
          <p className={styles.contactItem}>
            <FaMapMarkerAlt className={styles.footerIcon} /> Bulevardul Dacia Nr.84, Bucharest
          </p>
          <p className={styles.contactItem}>
            <FaPhoneAlt className={styles.footerIcon} /> +40 123 456 789
          </p>
          <p className={styles.contactItem}>
            <FaEnvelope className={styles.footerIcon} /> info@democlinic.com
          </p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Simplu. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;