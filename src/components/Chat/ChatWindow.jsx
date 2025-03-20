/**
 * ChatWindow Component
 * 
 * The main container component for the chat interface. Manages messages, overlays,
 * and handles chat interactions. Acts as the orchestration layer for the chat experience.
 */
import React, { useEffect, useState, useRef } from "react";
import styles from "./ChatWindow.module.css";
import ChatMessage from "./ChatMessage";
import ChatOverlay from "./ChatOverlay";
import ChatInput from "./ChatInput";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import { handleChatMessage, initializeChat } from "../../actions/chatActions";
import { STRUCTURED_COMMANDS, COMMAND_CATEGORIES } from "./constants/commands";
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
  const removeMessage = useChatStore((state) => state.removeMessage);
  const restoreMessage = useChatStore((state) => state.restoreMessage);
  const latestIntent = useChatStore((state) => state.latestIntent);
  const latestUserMessage = useChatStore((state) => state.latestUserMessage);
  
  // Overlay state din ChatStore
  const overlay = useChatStore((state) => state.overlay);
  const showOverlay = useChatStore((state) => state.showOverlay);
  const updateOverlayData = useChatStore((state) => state.updateOverlayData);
  const closeOverlay = useChatStore((state) => state.closeOverlay);
  const resetChat = useChatStore((state) => state.resetChat);
  
  // Filter out user messages from the main chat display
  const nonUserMessages = messages.filter(message => message.type !== "user");
  
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

  // Keep a reference to the latest defaultDates
  const latestDatesRef = useRef({
    startDate: '',
    endDate: ''
  });

  // Local state for defaultDates that can be updated by RoomsSection
  const [localDefaultDates, setLocalDefaultDates] = useState({
    startDate: '',
    endDate: ''
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
   * Update localDefaultDates when overlay data changes
   */
  useEffect(() => {
    if (overlay.data) {
      // Update local default dates based on overlay data
      const dates = getDefaultDates();
      setLocalDefaultDates(dates);
    }
  }, [overlay.data]);

  /**
   * Handles showing reservation details in overlay
   * 
   * @param {Object} reservation - The reservation data
   * @param {string} messageId - The message ID that triggered this reservation
   */
  const onShowDetails = (reservation, messageId) => {
    console.log('📅 onShowDetails called with reservation:', reservation);
    handleShowDetails(
      reservation,
      overlay,
      showOverlay,
      resetRoomOptions,
      setDefaultDates,
      updateViewPeriod,
      addRoom,
      updateRoomPrice,
      setHighlightedRoom,
      removeMessage,
      messageId
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
      setOverlay: updateOverlayData,
      closeOverlay,
      selectedRooms,
      getRoomInfo,
      addMessage,
      resetRoomOptions,
      restoreMessage
    });
  };

  /**
   * Closes the overlay and resets room options
   * When closing a reservation overlay, the message is not restored to chat
   */
  const handleCloseOverlay = () => {
    console.group("🔍 [CHAT_WINDOW] handleCloseOverlay");
    console.log("Closing overlay with type:", overlay.type);
    console.log("Overlay data:", overlay.data);

    // Obținem ID-ul mesajului asociat cu overlay-ul curent, dacă există
    const messageId = overlay.data?.messageId;
    
    // Obținem tipul overlay-ului curent
    const overlayType = overlay.type;
    
    console.log("Calling closeOverlay() function");
    // Închide overlay-ul
    closeOverlay();
    console.log("Overlay state after closeOverlay():", useChatStore.getState().overlay);
    
    // Verifică dacă overlay-ul s-a închis cu succes
    if (useChatStore.getState().overlay.isVisible) {
      console.log("❌ [CHAT_WINDOW] Overlay nu s-a închis corect, folosim resetChat");
      // Folosim resetChat pentru a forța curățarea completă a stării
      // Atenție: Acest lucru va reseta tot chat-ul, nu doar overlay-ul
      const currentMessages = [...useChatStore.getState().messages];
      resetChat();
      // Restaurăm mesajele după resetare
      currentMessages.forEach(msg => addMessage(msg));
    }
    
    // Resetează opțiunile pentru camere
    resetRoomOptions();
    
    // Resetează datele implicite pentru dată
    setLocalDefaultDates({
      startDate: '',
      endDate: ''
    });
    
    // Dacă overlay-ul era de tip rezervare și avem un messageId asociat, atunci:
    // 1. Fie restaurăm mesajul (commented out - dezactivat momentan)
    // 2. Fie îl marcăm ca procesat pentru a evita reprocesarea
    if (overlayType === 'reservation' && messageId) {
      console.log("🔄 [CHAT_WINDOW] Marcăm mesajul ca procesat:", messageId);
      
      // Opțiunea 1: Restaurează mesajul în chat cu flag-ul de anulare
      // restoreMessage(messageId, true);
      
      // Opțiunea 2: Restaurează mesajul în chat și apoi îl elimină imediat
      // Acest lucru "consumă" mesajul și previne reprocesarea
      const originalMessage = restoreMessage(messageId, false);
      
      if (originalMessage) {
        // După 10ms, eliminăm din nou mesajul pentru a-l curăța complet
        setTimeout(() => {
          console.log("🧹 [CHAT_WINDOW] Curățăm mesajul procesat:", messageId);
          removeMessage(messageId);
        }, 10);
      }
    }
    console.groupEnd();
  };

  /**
   * Toggles the commands panel visibility
   */
  const toggleCommands = () => {
    setShowCommands(!showCommands);
  };

  /**
   * Get default dates for reservation
   * This helps with coordinating dates between overlay and calendar
   */
  const getDefaultDates = () => {
    // Try to get dates from overlay data first
    if (overlay.data && overlay.data.startDate && overlay.data.endDate) {
      return {
        startDate: overlay.data.startDate,
        endDate: overlay.data.endDate
      };
    }

    // Fall back to dates from selectedRooms
    if (selectedRooms.length > 0) {
      const firstRoom = selectedRooms[0];
      return {
        startDate: firstRoom.startDate,
        endDate: firstRoom.endDate
      };
    }

    // No dates available
    return {
      startDate: '',
      endDate: ''
    };
  };

  // Handle local updates to default dates
  const handleSetDefaultDates = (newDates) => {
    console.log('📅 handleSetDefaultDates called with:', newDates);
    setLocalDefaultDates(newDates);
    // Also update the calendar store
    setDefaultDates(newDates);
  };

  // Get the combined defaultDates (from overlay or local state)
  const defaultDates = localDefaultDates.startDate && localDefaultDates.endDate 
    ? localDefaultDates 
    : getDefaultDates();

  return (
    <div className={styles.chatContainer}>
      {/* Intent display in top-left */}
      {latestIntent && (
        <div className={styles.latestIntent} aria-label="Current Intent">
          {latestIntent}
        </div>
      )}

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
          <h4>
            Comenzi Disponibile
            <button 
              className={styles.commandsClose} 
              onClick={toggleCommands}
              aria-label="Close commands panel"
            >
              ×
            </button>
          </h4>
          
          {/* Group commands by category */}
          {Object.values(COMMAND_CATEGORIES).map(category => {
            const commandsInCategory = STRUCTURED_COMMANDS.filter(
              cmd => cmd.category === category
            );
            
            if (commandsInCategory.length === 0) return null;
            
            return (
              <div key={category}>
                <h5 className={`${styles.commandCategory} ${styles[`category${category.replace(/\s+&\s+/g, '')}`]}`}>
                  {category}
                </h5>
                <ul className={styles.commandsList}>
                  {commandsInCategory.map((cmd, idx) => (
                    <li key={idx} className={styles.commandItem}>
                      <div className={styles.commandText}>{cmd.command}</div>
                      <div className={styles.commandDescription}>{cmd.description}</div>
                      {cmd.example && (
                        <div className={styles.commandExample}>
                          Exemplu: {cmd.example}
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

      {/* Chat messages and input area */}
      <div className={styles.chatWrapper}>
        <div className={styles.messageList} role="log" aria-label="Chat messages">
          {nonUserMessages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              {...message}
              onShowDetails={() => onShowDetails(message.reservation, message.id)}
            />
          ))}
        </div>
        
        {/* Latest user message display right above the input */}
        {latestUserMessage && (
          <div className={styles.latestUserMessageInline} aria-label="Latest message">
            {latestUserMessage}
          </div>
        )}
        
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
          defaultDates,
          isRoomAvailable,
          addRoom,
          removeRoom,
          updateRoomPeriod,
          updateRoomPrice,
          getRoomInfo,
          setHighlightedRoom,
          setDefaultDates: handleSetDefaultDates
        }}
      />
    </div>
  );
};

export default ChatWindow;