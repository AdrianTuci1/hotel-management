import React from "react";
import PropTypes from "prop-types";
import styles from "./ChatMessage.module.css";
import { 
  IconMessage, 
  IconMail, 
  IconChartBar, 
  IconChevronDown, 
  IconChevronUp,
  IconGlobe 
} from "@tabler/icons-react";
import { AUTOMATION_TYPES } from "./constants";

const getIconForType = (type) => {
  switch (type) {
    case AUTOMATION_TYPES.WHATSAPP:
      return <IconMessage size={20} />;
    case AUTOMATION_TYPES.EMAIL:
      return <IconMail size={20} />;
    case AUTOMATION_TYPES.PRICE:
      return <IconChartBar size={20} />;
    case AUTOMATION_TYPES.WEBSITE:
      return <IconGlobe size={20} />;
    default:
      return null;
  }
};

const DataSection = ({ title, data }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!data) return null;

  return (
    <div className={styles.dataSection}>
      <button 
        className={styles.dataSectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{title}</span>
        {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>
      {isExpanded && (
        <div className={styles.dataContent}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const AutomationMessage = ({ notification }) => {
  const { type, title, message, data } = notification;

  // Verificăm dacă este o rezervare de pe website
  const isWebsiteBooking = type === AUTOMATION_TYPES.WEBSITE;

  return (
    <div className={`${styles.message} ${styles.automationMessage}`}>
      <div className={styles.messageHeader}>
        <div className={styles.automationIcon}>
          {getIconForType(type)}
        </div>
        <div className={styles.messageContent}>
          <h4 className={styles.automationTitle}>{title}</h4>
          <p className={styles.automationMessage}>{message}</p>
          
          {data?.confirmationMessage && (
            <div className={styles.confirmationMessage}>
              <p className={styles.confirmationLabel}>Răspuns generat:</p>
              <p className={styles.confirmationText}>{data.confirmationMessage}</p>
            </div>
          )}

          {data?.data && (
            <DataSection 
              title={isWebsiteBooking ? "Date rezervare website" : "Date rezervare"} 
              data={data.data} 
            />
          )}

          {data?.result && (
            <DataSection 
              title="Rezultat procesare" 
              data={data.result} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

AutomationMessage.propTypes = {
  notification: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(AUTOMATION_TYPES)).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    data: PropTypes.shape({
      confirmationMessage: PropTypes.string,
      data: PropTypes.object,
      result: PropTypes.object
    })
  }).isRequired
};

export default AutomationMessage; 