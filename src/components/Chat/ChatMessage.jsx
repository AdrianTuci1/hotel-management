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
import { IconExternalLink } from "@tabler/icons-react";

/**
 * Message types enum for better type checking
 */
export const MESSAGE_TYPES = {
  USER: "user",
  BOT: "bot",
  NOTIFICATION: "notification",
  ANALYSIS: "analysis"
};

/**
 * Renders a single chat message
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The message text
 * @param {string} props.type - Message type (user, bot, notification, analysis)
 * @param {Object} [props.reservation] - Optional reservation data
 * @param {Object} [props.link] - Optional link data
 * @param {string} [props.aiResponse] - Optional AI response suggestion
 * @param {Function} [props.onShowDetails] - Callback for showing reservation details
 * @returns {JSX.Element|null} The rendered message or null if no text
 */
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

  // Determine message class based on type
  const messageClasses = [
    styles.message,
    type === MESSAGE_TYPES.BOT ? styles.botMessage : 
    type === MESSAGE_TYPES.NOTIFICATION ? styles.notificationMessage :
    type === MESSAGE_TYPES.ANALYSIS ? styles.analysisMessage :
    styles.userMessage,
  ].filter(Boolean).join(" ");

  return (
    <div className={messageClasses}>
      <div className={styles.messageHeader}>
        <div className={styles.messageText}>
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
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(MESSAGE_TYPES)).isRequired,
  reservation: PropTypes.object,
  link: PropTypes.shape({
    url: PropTypes.string.isRequired,
    text: PropTypes.string
  }),
  aiResponse: PropTypes.string,
  onShowDetails: PropTypes.func
};

export default ChatMessage;