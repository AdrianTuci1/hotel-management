import React from "react";
import { useChatStore } from "../../store/chatStore";
import CalendarView from "../../features/calendar/CalendarView";
import POSView from "../../features/pos/POSView";
import StockView from "../../features/stock/StockView";
import InvoiceView from "../../features/invoices/InvoiceView";
import NotificationView from "../../features/notifications/NotificationView";
import AnalysisView from "../../features/analysis/AnalysisView";
import { IconX } from "@tabler/icons-react";
import styles from "./DisplayPanel.module.css";

// Mapare actualizată pentru toate tipurile de componente posibile
const COMPONENT_MAP = {
  calendar: CalendarView,
  pos: POSView,
  stock: StockView,
  invoices: InvoiceView,
  notification: NotificationView,
  analysis: AnalysisView,
  // Adăugăm și variantele cu prefix pentru compatibilitate
  show_calendar: CalendarView,
  show_pos: POSView,
  show_stock: StockView,
  show_invoices: InvoiceView
};

const DisplayPanel = () => {
  const { displayComponent, closeDisplayComponent } = useChatStore();


  // 🔹 Dacă nu există un panou activ, nu afișăm nimic
  if (!displayComponent) return null;

  // 🔹 Determinăm componenta care trebuie afișată
  const ViewComponent = COMPONENT_MAP[displayComponent];
  if (!ViewComponent) {
    console.warn(`⚠️ Nu există o componentă pentru tipul: ${displayComponent}`);
    return null;
  }


  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelHeader}>
        <button 
          className={styles.closeButton} 
          onClick={closeDisplayComponent}
          aria-label="Închide panoul"
        >
          <IconX size={24} />
        </button>
      </div>

      <div className={styles.panelContent}>
        <ViewComponent/>
      </div>
    </div>
  );
};

export default DisplayPanel;