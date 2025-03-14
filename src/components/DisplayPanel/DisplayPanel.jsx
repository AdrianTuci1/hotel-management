import React from "react";
import { useChatStore } from "../../store/chatStore";
import CalendarView from "./CalendarView";
import POSView from "./POSView";
import StockView from "./StockView";
import InvoiceView from "../../features/invoices/InvoiceView";
import NotificationView from "./NotificationView";
import AnalysisView from "./AnalysisView";
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

const DisplayPanel = ({ data }) => {
  const { displayComponent, closeDisplayComponent } = useChatStore();

  // Logging pentru debugging
  console.group("🎯 DisplayPanel Render");
  console.log("Display Component:", displayComponent);
  console.log("Data:", data);
  console.groupEnd();

  // 🔹 Dacă nu există un panou activ, nu afișăm nimic
  if (!displayComponent) return null;

  // 🔹 Determinăm componenta care trebuie afișată
  const ViewComponent = COMPONENT_MAP[displayComponent];
  if (!ViewComponent) {
    console.warn(`⚠️ Nu există o componentă pentru tipul: ${displayComponent}`);
    return null;
  }

  // 🔹 Determinăm titlul panoului
  const getPanelTitle = () => {
    const titles = {
      calendar: 'Calendar Rezervări',
      show_calendar: 'Calendar Rezervări',
      pos: 'Point of Sale',
      show_pos: 'Point of Sale',
      stock: 'Gestiune Stocuri',
      show_stock: 'Gestiune Stocuri',
      invoices: 'Facturi',
      show_invoices: 'Facturi',
      notification: data?.title || 'Notificare',
      analysis: 'Analiză'
    };

    return titles[displayComponent] || 'Panou';
  };

  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelHeader}>
        <h2>{getPanelTitle()}</h2>
        <button 
          className={styles.closeButton} 
          onClick={closeDisplayComponent}
          aria-label="Închide panoul"
        >
          <IconX size={24} />
        </button>
      </div>

      <div className={styles.panelContent}>
        <ViewComponent data={data} />
      </div>
    </div>
  );
};

export default DisplayPanel;