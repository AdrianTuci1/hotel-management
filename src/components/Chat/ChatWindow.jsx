import React, { useEffect, useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import styles from "./ChatWindow.module.css";
import { useChatStore } from "../../store/chatStore";
import { handleChatMessage, connectSocket } from "../../actions/chatActions";

const commandsList = [
  "deschide calendarul",
  "deschide pos-ul",
  "deschide facturile",
  "deschide stocurile",
  // ... alte comenzi
];

const ChatWindow = () => {
  const { messages } = useChatStore();

  useEffect(() => {
    connectSocket(); // 🔥 Inițializăm WebSocket când componenta se montează
  }, []);

  const [showCommands, setShowCommands] = useState(false);

  const toggleCommands = () => {
    setShowCommands(!showCommands);
  };

  return (
    <div className={styles.chatContainer}>
      {/* 🔹 Buton pentru afișarea comenzilor în colțul din dreapta sus */}
      <button className={styles.commandsButton} onClick={toggleCommands}>
        ?
      </button>

      {showCommands && (
        <div className={styles.commandsPanel}>
          <h4>Comenzi Acceptate</h4>
          <ul>
            {commandsList.map((cmd, idx) => (
              <li key={idx}>{cmd}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.chatWrapper}>
        <div className={styles.messageList}>
          {messages.map((msg, index) => <ChatMessage key={index} {...msg} />)}
        </div>
        <ChatInput onSendMessage={handleChatMessage} />
      </div>
    </div>
  );
};

export default ChatWindow;