import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Website from './pages/Website';
import LoadingFallback from './components/LoadingFallback';
import styles from './App.module.css';

// Import main page components
import Rooms from './pages/Rooms';
import Facilities from './pages/Facilities';
import Attractions from './pages/Attractions';
import Login from './pages/login/Login';

// Lazy load the Management component
const Management = lazy(() => import('./pages/Management'));

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<Website />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/login" element={<Login />} />
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