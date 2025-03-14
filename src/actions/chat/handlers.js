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
  console.log("Payload primit:", payload);
  
  if (!Array.isArray(payload)) {
    console.warn("❌ Payload-ul nu este un array:", payload);
    console.groupEnd();
    return;
  }

  const formattedReservations = payload.map(reservation => {
    console.log("Procesăm rezervarea:", reservation);
    
    // Verificăm dacă avem camerele în formatul corect
    const rooms = Array.isArray(reservation.rooms) 
      ? reservation.rooms.map(room => ({
          roomNumber: room.roomNumber,
          startDate: room.startDate || room.checkInDate,
          endDate: room.endDate || room.checkOutDate,
          price: room.price,
          type: room.type || room.roomType,
          status: room.status || "pending"
        }))
      : [{
          roomNumber: reservation.roomNumber,
          startDate: reservation.startDate || reservation.checkInDate,
          endDate: reservation.endDate || reservation.checkOutDate,
          price: reservation.price,
          type: reservation.roomType,
          status: reservation.status || "pending"
        }];

    return {
      id: reservation.id,
      fullName: reservation.fullName || reservation.guestName,
      phone: reservation.phone,
      email: reservation.email,
      rooms: rooms
    };
  });

  console.log("Rezervări formatate:", formattedReservations);
  setReservations(formattedReservations);
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
  if (VALID_INTENTS.includes(intent)) {
    console.log(`📌 Deschidem panoul: ${intent.replace("show_", "")}`);
    setDisplayComponent(intent.replace("show_", ""));
  }
}; 