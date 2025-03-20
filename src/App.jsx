import React from 'react';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import Dashboard from './views/Dashboard';
import AssistantsView from './components/Assistants/AssistantsView';
import ScheduleView from './components/Schedule/ScheduleView';
import { useNavigationStore } from './store/navigationStore';
import styles from './App.module.css';
import HistoryView from './components/History/HistoryView';

// Placeholder components for other menus
const Restaurant = () => <div className={styles.pageContainer}>Pagina Restaurant</div>;
const Reports = () => <div className={styles.pageContainer}>Pagina Rapoarte</div>;

// Map menu IDs to components
const menuComponents = {
  dashboard: Dashboard,
  assistants: AssistantsView,
  schedule: ScheduleView,
  history: HistoryView,
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