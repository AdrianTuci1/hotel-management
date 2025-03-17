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
  const removeMessage = useChatStore((state) => state.removeMessage);
  const restoreMessage = useChatStore((state) => state.restoreMessage);
  const latestIntent = useChatStore((state) => state.latestIntent);
  const latestUserMessage = useChatStore((state) => state.latestUserMessage);
  
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

  // Local overlay state
  const [overlay, setOverlay] = useState({
    isVisible: false,
    type: null,
    data: null
  });

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
      setOverlay,
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
      setOverlay,
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
    // Don't restore the message when simply closing the overlay
    // The message will only be restored when explicitly finalizing or deleting
    
    setOverlay({ isVisible: false, type: null, data: null });
    resetRoomOptions();
    // Reset local default dates
    setLocalDefaultDates({
      startDate: '',
      endDate: ''
    });
  };

  /**
   * Toggles the commands panel visibility
   */
  const toggleCommands = () => {
    setShowCommands(!showCommands);
  };

  // Get the default dates from the reservation in overlay data
  const getDefaultDates = () => {
    
    let dates = { startDate: '', endDate: '' };
    
    // Try to get dates from different possible locations in the overlay data
    if (overlay.data) {
      
      // Direct properties of overlay.data
      if (overlay.data.startDate && overlay.data.endDate) {
        dates = {
          startDate: overlay.data.startDate,
          endDate: overlay.data.endDate
        };
      }
      // Check if dates are in the rooms array (first room)
      else if (overlay.data.rooms && overlay.data.rooms.length > 0) {
        const firstRoom = overlay.data.rooms[0];
        
        if (firstRoom.startDate && firstRoom.endDate) {
          dates = {
            startDate: firstRoom.startDate,
            endDate: firstRoom.endDate
          };
          console.log('📅 Using dates from first room:', dates);
        }
      }
    }
    
    // Fallback to selectedRooms if no dates found
    if (!dates.startDate && !dates.endDate && selectedRooms.length > 0) {
      
      dates = {
        startDate: selectedRooms[0].startDate || '',
        endDate: selectedRooms[0].endDate || ''
      };
    }
    
    // Update the reference
    latestDatesRef.current = dates;
    
    return dates;
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