/**
 * Chat Overlay Handlers
 * 
 * This file contains utility functions for handling different overlay actions
 * in the chat interface. These handlers can be used to manage reservations,
 * notifications, and other interactive elements.
 */

import apiService from "../../../actions/apiService";

/**
 * Handles showing reservation details in the overlay
 * 
 * @param {Object} reservation - The reservation data to display
 * @param {Object} overlay - Current overlay state
 * @param {Function} setOverlay - Function to update overlay state
 * @param {Function} resetRoomOptions - Function to reset room options
 * @param {Function} setDefaultDates - Function to set default calendar dates
 * @param {Function} updateViewPeriod - Function to update calendar view period
 * @param {Function} addRoom - Function to add a room to selection
 * @param {Function} updateRoomPrice - Function to update room price
 * @param {Function} setHighlightedRoom - Function to highlight a room
 * @param {Function} removeMessage - Function to remove a message from chat
 * @param {string} messageId - ID of the reservation message
 * @returns {void}
 */
export const handleShowDetails = (
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
) => {
  // Don't reinitialize if we're already showing this reservation
  if (overlay.isVisible && overlay.data?.id === reservation.id) {
    return;
  }
  
  // Debug - log the reservation data structure
  console.log('🔍 DEBUG - Reservation data:', JSON.stringify(reservation, null, 2));

  // Remove the reservation message from chat while overlay is open
  if (messageId) {
    removeMessage(messageId);
  }

  // Initialize reservation data
  const initialData = {
    id: reservation.id,
    fullName: reservation.fullName || reservation.guestName || "",
    phone: reservation.phone || "",
    email: reservation.email || "",
    notes: reservation.notes || "",
    isPaid: reservation.isPaid || false,
    hasInvoice: reservation.hasInvoice || false,
    hasReceipt: reservation.hasReceipt || false,
    rooms: reservation.rooms || [],
    // Add the dates from reservation directly to the overlay data
    startDate: reservation.startDate || "",
    endDate: reservation.endDate || "",
    messageId: messageId // Store the message ID for later reference
  };
  
  // Debug - log the initial data
  console.log('🔍 DEBUG - Initial overlay data:', JSON.stringify(initialData, null, 2));

  // Reset room options and update calendar if needed
  resetRoomOptions();
  if (reservation.rooms?.length) {
    const firstRoom = reservation.rooms[0];
    setDefaultDates({
      startDate: firstRoom.startDate,
      endDate: firstRoom.endDate
    });
    updateViewPeriod(firstRoom.startDate, firstRoom.endDate);

    // Add rooms to selection
    reservation.rooms.forEach(room => {
      addRoom(room.roomNumber, room.startDate, room.endDate);
      updateRoomPrice(room.roomNumber, room.basePrice || room.price);
      setHighlightedRoom(room.roomNumber);
    });
  } else if (reservation.startDate && reservation.endDate) {
    // If no rooms but we have dates, set them as default
    setDefaultDates({
      startDate: reservation.startDate,
      endDate: reservation.endDate
    });
    updateViewPeriod(reservation.startDate, reservation.endDate);
    console.log('🔍 DEBUG - Setting dates from reservation:', reservation.startDate, reservation.endDate);
  }

  setOverlay({
    isVisible: true,
    type: 'reservation',
    data: initialData
  });
};

/**
 * Handles different overlay actions like updating, finalizing or deleting a reservation
 * 
 * @param {string} action - The action to perform
 * @param {Object} data - The data associated with the action
 * @param {Object} options - Additional options and callbacks
 * @returns {Promise<void>}
 */
export const handleOverlayAction = async (action, data, options) => {
  const {
    setOverlay,
    selectedRooms,
    getRoomInfo,
    addMessage,
    resetRoomOptions,
    restoreMessage
  } = options;

  switch (action) {
    case 'updateReservation':
      setOverlay(prev => ({ ...prev, data }));
      break;

    case 'finalizeReservation':
      try {
        const finalData = {
          ...data,
          rooms: selectedRooms.map(room => ({
            ...room,
            type: getRoomInfo(room.roomNumber)?.type || "Standard"
          }))
        };

        await apiService.createReservation(finalData);

        if (selectedRooms[0]) {
          const room = selectedRooms[0];
          // Restore the original message to the chat with confirmation
          if (data.messageId) {
            restoreMessage(data.messageId);
          }
          
          addMessage({
            type: "bot",
            text: `Rezervare finalizată cu succes pentru camera ${room.roomNumber} în perioada ${room.startDate} - ${room.endDate}.`
          });
        }

        setOverlay({ isVisible: false, type: null, data: null });
        resetRoomOptions();
      } catch (error) {
        console.error('Error saving reservation:', error);
        addMessage({
          type: "bot",
          text: "❌ A apărut o eroare la salvarea rezervării!"
        });
      }
      break;

    case 'deleteReservation':
      if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
        // Restore the original message to the chat showing it was canceled
        if (data.messageId) {
          restoreMessage(data.messageId, true);
        }
        
        addMessage({
          type: "bot",
          text: "Rezervarea a fost anulată."
        });
        
        setOverlay({ isVisible: false, type: null, data: null });
        resetRoomOptions();
      }
      break;

    case 'acceptNotification':
    case 'dismissNotification':
      // Handle notification actions
      setOverlay({ isVisible: false, type: null, data: null });
      break;

    default:
      console.warn('Unsupported overlay action:', action);
  }
}; 