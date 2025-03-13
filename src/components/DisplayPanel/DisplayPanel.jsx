import React from "react";
import { useChatStore } from "../../store/chatStore";
import CalendarView from "./CalendarView";
import POSView from "./POSView";
import StockView from "./StockView";
import styles from "./DisplayPanel.module.css";
import InvoiceView from "../../features/invoices/InvoiceView";

const DisplayPanel = () => {
  const { displayComponent, closeDisplayComponent } = useChatStore();

  // 🔹 Dacă nu există un panou activ, nu afișăm nimic
  if (!displayComponent) return null;

  return (
    <div className={styles.panelContainer}>
      {/* 🔹 Buton de închidere */}
      <button className={styles.closeButton} onClick={closeDisplayComponent}>
        ✖
      </button>

      {displayComponent === "calendar" && <CalendarView />}
      {displayComponent === "pos" && <POSView />}
      {displayComponent === "stock" && <StockView />}
      {displayComponent === "invoices" && <InvoiceView />}
    </div>
  );
};

export default DisplayPanel;