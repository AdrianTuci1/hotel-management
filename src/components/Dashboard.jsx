import React, { useState, useRef, useCallback } from "react";
import ChatWindow from "./Chat/ChatWindow";
import DisplayPanel from "./DisplayPanel/DisplayPanel";
import ReceptionDashboard from "./ReceptionDashboard/ReceptionDashboard";
import styles from "./Dashboard.module.css";
import { useChatStore } from "../store/chatStore";

const Dashboard = () => {
  const { displayComponent } = useChatStore();
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(50); // procent din lățimea totală
  const containerRef = useRef(null);
  const initialX = useRef(0);
  const initialWidth = useRef(0);

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

  return (
    <div className={styles.dashboardContainer}>
      {/* Chat și ReceptionDashboard overlay */}
      <div 
        className={`${styles.chatContainer} ${displayComponent ? styles.chatWithPanel : ""}`}
        style={{ width: displayComponent ? `${panelWidth}%` : '100%' }}
        ref={containerRef}
      >
        <ChatWindow />
        {!displayComponent && (
          <div className={styles.receptionOverlay}>
            <ReceptionDashboard />
          </div>
        )}
      </div>

      {/* Resizer și Display Panel */}
      {displayComponent && (
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
            <DisplayPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;