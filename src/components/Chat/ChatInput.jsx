/**
 * ChatInput Component
 * 
 * A component that renders the chat input field with command suggestions.
 * Handles user input and provides auto-suggestions for supported commands.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./ChatInput.module.css";
import { commandSuggestions } from "../../utils/chatSuggestions";

/**
 * Chat input component with command suggestions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Callback function to handle message submission
 * @returns {JSX.Element} Rendered component
 */
const ChatInput = ({ onSendMessage }) => {
  // State for input value and current suggestion
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState("");

  /**
   * Handles input change and updates suggestions
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Find suggestion based on input value
    const foundSuggestion = commandSuggestions.find((cmd) =>
      value.toLowerCase().startsWith(cmd.trigger)
    );

    setSuggestion(foundSuggestion ? foundSuggestion.suggestion : "");
  };

  /**
   * Handles form submission and sends message
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
    setSuggestion("");
  };

  /**
   * Handles keyboard shortcuts
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    // Auto-complete suggestion with Tab key
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setInput(suggestion);
      setSuggestion("");
    }
  };

  return (
    <div className={styles.container}>
      {/* Input field with form submission */}
      <div className={styles.inputContainer}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Scrie o comandă..."
            className={styles.inputField}
            aria-label="Chat input"
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>

      {/* Command suggestion appears below the input */}
      {suggestion && (
        <div className={styles.suggestionContainer}>
          <div className={`${styles.suggestionBox} ${suggestion ? styles.show : styles.hidden}`}>
            {suggestion}
            <span className={styles.tabHint}>(press Tab)</span>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for better documentation and validation
ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired
};

export default ChatInput;