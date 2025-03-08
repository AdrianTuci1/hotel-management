import React from "react";
import styles from "./App.module.css";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    <div className={styles.appContainer}>
      <Dashboard />
    </div>
  );
};

export default App;