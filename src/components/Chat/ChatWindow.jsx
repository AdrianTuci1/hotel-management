/**
 * ChatWindow Component
 * 
 * The main container component for the chat interface. Manages messages, overlays,
 * and handles chat interactions. Acts as the orchestration layer for the chat experience.
 */
import React, { useEffect, useState } from "react";
import styles from "./ChatWindow.module.css";
import ChatMessage from "./ChatMessage";
import ChatOverlay from "./ChatOverlay";
import ChatInput from "./ChatInput";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import { handleChatMessage, initializeChat } from "../../actions/chatActions";
import { CHAT_COMMANDS } from "./constants/commands";
import { 
  handleShowDetails, 
  handleOverlayAction 
} from "./utils/overlayHandlers";

/**
 * Main chat window component that orchestrates the chat interface
 * 
 * @returns {JSX.Element} The rendered chat window
 */
const ChatWindow = () => {
  // Global state from stores
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const { updateViewPeriod, isRoomAvailable, setDefaultDates } = useCalendarStore();
  const {
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    getRoomInfo,
    setHighlightedRoom,
    reset: resetRoomOptions
  } = useRoomOptionsStore();

  // Local overlay state
  const [overlay, setOverlay] = useState({
    isVisible: false,
    type: null,
    data: null
  });

  // Show/hide commands panel state
  const [showCommands, setShowCommands] = useState(false);

  /**
   * Initialize chat on component mount
   */
  useEffect(() => {
    initializeChat();
    return () => resetRoomOptions();
  }, []);

  /**
   * Handles showing reservation details in overlay
   * 
   * @param {Object} reservation - The reservation data
   */
  const onShowDetails = (reservation) => {
    handleShowDetails(
      reservation,
      overlay,
      setOverlay,
      resetRoomOptions,
      setDefaultDates,
      updateViewPeriod,
      addRoom,
      updateRoomPrice,
      setHighlightedRoom
    );
  };

  /**
   * Handles overlay actions (update, finalize, delete reservation)
   * 
   * @param {string} action - The action to perform
   * @param {Object} data - The data associated with the action
   */
  const onOverlayAction = async (action, data) => {
    await handleOverlayAction(action, data, {
      setOverlay,
      selectedRooms,
      getRoomInfo,
      addMessage,
      resetRoomOptions
    });
  };

  /**
   * Closes the overlay and resets room options
   */
  const handleCloseOverlay = () => {
    setOverlay({ isVisible: false, type: null, data: null });
    resetRoomOptions();
  };

  /**
   * Toggles the commands panel visibility
   */
  const toggleCommands = () => {
    setShowCommands(!showCommands);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Commands help button */}
      <button 
        className={styles.commandsButton} 
        onClick={toggleCommands}
        aria-label="Show commands"
        aria-expanded={showCommands}
      >
        ?
      </button>

      {/* Commands panel */}
      {showCommands && (
        <div className={styles.commandsPanel} role="region" aria-label="Available commands">
          <h4>Comenzi Acceptate</h4>
          <ul>
            {CHAT_COMMANDS.map((cmd, idx) => (
              <li key={idx}>{cmd}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat messages and input area */}
      <div className={styles.chatWrapper}>
        <div className={styles.messageList} role="log" aria-label="Chat messages">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              {...message}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
        <ChatInput onSendMessage={handleChatMessage} />
      </div>

      {/* Chat overlay for reservations, notifications, etc. */}
      <ChatOverlay
        isVisible={overlay.isVisible}
        type={overlay.type}
        data={overlay.data}
        onClose={handleCloseOverlay}
        onAction={onOverlayAction}
        roomManagement={{
          selectedRooms,
          defaultDates: {
            startDate: selectedRooms[0]?.startDate || "",
            endDate: selectedRooms[0]?.endDate || ""
          },
          isRoomAvailable,
          addRoom,
          removeRoom,
          updateRoomPeriod,
          updateRoomPrice,
          getRoomInfo,
          setHighlightedRoom
        }}
      />
    </div>
  );
};

export default ChatWindow;