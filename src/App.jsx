import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Website from './pages/Website';
import LoadingFallback from './components/LoadingFallback';
import styles from './App.module.css';

// Lazy load the Management component
const Management = lazy(() => import('./pages/Management'));

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<Website />} />
          <Route
            path="/dashboard/*"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Management />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 