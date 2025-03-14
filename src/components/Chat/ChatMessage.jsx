import React from "react";
import styles from "./ChatMessage.module.css";
import { IconExternalLink } from "@tabler/icons-react";

const ChatMessage = ({ text, type, reservation, link, aiResponse, onShowDetails }) => {
  if (!text) return null;

  // If there's a reservation, show details immediately, but only once when mounted
  React.useEffect(() => {
    if (reservation && onShowDetails) {
      // Small delay to ensure proper state initialization
      const timer = setTimeout(() => {
        onShowDetails(reservation);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this only runs once when mounted

  const messageClasses = [
    styles.message,
    type === "bot" ? styles.botMessage : 
    type === "notification" ? styles.notificationMessage :
    type === "analysis" ? styles.analysisMessage :
    styles.userMessage,
  ].filter(Boolean).join(" ");

  return (
    <div className={messageClasses}>
      <div className={styles.messageHeader}>
        <div className={styles.messageText}>
          <p>{text}</p>
          {link && (
            <a href={link.url} className={styles.messageLink} target="_blank" rel="noopener noreferrer">
              <IconExternalLink size={16} />
              {link.text}
            </a>
          )}
        </div>
      </div>

      {aiResponse && (
        <div className={styles.aiResponse}>
          <p>Răspuns sugerat:</p>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;