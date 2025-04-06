/**
 * ChatWindow Component
 * 
 * The main container component for the chat interface. Manages messages, overlays,
 * and handles chat interactions. Acts as the orchestration layer for the chat experience.
 */
import React, { useMemo } from "react";
import styles from "./ChatWindow.module.css";
import ChatMessage from "./ChatMessage";
import ChatOverlay from "./ChatOverlay";
import ChatInput from "./ChatInput";
import { handleChatMessage } from "../../actions/chatActions";
import { STRUCTURED_COMMANDS } from "./constants/commands";
import { useChatWindowLogic } from "./hooks/useChatWindowLogic";

/**
 * Main chat window component - rendering the UI and orchestrating interactions.
 * Logic and state management are handled by the useChatWindowLogic hook.
 * 
 * @returns {JSX.Element} The rendered chat window
 */
const ChatWindow = () => {
  // Use the custom hook
  const {
    messages,
    latestIntent,
    latestUserMessage,
    overlay,
    showCommands,
    onShowDetails,
    onOverlayAction,
    handleCloseOverlay,
    toggleCommands,
  } = useChatWindowLogic();

  // Group commands by category
  const commandsByCategory = useMemo(() => {
    return STRUCTURED_COMMANDS.reduce((acc, cmd) => {
      const categoryName = cmd.category; // e.g., "Navigare", "Rezervări"
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(cmd);
      return acc;
    }, {});
  }, []);

  // Helper function to generate CSS class name from category name
  const getCategoryClassName = (categoryName) => {
    // Remove special characters (&, spaces, diacritics potentially)
    // Keep Romanian characters like ă, î, ș, ț if needed by CSS
    const cleanedName = categoryName
      .replace(/&/g, '')        // Remove ampersand
      .replace(/\s+/g, '');     // Remove spaces
      // Add more replacements if needed for diacritics, ensure CSS matches
      // Example: .replace(/ă/g, 'a').replace(/î/g, 'i') etc.
      // Current CSS uses: Navigare, Rezervări, Camere, VânzăriProduse, Rapoarte, Ajutor
      // Let's adapt based on CSS: 'Rezervări' -> 'Rezervări', 'Vânzări & Produse' -> 'VânzăriProduse' 
    if (categoryName === "Vânzări & Produse") return "VânzăriProduse";
    return cleanedName; // For others like Navigare, Rezervări, Camere, Rapoarte, Ajutor
  };

  return (
    <div className={styles.chatContainer}>
      {/* Intent display in top-left */}
      {latestIntent && (
        <div className={styles.latestIntent} aria-label="Current Intent">
          Intent: {latestIntent}
        </div>
      )}

      {/* Original Toggle Button using commandsButton style */}
      <button 
        onClick={toggleCommands} 
        className={styles.commandsButton} // Use original class for positioning/style
        aria-label={showCommands ? "Hide Commands" : "Show Commands"}
        aria-expanded={showCommands}
      >
        ?
      </button>

      {/* Main Chat Area Wrapper */}
      <div className={styles.chatWrapper}>
        {/* Messages List Area */} 
        <div className={styles.messageList} role="log" aria-label="Chat messages">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onShowDetails={onShowDetails} 
            />
          ))}
        </div>

        {/* Commands Panel - uses absolute positioning via commandsPanel class */} 
        {showCommands && (
          <div className={styles.commandsPanel} role="region" aria-label="Available commands">
            <h4> {/* Keep the h4 structure for title and close button */}
              Comenzi Disponibile {/* Original Title */}
              <button 
                className={styles.commandsClose} 
                onClick={toggleCommands}
                aria-label="Close commands panel"
              >
                ×
              </button>
            </h4>
            
            {/* Iterate over the grouped commands */}
            {Object.entries(commandsByCategory).map(([category, commandList]) => {
              const categoryClassName = getCategoryClassName(category);
              return (
                <div key={category}>
                  {/* Original Category Title structure and styling */}
                  <h5 className={`${styles.commandCategory} ${styles[`category${categoryClassName}`]}`}>
                    {category}
                  </h5>
                  <ul className={styles.commandsList}>
                    {commandList.map((command) => (
                      <li key={command.command} className={styles.commandItem}>
                        <div className={styles.commandText}>{command.command}</div> {/* Use div for command text */} 
                        <div className={styles.commandDescription}>{command.description}</div> {/* Use div for description */} 
                        {command.example && (
                          <div className={styles.commandExample}>
                            Exemplu: {command.example}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Latest User Message */}
        {latestUserMessage && (
          <div className={styles.latestUserMessageInline} aria-label="Latest message">
            {latestUserMessage}
          </div>
        )}

        {/* Input Area */} 
        <ChatInput onSendMessage={handleChatMessage} />
      </div> 

      {/* Overlay */} 
      {overlay.isVisible && (
        <ChatOverlay
          type={overlay.type}
          data={overlay.data}
          onClose={handleCloseOverlay}
          onAction={onOverlayAction}
        />
      )}
    </div>
  );
};

export default ChatWindow;