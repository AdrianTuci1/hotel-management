import React, { useState } from "react";
import styles from "./ChatMessage.module.css";
import { useChatStore } from "../../store/chatStore";

const ChatMessage = ({ text, type, options, formFields }) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const [formData, setFormData] = useState({});

  // Selectare opțiune
  const handleOptionSelect = (option) => {
    addMessage(`Ai selectat: ${option}`, "user");
  };

  // Confirmare acțiune
  const handleConfirm = (confirmed) => {
    addMessage(confirmed ? "✅ Confirmat" : "❌ Anulat", "bot");
  };

  // Form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    addMessage(`📅 Rezervare modificată: ${formData.date}`, "bot");
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

      {/* 🔹 Confirmare acțiune */}
      {type === "confirm" && (
        <div className={styles.optionsContainer}>
          <button className={styles.confirmButton} onClick={() => handleConfirm(true)}>Confirm</button>
          <button className={styles.cancelButton} onClick={() => handleConfirm(false)}>Anulează</button>
        </div>
      )}

      {/* 🔹 Formular pentru completare */}
      {type === "form" && formFields?.length > 0 && (
        <form className={styles.formContainer} onSubmit={handleFormSubmit}>
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