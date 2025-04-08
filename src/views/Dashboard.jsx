import React, { useState, useRef, useCallback } from "react";
import ChatWindow from "../components/Chat/ChatWindow";
import DisplayPanel from "../components/Layout/DisplayPanel";
import ReceptionDashboard from "../components/ReceptionDashboard/ReceptionDashboard";
import styles from "./Dashboard.module.css";
import { useChatStore } from "../store/chatStore";

const Dashboard = () => {
  const { displayComponent } = useChatStore();
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(displayComponent ? 50 : 30); // 50% pentru DisplayPanel, 30% pentru ReceptionDashboard
  const containerRef = useRef(null);
  const initialX = useRef(0);
  const initialWidth = useRef(0);

  // Actualizăm width-ul când se schimbă componenta
  React.useEffect(() => {
    setPanelWidth(displayComponent ? 50 : 70);
  }, [displayComponent]);

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    initialX.current = e.clientX;
    initialWidth.current = containerRef.current.getBoundingClientRect().width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - initialX.current;
    const containerWidth = containerRef.current.parentElement.offsetWidth;
    const newWidth = ((initialWidth.current + deltaX) / containerWidth) * 100;
    
    // Limităm redimensionarea între 30% și 70%
    if (newWidth >= 30 && newWidth <= 70) {
      setPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Adăugăm și eliminăm event listeners doar când este necesar
  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Conditionally determine the component to show in the side panel
  // Show DisplayPanel if displayComponent is set, otherwise show ReceptionDashboard
  const SidePanelComponent = displayComponent ? DisplayPanel : ReceptionDashboard;
  const showSidePanel = true; // Side panel should always be shown

  // Original logic kept for reference:
  // const SidePanelComponent = displayComponent ? DisplayPanel : null; 
  // const showSidePanel = !!displayComponent; 

  // Original logic kept for reference:
  // const showSidePanel = displayComponent || !displayComponent; // This was always true
  // const SidePanelComponent = displayComponent ? DisplayPanel : ReceptionDashboard; // This was the original

  return (
    <div className={styles.dashboardContainer}>
      <div 
        className={`${styles.chatContainer} ${showSidePanel ? styles.chatWithPanel : ""}`}
        style={{ width: showSidePanel ? `${panelWidth}%` : '100%' }}
        ref={containerRef}
      >
        <ChatWindow />
      </div>

      {showSidePanel && (
        <>
          <div 
            className={styles.resizer}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.resizerLine} />
            <div className={styles.resizerHandle} />
          </div>

          <div 
            className={styles.panelContainer}
            style={{ width: `${100 - panelWidth}%` }}
          >
            <SidePanelComponent />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;