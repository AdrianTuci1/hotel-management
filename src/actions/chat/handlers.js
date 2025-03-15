import { useChatStore } from "../../store/chatStore";
import { NOTIFICATION_TYPES, VALID_INTENTS } from './types';
import { useCalendarStore } from "../../store/calendarStore";

/**
 * Procesează un răspuns de chat și actualizează UI-ul
 * @param {ChatResponse} payload - Răspunsul de procesat
 * @param {Object} actions - Acțiunile disponibile
 */
export const handleChatResponse = (payload, { addMessage, setDisplayComponent }) => {
  if (!payload.response) return;

  const { intent, message, type: msgType, formFields, extraIntents, reservation } = payload.response;

  // Formatăm rezervarea dacă există
  const formattedReservation = reservation ? {
    id: reservation.id || null,
    fullName: reservation.guestName,
    preferences: reservation.preferences,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    type: reservation.roomType,
    status: "booked"
  } : null;

  // Adăugăm răspunsul în chat
  addMessage({
    text: message,
    type: msgType || "bot",
    reservation: formattedReservation,
    formFields: formFields || null,
  });

  // Gestionăm deschiderea panourilor UI
  if (intent) handleIntent(intent, setDisplayComponent);
  if (Array.isArray(extraIntents)) {
    extraIntents.forEach(extraIntent => handleIntent(extraIntent, setDisplayComponent));
  }
};

/**
 * Procesează o actualizare de rezervări
 * @param {ReservationsUpdate} payload - Actualizarea de procesat
 * @param {Object} actions - Acțiunile disponibile
 */
export const handleReservationsUpdate = (payload, { setReservations }) => {
  console.group("🏨 Actualizare Rezervări");
  console.log("Rezervări primite:", payload);
  setReservations(payload);
  console.groupEnd();
};

/**
 * Procesează o actualizare de camere
 * @param {RoomsUpdate} payload - Actualizarea de procesat
 */
export const handleRoomsUpdate = (payload) => {
  const { rooms: currentRooms, setRooms } = useCalendarStore.getState();
  
  if (Array.isArray(payload.rooms)) {
    // Actualizăm doar camerele care au fost modificate
    const updatedRooms = currentRooms.map(currentRoom => {
      const updatedRoom = payload.rooms.find(r => r.number === currentRoom.number);
      return updatedRoom || currentRoom;
    });
    
    // Adăugăm camerele noi care nu existau
    const newRooms = payload.rooms.filter(
      newRoom => !currentRooms.some(r => r.number === newRoom.number)
    );
    
    setRooms([...updatedRooms, ...newRooms]);
  } else {
    console.error("❌ Format invalid pentru actualizare camere:", payload);
  }
};

/**
 * Procesează o notificare
 * @param {Object} payload - Notificarea de procesat
 */
export const handleNotification = (payload) => {
  const { addMessage } = useChatStore.getState();
  
  addMessage({
    type: 'notification',
    text: payload.message,
    ...payload
  });
};

export const handleIntent = (intent, setDisplayComponent) => {
  // Get the setLatestIntent function from the store
  const { setLatestIntent } = useChatStore.getState();
  
  if (VALID_INTENTS.includes(intent)) {
    console.log(`📌 Deschidem panoul: ${intent.replace("show_", "")}`);
    // Store the latest intent in the chat store
    setLatestIntent(intent);
    // Continue with existing functionality
    setDisplayComponent(intent.replace("show_", ""));
  }
}; 