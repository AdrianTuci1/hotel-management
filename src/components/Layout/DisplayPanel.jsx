import React, { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import CalendarView from "../../features/calendar/CalendarView";
import POSView from "../../features/pos/POSView";
import StockView from "../../features/stock/StockView";
import InvoiceView from "../../features/invoices/InvoiceView";
import NotificationView from "../../features/notifications/NotificationView";
import AnalysisView from "../../features/analysis/AnalysisView";
import ReportsView from "../../features/reports/ReportsView";
import { IconX } from "@tabler/icons-react";
import styles from "./DisplayPanel.module.css";

// Mapare completă pentru toate tipurile de componente și intențiile posibile
const COMPONENT_MAP = {
  // Componente standard (cu nume de componentă directe)
  'calendar': CalendarView,
  'pos': POSView,
  'stock': StockView,
  'invoices': InvoiceView,
  'reports': ReportsView,
  'notification': NotificationView,
  'analysis': AnalysisView,
  
  // Intențiile din backend (lowercase pentru consistență)
  'show_calendar': CalendarView,
  'show_pos': POSView,
  'show_stock': StockView,
  'show_invoices': InvoiceView,
  'show_reports': ReportsView,
  
  // Variante alternative și abrevieri (pentru robustețe)
  'reservation': CalendarView,  // Intenții legate de rezervări -> Calendar
  'modify_reservation': CalendarView,
  'create_room': CalendarView,  // Intenții legate de camere -> Calendar
  'modify_room': CalendarView,
  'sell_product': POSView       // Intenții legate de vânzări -> POS
};

const DisplayPanel = () => {
  const { displayComponent, closeDisplayComponent, latestIntent } = useChatStore();
  const [lastDetectedFormat, setLastDetectedFormat] = useState(null);

  // Detector pentru formatul hotel-backend
  useEffect(() => {
    if (latestIntent === 'show_calendar') {
      console.log("🔍 [DisplayPanel] Detected show_calendar intent");
      setLastDetectedFormat('hotel-backend');
      
      // Dacă displayComponent nu este calendar, îl setăm
      if (!displayComponent || displayComponent.toLowerCase() !== 'calendar') {
        useChatStore.getState().setDisplayComponent('calendar');
      }
    }
  }, [latestIntent, displayComponent]);

  // Fallback pentru situațiile când avem intent dar nu avem component
  useEffect(() => {
    if (latestIntent && !displayComponent) {
      // Verificăm dacă este un intent pentru calendar
      if (latestIntent.includes('calendar') || latestIntent === 'show_calendar') {
        useChatStore.getState().setDisplayComponent('calendar');
      }
    }
  }, [latestIntent, displayComponent]);

  // Nu afișăm nimic dacă nu avem ce afișa
  if (!displayComponent) {
    return null;
  }

  // Normalizăm componenta (lowercase pentru consistență)
  const normalizedComponent = displayComponent.toLowerCase();
  
  // Determinăm componenta care trebuie afișată
  const ViewComponent = COMPONENT_MAP[normalizedComponent];
  
  // Dacă nu există o componentă pentru tipul cerut, returnăm null
  if (!ViewComponent) {
    // Fallback special pentru calendar
    if (normalizedComponent.includes('calendar')) {
      return (
        <div className={styles.panelContainer}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Calendar & Rezervări</h2>
            <button 
              className={styles.closeButton} 
              onClick={closeDisplayComponent}
              aria-label="Închide panoul"
            >
              <IconX size={24} />
            </button>
          </div>

          <div className={styles.panelContent}>
            <CalendarView />
          </div>
        </div>
      );
    }
    
    return null;
  }

  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          {getDisplayTitle(normalizedComponent)}
        </h2>
        <button 
          className={styles.closeButton} 
          onClick={closeDisplayComponent}
          aria-label="Închide panoul"
        >
          <IconX size={24} />
        </button>
      </div>

      <div className={styles.panelContent}>
        <ViewComponent />
      </div>
    </div>
  );
};

// Helper pentru a obține titlul de afișare bazat pe componenta curentă
const getDisplayTitle = (componentName) => {
  const titles = {
    'calendar': 'Calendar & Rezervări',
    'pos': 'Vânzări & POS',
    'stock': 'Stoc & Inventar',
    'invoices': 'Facturi & Plăți',
    'reports': 'Rapoarte & Analiză',
    'notification': 'Notificări',
    'analysis': 'Analiză',
    'show_calendar': 'Calendar & Rezervări',
    'show_pos': 'Vânzări & POS',
    'show_stock': 'Stoc & Inventar',
    'show_invoices': 'Facturi & Plăți',
    'show_reports': 'Rapoarte & Analiză',
    'reservation': 'Calendar & Rezervări',
    'modify_reservation': 'Calendar & Rezervări',
    'create_room': 'Calendar & Camere',
    'modify_room': 'Calendar & Camere',
    'sell_product': 'Vânzări & POS'
  };
  
  return titles[componentName] || 'Panou de Informații';
};

export default DisplayPanel;