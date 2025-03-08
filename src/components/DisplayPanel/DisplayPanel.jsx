import React from "react";
import { useChatStore } from "../../store/chatStore";
import CalendarView from "./CalendarView";
import POSView from "./POSView";
import StockView from "./StockView";
import InvoiceView from "./InvoiceView";
import styles from "./DisplayPanel.module.css";

const DisplayPanel = () => {
  const { displayComponent, closeDisplayPanel } = useChatStore();

  // 🔹 Dacă nu există un panou activ, nu afișăm nimic
  if (!displayComponent) return null;

  return (
    <div className={styles.panelContainer}>
      {/* 🔹 Buton de închidere */}
      <button className={styles.closeButton} onClick={closeDisplayPanel}>
        ✖
      </button>

      {displayComponent === "calendar" && <CalendarView />}
      {displayComponent === "pos" && <POSView />}
      {displayComponent === "stock" && <StockView />}
      {displayComponent === "invoice" && <InvoiceView />}
    </div>
  );
};

export default DisplayPanel;