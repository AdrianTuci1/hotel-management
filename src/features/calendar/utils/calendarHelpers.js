/**
 * @fileoverview Utilitare pentru gestionarea calendarului și a rezervărilor
 */

import { useCalendarStore } from "../../../store/calendarStore";
import { CHAT_INTENTS } from "../../../actions/types";

/**
 * Actualizează perioada de vizualizare a calendarului doar când este solicitat prin chat
 * 
 * Importantă: Această funcție trebuie folosită DOAR când primim o rezervare
 * sau comandă prin CHAT_INTENTS, NU când se selectează o rezervare din calendar.
 * 
 * @param {string} startDate - Data de început în format ISO string (YYYY-MM-DD)
 * @param {string} endDate - Data de sfârșit în format ISO string (YYYY-MM-DD)
 * @param {string} intent - Intent-ul care a declanșat actualizarea
 * @returns {void}
 */
export const updateCalendarDateRangeFromChat = (startDate, endDate, intent) => {
  console.group("📅 [CALENDAR_HELPERS] Actualizare perioadă din chat");
  console.log("Intent:", intent);
  console.log("Date solicitate:", { startDate, endDate });
  
  // Verificăm dacă intent-ul este valid pentru actualizarea datelor
  const validIntents = [
    CHAT_INTENTS.SHOW_CALENDAR,
    CHAT_INTENTS.RESERVATION,
    CHAT_INTENTS.MODIFY_RESERVATION
  ];
  
  if (!validIntents.includes(intent)) {
    console.warn("⚠️ Intent invalid pentru actualizarea perioadei calendarului:", intent);
    console.groupEnd();
    return;
  }
  
  // Dacă avem intent valid, actualizăm perioada
  useCalendarStore.getState().setDateRange(startDate, endDate);
  console.log("✅ Perioadă actualizată cu succes");
  console.groupEnd();
};

/**
 * Calculează o perioadă de 14 zile pentru calendar, începând cu o dată specificată
 * 
 * @param {string} startDate - Data de început în format ISO string (YYYY-MM-DD)
 * @returns {Object} - Obiect cu startDate și endDate
 */
export const calculateTwoWeekPeriod = (startDate = null) => {
  // Dacă nu avem dată de început, folosim data curentă
  const start = startDate ? new Date(startDate) : new Date();
  
  // Calculăm data de sfârșit (14 zile mai târziu)
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  
  // Formatăm datele și returnăm
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
};

/**
 * Verifică dacă o dată se află între două date specificte
 * 
 * @param {string} date - Data de verificat în format ISO string (YYYY-MM-DD)
 * @param {string} startDate - Data de început în format ISO string (YYYY-MM-DD)
 * @param {string} endDate - Data de sfârșit în format ISO string (YYYY-MM-DD)
 * @returns {boolean} - true dacă data este în interval
 */
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
}; 