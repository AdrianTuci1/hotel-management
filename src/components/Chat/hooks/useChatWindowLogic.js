import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../../store/chatStore";
import { initializeChat /*, handleChatMessage */ } from "../../../actions/chatActions"; // handleChatMessage likely used by ChatInput directly
import { 
  handleShowDetails, 
  handleOverlayAction 
} from "../utils/overlayHandlers";

/**
 * Custom hook for managing the state and logic of the ChatWindow component.
 * Encapsulates state access, event handlers, and effects related to chat interactions,
 * overlays, and room options.
 * 
 * @returns {object} An object containing state values and handler functions for the ChatWindow.
 */
export const useChatWindowLogic = () => {
  // Global state from stores
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const restoreMessage = useChatStore((state) => state.restoreMessage);
  const latestIntent = useChatStore((state) => state.latestIntent);
  const latestUserMessage = useChatStore((state) => state.latestUserMessage);
  
  // Overlay state from ChatStore
  const overlay = useChatStore((state) => state.overlay);
  const closeOverlay = useChatStore((state) => state.closeOverlay);
  
  // Filter out user messages from the main chat display - REMOVED
  // const nonUserMessages = messages.filter(message => message.type !== "user");
  
  // Show/hide commands panel state
  const [showCommands, setShowCommands] = useState(false);

  /**
   * Initialize chat on component mount
   */
  useEffect(() => {
    initializeChat();
    return () => {
      // Potential basic cleanup if needed, but store resets are likely better handled elsewhere
      console.log("[HOOK] ChatWindow unmounting/effect cleanup.");
    };
  }, []); // No dependencies needed if initializeChat is stable and no cleanup depends on props/state

  /**
   * Handles showing reservation details in overlay
   * Now calls the utility function which imports stores directly.
   */
  const onShowDetails = (reservation, messageId) => {
    console.log('📅 [HOOK] onShowDetails called with reservation:', reservation);
    // Pass only necessary data; the handler will get stores itself
    handleShowDetails(reservation, messageId);
  };

  /**
   * Handles overlay actions (update, finalize, delete reservation)
   * Now calls the utility function which imports stores directly.
   */
  const onOverlayAction = async (action, data) => {
    console.log(`🚀 [HOOK] onOverlayAction called: ${action}`, data);
    // Pass only action and data; the handler will get stores itself
    await handleOverlayAction(action, data);
  };

  /**
   * Closes the overlay and resets room options.
   * Handles message cleanup logic specific to closing reservation overlays.
   */
  const handleCloseOverlay = () => {
    console.group("🔍 [HOOK] handleCloseOverlay");
    console.log(`Closing overlay: type=${overlay.type}, messageId=${overlay.data?.messageId}`);
    
    const messageId = overlay.data?.messageId;
    const overlayType = overlay.type;
    
    closeOverlay(); // Close the overlay via store action
    
    // Message cleanup logic remains the same
    if (overlayType === 'reservation' && messageId) {
      console.log("🔄 [HOOK] Processing message after reservation overlay close:", messageId);
      const originalMessage = restoreMessage(messageId, false); 
      if (originalMessage) {
        setTimeout(() => {
          console.log("🧹 [HOOK] Cleaning up processed message:", messageId);
          removeMessage(messageId);
        }, 10);
      } else {
        console.warn("❓ [HOOK] Could not find original message to restore/remove:", messageId);
      }
    }
    console.groupEnd();
  };

  /**
   * Toggles the commands panel visibility
   */
  const toggleCommands = () => {
    setShowCommands(prevShowCommands => !prevShowCommands);
  };

  return {
    messages: messages, // Return all messages
    latestIntent,
    latestUserMessage,
    overlay,
    showCommands,
    // Handlers
    onShowDetails,
    onOverlayAction,
    handleCloseOverlay,
    toggleCommands,
    // Actions - export only if needed by ChatWindow or children directly
    // addMessage, // Likely not needed directly by ChatWindow anymore
    // handleChatMessage, // Likely handled by ChatInput directly importing action
  };
}; 