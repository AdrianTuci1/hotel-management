/**
 * @fileoverview Handler pentru mesajele de programări (Appointments).
 * 
 * Procesează mesajele de tip APPOINTMENTS și actualizează starea programărilor.
 */

import { APPOINTMENT_ACTIONS } from '../types';
import { useCalendarStore } from '../../store/calendarStore'; // Presupunem că store-ul se numește calendarStore

/**
 * Procesează acțiuni legate de programări
 * 
 * @param {Object} message - Mesajul complet primit, conform RESPONSE_DOCUMENTATION.md
 * @param {string} message.type - Tipul mesajului (ar trebui să fie APPOINTMENTS)
 * @param {string} message.action - Acțiunea specifică (init, update, create, delete)
 * @param {Object} message.data - Conține lista de programări
 * @param {Array} message.data.appointments - Lista efectivă de programări
 * @returns {void}
 */
export const handleAppointmentsUpdate = (message) => {
  console.group("🗓️ [APPOINTMENT_HANDLER] Processing appointment update");
  console.log("Message:", message);

  const { setAppointments, getAppointments } = useCalendarStore.getState();
  
  // Verificări de bază
  if (!message || message.type !== 'APPOINTMENTS' || !message.action || !message.data || !Array.isArray(message.data.appointments)) {
    console.error("❌ [APPOINTMENT_HANDLER] Invalid message structure or missing appointments data");
    console.groupEnd();
    return;
  }
  
  const action = message.action;
  const appointments = message.data.appointments;
  
  console.log("Action:", action);
  console.log("Appointments count:", appointments.length);
  
  switch (action) {
    case APPOINTMENT_ACTIONS.INIT:
    case APPOINTMENT_ACTIONS.SYNC: // Considerăm SYNC echivalent cu INIT pentru moment
      // Inițializare/sincronizare - înlocuim toate programările
      setAppointments(appointments);
      console.log("✅ [APPOINTMENT_HANDLER] Appointments synchronized");
      break;
      
    case APPOINTMENT_ACTIONS.CREATE:
      // Adăugăm programări noi
      if (appointments.length > 0) {
        const currentAppointments = getAppointments();
        const newAppointments = [...currentAppointments, ...appointments];
        setAppointments(newAppointments);
        console.log(`✅ [APPOINTMENT_HANDLER] ${appointments.length} appointment(s) added`);
      }
      break;
      
    case APPOINTMENT_ACTIONS.UPDATE:
      // Actualizăm una sau mai multe programări
      if (appointments.length > 0) {
        const currentAppointments = getAppointments();
        
        // Creăm un map cu programările curente pentru procesare eficientă
        const appointmentsMap = new Map();
        currentAppointments.forEach(appt => {
          appointmentsMap.set(appt.id, appt);
        });
        
        // Actualizăm programările existente sau le adăugăm dacă sunt noi
        let updatedCount = 0;
        let addedCount = 0;
        appointments.forEach(newAppt => {
          if (newAppt.id && appointmentsMap.has(newAppt.id)) {
            appointmentsMap.set(newAppt.id, { ...appointmentsMap.get(newAppt.id), ...newAppt });
            updatedCount++;
          } else {
            // Dacă o programare din update nu există, o adăugăm (comportament opțional)
            appointmentsMap.set(newAppt.id, newAppt); 
            addedCount++;
            console.warn(`[APPOINTMENT_HANDLER] Appointment with id ${newAppt.id} not found, adding it.`);
          }
        });
        
        // Convertim înapoi la array
        const updatedAppointments = Array.from(appointmentsMap.values());
        setAppointments(updatedAppointments);
        console.log(`✅ [APPOINTMENT_HANDLER] ${updatedCount} appointment(s) updated, ${addedCount} added.`);
      }
      break;
      
    case APPOINTMENT_ACTIONS.DELETE:
      // Ștergem una sau mai multe programări bazate pe ID
      if (appointments.length > 0) {
        const currentAppointments = getAppointments();
        
        // Creăm un set cu ID-urile de șters pentru procesare eficientă
        const idsToDelete = new Set();
        appointments.forEach(appt => {
          if (appt.id) idsToDelete.add(appt.id);
        });
        
        if (idsToDelete.size > 0) {
          // Filtrăm programările care nu trebuie șterse
          const updatedAppointments = currentAppointments.filter(appt => !idsToDelete.has(appt.id));
          setAppointments(updatedAppointments);
          console.log(`✅ [APPOINTMENT_HANDLER] ${idsToDelete.size} appointment(s) deleted`);
        } else {
           console.warn(`[APPOINTMENT_HANDLER] Delete action received, but no valid IDs found in the payload.`);
        }
      }
      break;
      
    default:
      console.warn("⚠️ [APPOINTMENT_HANDLER] Unknown action:", action);
      break;
  }
  
  console.groupEnd();
}; 