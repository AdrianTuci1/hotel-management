import React, { useState } from "react";
import ChatWindow from "./Chat/ChatWindow";
import DisplayPanel from "./DisplayPanel/DisplayPanel";
import styles from "./Dashboard.module.css";
import { useChatStore } from "../store/chatStore";

const Dashboard = () => {

  const { displayComponent } = useChatStore();
  
  return (
    <div className={styles.dashboardContainer}>
      {/* 🗨️ Chat-ul */}
      <div className={`${styles.chatFull} ${displayComponent ? styles.chatWithPanel : ""}`}>
        <ChatWindow />
      </div>

      {/* 📊 Panoul de afișare dacă este activ */}
      {displayComponent && (
        <div className={styles.panelContainer}>
          <DisplayPanel />
        </div>
      )}
    </div>
  );
};

export default Dashboard;