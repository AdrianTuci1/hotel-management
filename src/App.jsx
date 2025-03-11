import React from 'react';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import Dashboard from './views/Dashboard';
import AssistantsView from './components/Assistants/AssistantsView';
import { useNavigationStore } from './store/navigationStore';
import styles from './App.module.css';

// Placeholder components for other menus
const Rooms = () => <div className={styles.pageContainer}>Pagina Camere</div>;
const Housekeeping = () => <div className={styles.pageContainer}>Pagina Housekeeping</div>;
const Restaurant = () => <div className={styles.pageContainer}>Pagina Restaurant</div>;
const Reports = () => <div className={styles.pageContainer}>Pagina Rapoarte</div>;

// Map menu IDs to components
const menuComponents = {
  dashboard: Dashboard,
  assistants: AssistantsView,
  rooms: Rooms,
  housekeeping: Housekeeping,
  restaurant: Restaurant,
  reports: Reports,
};

const App = () => {
  const { activeMenu } = useNavigationStore();
  const ActiveComponent = menuComponents[activeMenu];

  return (
    <div className={styles.app}>
      <Navbar />
      <Sidebar />
      <main className={styles.mainContent}>
        <ActiveComponent />
      </main>
    </div>
  );
};

export default App;