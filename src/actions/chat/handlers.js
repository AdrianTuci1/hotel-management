import { useChatStore } from "../../store/chatStore";
import { NOTIFICATION_TYPES, VALID_INTENTS } from './types';

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

export const handleNotification = (notification) => {
  const { addMessage } = useChatStore.getState();

  switch (notification.title) {
    case NOTIFICATION_TYPES.BOOKING:
      addMessage({
        type: "notification",
        text: `🏨 ${notification.message}`,
        link: notification.link
      });
      break;

    case NOTIFICATION_TYPES.WHATSAPP:
      addMessage({
        type: "notification",
        text: `📱 ${notification.message}`,
        aiResponse: notification.aiResponse
      });
      break;

    case NOTIFICATION_TYPES.PRICE_ANALYSIS:
      addMessage({
        type: "analysis",
        text: "📊 Analiză prețuri actualizată",
        analysis: notification.analysis
      });
      break;

    default:
      addMessage({
        type: "notification",
        text: notification.message
      });
  }
};

export const handleIntent = (intent, setDisplayComponent) => {
  if (VALID_INTENTS.includes(intent)) {
    console.log(`📌 Deschidem panoul: ${intent.replace("show_", "")}`);
    setDisplayComponent(intent.replace("show_", ""));
  }
}; 