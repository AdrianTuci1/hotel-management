/**
 * Chat Overlay Handlers
 * 
 * Utility functions for handling overlay actions, interacting directly with stores and APIs.
 */

import { createReservation, updateReservation, deleteReservation } from '../../../api/reservation.service';
import { createRoom, updateRoom, deleteRoom } from '../../../api/room.service';
import { useChatStore } from '../../../store/chatStore';
import useRoomOptionsStore from '../../../store/roomOptionsStore';
import { useCalendarStore } from '../../../store/calendarStore';

/**
 * Handles showing reservation details in the overlay.
 * Fetches required store actions/state directly.
 * 
 * @param {Object} reservation - The reservation data to display.
 * @param {string} messageId - ID of the message that triggered showing details.
 * @returns {void}
 */
export const handleShowDetails = (reservation, messageId) => {
  // Get necessary functions/state from stores
  const { showOverlay, removeMessage, getState: getChatState } = useChatStore.getState();
  const { overlay } = getChatState(); // Get current overlay state
  const { reset: resetRoomOptions, addRoom, updateRoomPrice, setHighlightedRoom } = useRoomOptionsStore.getState();
  const { setDefaultDates, updateViewPeriod } = useCalendarStore.getState();

  // Don't reinitialize if we're already showing this reservation
  if (overlay.isVisible && overlay.data?.id === reservation.id) {
    console.log("🔄 [OverlayHandler] Reservation overlay already visible for:", reservation.id);
    return;
  }
  
  console.log('🔍 [OverlayHandler] Showing details for reservation:', reservation, 'Message ID:', messageId);

  // Remove the originating message from chat while overlay is open
  if (messageId) {
    removeMessage(messageId);
  }

  // Prepare initial data for the overlay
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
    // Include dates from reservation data if available
    startDate: reservation.startDate || "",
    endDate: reservation.endDate || "",
    messageId: messageId // Store message ID for potential later use (e.g., restore on cancel)
  };
  
  console.log('📦 [OverlayHandler] Initial overlay data prepared:', initialData);

  // Reset room options store state
  resetRoomOptions();

  // Determine default dates and view period for calendar/room options
  let defaultStartDate = reservation.startDate;
  let defaultEndDate = reservation.endDate;

  if (reservation.rooms?.length) {
    // If rooms exist, use the first room's dates as the primary period
    const firstRoom = reservation.rooms[0];
    defaultStartDate = firstRoom.startDate || defaultStartDate;
    defaultEndDate = firstRoom.endDate || defaultEndDate;
    
    console.log(`📅 [OverlayHandler] Setting default dates/view from first room: ${defaultStartDate} - ${defaultEndDate}`);
    
    // Add existing rooms to the room options store
    reservation.rooms.forEach(room => {
      addRoom(room.roomNumber, room.startDate, room.endDate);
      updateRoomPrice(room.roomNumber, room.basePrice || room.price || 0);
      setHighlightedRoom(room.roomNumber); // Highlight initially
    });
    // Set highlight back to null after a short delay
    setTimeout(() => setHighlightedRoom(null), 500); 

  } else if (defaultStartDate && defaultEndDate) {
    console.log(`📅 [OverlayHandler] Setting default dates/view from reservation: ${defaultStartDate} - ${defaultEndDate}`);
  } else {
    console.log("⚠️ [OverlayHandler] No dates found in reservation or rooms data.");
  }

  // Update calendar store if we have valid dates
  if (defaultStartDate && defaultEndDate) {
    setDefaultDates({ startDate: defaultStartDate, endDate: defaultEndDate });
    updateViewPeriod(defaultStartDate, defaultEndDate);
  }

  // Show the reservation overlay using the prepared data
  showOverlay('reservation', initialData);
};

/**
 * Handles various overlay actions (create, update, delete for reservations and rooms).
 * Fetches required store actions/state directly.
 * 
 * @param {string} action - The action identifier (e.g., 'finalizeReservation', 'addRoom').
 * @param {Object} data - The data associated with the action.
 * @returns {Promise<void>}
 */
export const handleOverlayAction = async (action, data) => {
  // Get necessary functions/state from stores
  const { addMessage, closeOverlay, updateOverlayData, restoreMessage } = useChatStore.getState();
  const { selectedRooms, getRoomInfo, reset: resetRoomOptions } = useRoomOptionsStore.getState();

  console.log(`🚀 [OverlayHandler] Handling action: ${action}`, data);

  switch (action) {
    // ----- Reservation Actions ----- 
    case 'updateReservationDataOnly':
      // Only update the data in the overlay state, no API call
      console.log("💾 [OverlayHandler] Updating overlay data locally:", data);
      updateOverlayData(data);
      // No message needed for just internal state update
      break;

    case 'finalizeReservation':
      try {
        // Ensure selected rooms from the store are included in the final data
        const finalData = {
          ...data,
          // Map selected rooms from the store, getting additional info like type
          rooms: selectedRooms.map(room => ({
            ...room, // Includes roomNumber, startDate, endDate, price from store
            type: getRoomInfo(room.roomNumber)?.type || "Standard" // Add type
          }))
        };
        console.log("💾 [OverlayHandler] Finalizing reservation with data:", finalData);

        // API call to create/save the reservation
        const createdReservation = await createReservation(finalData);
        console.log("✅ [OverlayHandler] Reservation created/saved:", createdReservation);

        // Restore original message (optional, based on UX preference)
        if (data.messageId) {
           // Restore message without cancellation flag
           restoreMessage(data.messageId, false); 
        }
          
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          text: `✅ Rezervare finalizată cu succes pentru ${finalData.fullName}.`
        });
        
        closeOverlay();
        resetRoomOptions();
      } catch (error) {
        console.error('❌ [OverlayHandler] Error finalizing reservation:', error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "error",
          text: `❌ Eroare la finalizarea rezervării: ${error.message}`
        });
      }
      break;

    case 'updateReservation': // This might be triggered by ReservationDetails internally if needed
      try {
        console.log("💾 [OverlayHandler] Updating reservation via API:", data);
        // Assume data contains the full updated reservation object including ID
        await updateReservation(data.id, data);
        
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          text: `✅ Rezervarea ${data.id} a fost actualizată.`
        });
        // Decide if overlay should close after update
        // closeOverlay(); 
        // resetRoomOptions();
      } catch (error) {
        console.error('❌ [OverlayHandler] Error updating reservation:', error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "error",
          text: `❌ Eroare la actualizarea rezervării ${data.id}: ${error.message}`
        });
      }
      break;

    case 'deleteReservation':
      // Confirmation should ideally happen in the component before calling this handler
      if (window.confirm("Sunteți sigur că doriți să ștergeți această rezervare?")) { // Keep confirmation for safety
        try {
          console.log("🗑️ [OverlayHandler] Deleting reservation:", data.id);
          await deleteReservation(data.id);
          
          // Restore original message with cancellation flag
          if (data.messageId) {
            restoreMessage(data.messageId, true); 
          }
          
          addMessage({
            id: `ai-${Date.now()}`,
            type: "ai",
            text: `🗑️ Rezervarea ${data.id} a fost anulată/ștearsă.`
          });
          
          closeOverlay();
          resetRoomOptions();
        } catch (error) {
          console.error('❌ [OverlayHandler] Error deleting reservation:', error);
          addMessage({
            id: `error-${Date.now()}`,
            type: "error",
            text: `❌ Eroare la ștergerea rezervării ${data.id}: ${error.message}`
          });
        }
      }
      break;

    // ----- Room Actions ----- 
    case 'addRoom':
      try {
        const roomData = {
          number: data.number,
          type: data.type,
          basePrice: parseFloat(data.price) || 0,
          // Add other fields as needed by API/component (features, status)
          // features: data.features || [],
          // status: data.availability ? 'available' : 'maintenance' 
        };
        console.log("💾 [OverlayHandler] Adding new room:", roomData);
        
        await createRoom(roomData);
        
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          text: `✅ Camera ${data.number} a fost adăugată.`
        });
        
        closeOverlay(); // Close after adding
      } catch (error) {
        console.error('❌ [OverlayHandler] Error adding room:', error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "error",
          text: `❌ Eroare la adăugarea camerei ${data.number}: ${error.message}`
        });
      }
      break;

    case 'updateRoom':
      try {
        // Assume data contains room number and fields to update
        const roomNumber = data.number; // Or data.id if using ID
        const updateData = {
          type: data.type,
          basePrice: parseFloat(data.price) || 0,
          // features: data.features || [],
          // status: data.availability ? 'available' : 'maintenance' 
        };
        console.log(`💾 [OverlayHandler] Updating room ${roomNumber}:`, updateData);

        await updateRoom(roomNumber, updateData);
        
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          text: `✅ Camera ${roomNumber} a fost actualizată.`
        });
        closeOverlay(); // Close after updating
      } catch (error) {
        console.error(`❌ [OverlayHandler] Error updating room ${data.number}:`, error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "error",
          text: `❌ Eroare la actualizarea camerei ${data.number}: ${error.message}`
        });
      }
      break;

    case 'deleteRoom':
       // Confirmation should happen in component
       if (window.confirm(`Sunteți sigur că doriți să ștergeți camera ${data.number}?`)) {
         try {
           const roomNumber = data.number; // Or data.id
           console.log(`🗑️ [OverlayHandler] Deleting room ${roomNumber}`);
           await deleteRoom(roomNumber);
           
           addMessage({
            id: `ai-${Date.now()}`,
             type: "ai",
             text: `🗑️ Camera ${roomNumber} a fost ștearsă.`
           });
           closeOverlay(); // Close after deleting
         } catch (error) {
           console.error(`❌ [OverlayHandler] Error deleting room ${data.number}:`, error);
           addMessage({
            id: `error-${Date.now()}`,
             type: "error",
             text: `❌ Eroare la ștergerea camerei ${data.number}: ${error.message}`
           });
         }
       }
      break;

    // ----- Product Sales Actions ----- 
    case 'completeSale':
      try {
        console.log("🛒 [OverlayHandler] Completing product sale:", data);
        // TODO: Implement API call for product sales (e.g., createSale(data))
        // await createSale(data);
        
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          text: `🛒 Vânzare de ${data.totalPrice} RON finalizată${data.customerName ? ` pentru ${data.customerName}` : ''}.`
        });
        closeOverlay();
      } catch (error) {
        console.error('❌ [OverlayHandler] Error completing sale:', error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "error",
          text: `❌ Eroare la finalizarea vânzării: ${error.message}`
        });
      }
      break;

    default:
      console.warn(`🤷 [OverlayHandler] Unhandled action type: ${action}`);
      addMessage({ 
        id: `warn-${Date.now()}`,
        type: "warning", 
        text: `Acțiune necunoscută: ${action}` 
      });
  }
}; 