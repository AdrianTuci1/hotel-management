import React from 'react';
import styles from '../../App.module.css';
import Navbar from '../Navbar/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.contentContainer}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 