import React, { useState } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";
import apiService from "../../actions/apiService";

const ChatMessage = ({ text, type, options, reservation, formFields }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const [formData, setFormData] = useState({});

  if (!text) return null;

  // 🔥 Trimitere rezervare la backend
  const handleOptionSelect = async (option) => {
    addMessage({ text: `✅ Ai selectat: ${option}`, type: "user" });
  
    if (!reservation) {
      addMessage({ text: "❌ Informații insuficiente pentru rezervare!", type: "bot" });
      return;
    }
  
    const roomNumber = option.split(" ")[1]; // Extragem numărul camerei
    const reservationData = {
      ...reservation,
      roomNumber, // Adăugăm numărul camerei selectate
    };
  
    try {
      const response = await apiService.createReservation(reservationData);
      addMessage({ text: `✅ ${response.message}`, type: "bot" });
    } catch (error) {
      addMessage({ text: "❌ Eroare la procesarea rezervării!", type: "bot" });
    }
  };

  return (
    <div className={`${styles.message} ${type === "bot" ? styles.botMessage : styles.userMessage}`}>
      {text}

      {/* 🔹 Opțiuni de selecție */}
      {type === "options" && options?.length > 0 && (
        <div className={styles.optionsContainer}>
          {options.map((option, index) => (
            <button key={index} className={styles.optionButton} onClick={() => handleOptionSelect(option)}>
              {option}
            </button>
          ))}
        </div>
      )}

      {/* 🔹 Confirmare */}
      {type === "confirm" && (
        <div className={styles.optionsContainer}>
          <button className={styles.confirmButton} onClick={() => addMessage({ text: "✅ Confirmat", type: "bot" })}>Confirm</button>
          <button className={styles.cancelButton} onClick={() => addMessage({ text: "❌ Anulat", type: "bot" })}>Anulează</button>
        </div>
      )}

      {/* 🔹 Formular */}
      {type === "form" && formFields?.length > 0 && (
        <form className={styles.formContainer} onSubmit={(e) => {
          e.preventDefault();
          addMessage({ text: `📅 Rezervare modificată: ${formData.date}`, type: "bot" });
        }}>
          {formFields.map((field, index) => (
            <div key={index} className={styles.formGroup}>
              <label>{field.label}</label>
              <input
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" className={styles.submitButton}>Trimite</button>
        </form>
      )}
    </div>
  );
};

export default ChatMessage;