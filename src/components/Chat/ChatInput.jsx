import React, { useState } from "react";
import styles from "./ChatInput.module.css";
import { commandSuggestions } from "../../utils/chatSuggestions";

const ChatInput = ({ onSendMessage }) => {
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const foundSuggestion = commandSuggestions.find((cmd) =>
      value.toLowerCase().startsWith(cmd.trigger)
    );

    setSuggestion(foundSuggestion ? foundSuggestion.suggestion : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
    setSuggestion("");
  };

  return (
    <div>
      {/* 🔹 Input-ul de chat */}
      <div className={styles.inputContainer}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Scrie o comandă..."
            className={styles.inputField}
          />
          <button type="submit" className={styles.sendButton}>➤</button>
        </form>
      </div>

      {/* 🔹 Sugestia se afișează sub chat */}
      {suggestion && (
        <div className={styles.suggestionContainer}>
          <div className={`${styles.suggestionBox} ${suggestion ? "show" : "hidden"}`}>
            {suggestion}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;