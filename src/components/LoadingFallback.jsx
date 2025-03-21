import React from 'react';
import styles from './LoadingFallback.module.css';

const LoadingFallback = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
};

export default LoadingFallback; 