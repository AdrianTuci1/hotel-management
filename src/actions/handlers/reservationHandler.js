/**
 * @fileoverview Handler pentru mesajele de rezervare.
 * 
 * Procesează mesajele de tip RESERVATION_ACTION și actualizează starea rezervărilor.
 */

import { RESERVATION_ACTIONS } from '../types';

/**
 * Procesează acțiuni legate de rezervări
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @param {Object} storeActions - Funcții pentru actualizarea stării
 * @param {Function} storeActions.setReservations - Funcție pentru setarea rezervărilor
 * @returns {void}
 */
export const handleReservationsUpdate = (payload, { setReservations }) => {
  console.group("🏨 [RESERVATION_HANDLER] Processing reservation action");
  console.log("Payload:", payload);
  
  if (!payload || (!payload.reservations && !Array.isArray(payload))) {
    console.error("❌ [RESERVATION_HANDLER] Invalid payload");
    console.groupEnd();
    return;
  }
  
  let action = payload.action || RESERVATION_ACTIONS.SYNC;
  let reservations = Array.isArray(payload) ? payload : payload.reservations;
  
  console.log("Action:", action);
  console.log("Reservations count:", reservations ? reservations.length : 0);
  
  switch (action) {
    case RESERVATION_ACTIONS.INIT:
    case RESERVATION_ACTIONS.SYNC:
      // Inițializare/sincronizare - înlocuim toate rezervările
      if (Array.isArray(reservations)) {
        setReservations(reservations);
        console.log("✅ [RESERVATION_HANDLER] Reservations synchronized");
      }
      break;
      
    case RESERVATION_ACTIONS.CREATE:
      // Adăugăm o rezervare nouă
      if (reservations && reservations.length > 0) {
        const { getReservations } = require('../../store/calendarStore').useCalendarStore.getState();
        const currentReservations = getReservations();
        
        const newReservations = [...currentReservations, ...reservations];
        setReservations(newReservations);
        console.log("✅ [RESERVATION_HANDLER] Reservation added");
      }
      break;
      
    case RESERVATION_ACTIONS.UPDATE:
      // Actualizăm una sau mai multe rezervări
      if (reservations && reservations.length > 0) {
        const { getReservations } = require('../../store/calendarStore').useCalendarStore.getState();
        const currentReservations = getReservations();
        
        // Creăm un map cu rezervările curente pentru procesare eficientă
        const reservationsMap = new Map();
        currentReservations.forEach(res => {
          reservationsMap.set(res.id, res);
        });
        
        // Actualizăm rezervările
        reservations.forEach(newRes => {
          if (newRes.id && reservationsMap.has(newRes.id)) {
            reservationsMap.set(newRes.id, { ...reservationsMap.get(newRes.id), ...newRes });
          }
        });
        
        // Convertim înapoi la array
        const updatedReservations = Array.from(reservationsMap.values());
        setReservations(updatedReservations);
        console.log("✅ [RESERVATION_HANDLER] Reservations updated");
      }
      break;
      
    case RESERVATION_ACTIONS.DELETE:
      // Ștergem una sau mai multe rezervări
      if (reservations && reservations.length > 0) {
        const { getReservations } = require('../../store/calendarStore').useCalendarStore.getState();
        const currentReservations = getReservations();
        
        // Creăm un set cu ID-urile de șters pentru procesare eficientă
        const idsToDelete = new Set();
        reservations.forEach(res => {
          if (res.id) idsToDelete.add(res.id);
        });
        
        // Filtrăm rezervările care nu trebuie șterse
        const updatedReservations = currentReservations.filter(res => !idsToDelete.has(res.id));
        setReservations(updatedReservations);
        console.log("✅ [RESERVATION_HANDLER] Reservations deleted");
      }
      break;
      
    default:
      console.warn("⚠️ [RESERVATION_HANDLER] Unknown action:", action);
      break;
  }
  
  console.groupEnd();
}; 