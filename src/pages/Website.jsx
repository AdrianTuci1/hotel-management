import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../App.module.css';
import HomePage from '../views/HomePage';

const Website = () => {
  return (
    <div className={styles.pageContainer}>
      <Link to="/dashboard" className={styles.dashboardLink}>
        Go to Dashboard
      </Link>
      <HomePage />
    </div>
  );
};

export default Website; 