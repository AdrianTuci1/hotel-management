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
 * @param {Function} setOverlay - Function to update overlay state
 * @param {Function} resetRoomOptions - Function to reset room options
 * @param {Function} setDefaultDates - Function to set default calendar dates
 * @param {Function} updateViewPeriod - Function to update calendar view period
 * @param {Function} addRoom - Function to add a room to selection
 * @param {Function} updateRoomPrice - Function to update room price
 * @param {Function} setHighlightedRoom - Function to highlight a room
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
  setHighlightedRoom
) => {
  // Don't reinitialize if we're already showing this reservation
  if (overlay.isVisible && overlay.data?.id === reservation.id) {
    return;
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
    rooms: reservation.rooms || []
  };

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
    resetRoomOptions
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