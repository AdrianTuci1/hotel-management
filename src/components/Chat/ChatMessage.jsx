/**
 * ChatMessage Component
 * 
 * Renders a single chat message with different styles based on message type.
 * Supports various message types: user, bot, notification, and analysis.
 * Can also display reservation details and links.
 */
import React from "react";
import PropTypes from "prop-types";
import styles from "./ChatMessage.module.css";
import { IconExternalLink, IconX } from "@tabler/icons-react";
import AutomationMessage from "./AutomationMessage";
import { MESSAGE_TYPES } from "./constants";

/**
 * Renders a single chat message
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The message text
 * @param {string} props.type - Message type (user, bot, notification, analysis)
 * @param {Object} [props.reservation] - Optional reservation data
 * @param {Object} [props.link] - Optional link data
 * @param {string} [props.aiResponse] - Optional AI response suggestion
 * @param {boolean} [props.isCanceled] - Whether the reservation was canceled
 * @param {Function} [props.onShowDetails] - Callback for showing reservation details
 * @param {Object} [props.notification] - Optional notification data
 * @returns {JSX.Element|null} The rendered message or null if no text
 */
const ChatMessage = ({ 
  text, 
  type, 
  reservation, 
  link, 
  aiResponse, 
  isCanceled,
  onShowDetails,
  notification 
}) => {
  // Handle automation messages
  if (type === MESSAGE_TYPES.AUTOMATION && notification) {
    return <AutomationMessage notification={notification} />;
  }

  if (!text) return null;

  // If there's a reservation and it's not canceled, show details immediately, but only once when mounted
  React.useEffect(() => {
    if (reservation && onShowDetails && !isCanceled) {
      // Small delay to ensure proper state initialization
      const timer = setTimeout(() => {
        onShowDetails(reservation);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this only runs once when mounted

  // Determine message class based on type
  const messageClasses = [
    styles.message,
    type === MESSAGE_TYPES.BOT ? styles.botMessage : 
    type === MESSAGE_TYPES.NOTIFICATION ? styles.notificationMessage :
    type === MESSAGE_TYPES.ANALYSIS ? styles.analysisMessage :
    styles.userMessage,
    isCanceled ? styles.canceledMessage : null,
  ].filter(Boolean).join(" ");

  return (
    <div className={messageClasses}>
      <div className={styles.messageHeader}>
        <div className={styles.messageText}>
          {isCanceled && (
            <div className={styles.canceledIndicator}>
              <IconX size={16} />
              <span>Anulat</span>
            </div>
          )}
          <p>{text}</p>
          {link && (
            <a 
              href={link.url} 
              className={styles.messageLink} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={link.text || "External link"}
            >
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

// PropTypes for better documentation and validation
ChatMessage.propTypes = {
  text: PropTypes.string,
  type: PropTypes.oneOf(Object.values(MESSAGE_TYPES)).isRequired,
  reservation: PropTypes.object,
  link: PropTypes.shape({
    url: PropTypes.string.isRequired,
    text: PropTypes.string
  }),
  aiResponse: PropTypes.string,
  isCanceled: PropTypes.bool,
  onShowDetails: PropTypes.func,
  notification: PropTypes.object
};

export default ChatMessage;