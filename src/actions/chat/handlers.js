import { useChatStore } from "../../store/chatStore";
import { useCalendarStore } from "../../store/calendarStore";
import { CHAT_INTENTS, NOTIFICATION_TYPES, RESPONSE_TYPES, VALID_INTENTS } from './types';

/**
 * Procesează un răspuns de chat și actualizează UI-ul
 * Conform protocolului descris în README
 * @param {Object} payload - Răspunsul de procesat
 * @param {Object} actions - Acțiunile disponibile
 */
export const handleChatResponse = (payload, { addMessage, setDisplayComponent }) => {
  if (!payload || !payload.response) {
    console.error("❌ Payload invalid pentru răspuns chat:", payload);
    return;
  }

  const { intent, message, type: responseType, extraIntents, reservation } = payload.response;

  /**
   * TOATE SUNT CHAT RESPONSE, DOAR TYPE-UL E DIFERIT
   * NE VA AJUTA SA IDENTIFICAM TIPUL DE RASPUNS
   * NE VA AJUTA SA IDENTIFICAM TIPUL DE COMPONENTA
   */

  console.group("🤖 Procesare răspuns chat");
  console.log("Intent:", intent);
  console.log("Tip răspuns:", responseType);
  console.log("Mesaj:", message);
  console.log("Extra intents:", extraIntents);
  console.log("Rezervare:", reservation);
  console.groupEnd();

  // Formatăm rezervarea dacă există
  const formattedReservation = reservation ? {
    id: reservation.id || null,
    fullName: reservation.guestName || "Oaspete nou",
    preferences: reservation.preferences || [],
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    roomNumber: reservation.roomNumber,
    type: reservation.roomType,
    status: reservation.status || "confirmed"
  } : null;

  // Adăugăm răspunsul în chat
  addMessage({
    text: message,
    type: responseType === RESPONSE_TYPES.ERROR ? "error" : "bot",
    reservation: formattedReservation,
  });

  // Gestionăm deschiderea panourilor UI
  if (intent) handleIntent(intent, setDisplayComponent);
  if (Array.isArray(extraIntents) && extraIntents.length > 0) {
    console.log("📌 Procesare intenții adiționale:", extraIntents);
    extraIntents.forEach(extraIntent => handleIntent(extraIntent, setDisplayComponent));
  }
};

/**
 * Procesează o actualizare de rezervări
 * Conform protocolului descris în README
 * @param {Object} payload - Actualizarea de procesat
 * @param {Object} actions - Acțiunile disponibile
 */
export const handleReservationsUpdate = (payload, { setReservations }) => {
  console.group("🏨 Actualizare Rezervări");
  console.log("Rezervări primite:", payload);
  
  // Verificăm dacă payload-ul are formatul corect
  if (Array.isArray(payload)) {
    // Format simplu - array direct de rezervări
    console.log("📅 Procesare array de rezervări");
    setReservations(payload);
  } else if (payload.reservations && Array.isArray(payload.reservations)) {
    // Format structurat din README
    console.log(`📅 Procesare actualizare de tip: ${payload.action || 'necunoscut'}`);
    setReservations(payload.reservations);
  } else {
    console.error("❌ Format invalid pentru actualizare rezervări:", payload);
  }
  
  console.groupEnd();
};

/**
 * Procesează o actualizare de camere
 * @param {Object} payload - Actualizarea de procesat
 */
export const handleRoomsUpdate = (payload) => {
  const { rooms: currentRooms, setRooms } = useCalendarStore.getState();
  
  console.group("🏠 Actualizare Camere");
  console.log("Payload primit:", payload);
  
  // Normalizăm payload-ul
  const roomsToUpdate = Array.isArray(payload) ? payload : (payload.rooms || []);
  
  if (roomsToUpdate.length > 0) {
    // Actualizăm doar camerele care au fost modificate
    const updatedRooms = currentRooms.map(currentRoom => {
      const updatedRoom = roomsToUpdate.find(r => r.number === currentRoom.number);
      return updatedRoom || currentRoom;
    });
    
    // Adăugăm camerele noi care nu existau
    const newRooms = roomsToUpdate.filter(
      newRoom => !currentRooms.some(r => r.number === newRoom.number)
    );
    
    const finalRooms = [...updatedRooms, ...newRooms];
    console.log("🏠 Camere actualizate:", finalRooms.length);
    setRooms(finalRooms);
  } else {
    console.error("❌ Nu s-au găsit camere în payload:", payload);
  }
  
  console.groupEnd();
};

/**
 * Procesează o notificare
 * Conform tipurilor de notificări din README
 * @param {Object} payload - Notificarea de procesat
 */
export const handleNotification = (payload) => {
  const { addMessage } = useChatStore.getState();
  
  console.group("🔔 Procesare notificare");
  console.log("Payload notificare:", payload);
  
  // Verificăm dacă payload-ul are formatul corect
  if (!payload || !payload.message) {
    console.error("❌ Format invalid pentru notificare:", payload);
    console.groupEnd();
    return;
  }
  
  // Normalizăm tipul notificării
  const notificationType = payload.title in NOTIFICATION_TYPES 
    ? payload.title 
    : 'Notificare sistem';
  
  addMessage({
    type: 'notification',
    text: payload.message,
    title: notificationType,
    ...payload
  });
  
  console.groupEnd();
};

/**
 * Procesează o intenție și actualizează interfața în consecință
 * @param {string} intent - Intenția primită
 * @param {Function} setDisplayComponent - Funcție pentru setarea componentei display
 */
export const handleIntent = (intent, setDisplayComponent) => {
  console.log(`🎯 Procesare intenție: ${intent}`);
  
  // Obținem funcția setLatestIntent din store
  const { setLatestIntent } = useChatStore.getState();
  
  // Verificăm dacă intenția este validă pentru UI
  const validIntent = intent.toLowerCase();
  
  if (VALID_INTENTS.includes(validIntent)) {
    // Stocăm ultima intenție în chat store
    setLatestIntent(validIntent);
    
    // Extragem tipul de componentă din intenție
    const componentType = validIntent.replace("show_", "");
    console.log(`📌 Deschidem panoul: ${componentType}`);
    
    // Activăm componenta corespunzătoare
    setDisplayComponent(componentType);
  } else {
    console.log(`ℹ️ Intenția "${intent}" nu necesită deschiderea unui panou specific.`);
  }
}; 