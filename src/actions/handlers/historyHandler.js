/**
 * @fileoverview Handler pentru mesajele de istoric consolidat.
 * 
 * Procesează mesajele de tip HISTORY, care pot conține mesaje text, notificări, sau evenimente.
 */

import { useChatStore } from "../../store/chatStore";
import { HISTORY_ENTRY_TYPES } from "../types";

/**
 * Procesează un singur item din istoricul consolidat.
 * 
 * @param {Object} item - Un item din array-ul message.data.items
 * @param {string} item.entryType - Tipul intrării ('message', 'notification', 'event')
 * @param {Object} item.payload - Conținutul specific al intrării
 * @param {string} item.timestamp - Timestamp-ul intrării
 * @param {Function} addMessage - Funcția din store pentru adăugare mesaj în UI
 */
const processHistoryItem = (item, addMessage) => {
  if (!item || !item.entryType || !item.payload) {
    console.warn("[HISTORY_HANDLER] Skipping invalid history item:", item);
    return;
  }

  const timestamp = item.timestamp || new Date().toISOString();

  switch (item.entryType) {
    case HISTORY_ENTRY_TYPES.MESSAGE:
      // Procesează mesaj simplu (fostul CHAT)
      addMessage({
        text: item.payload.message || "Mesaj gol primit.",
        type: item.payload.intent === 'error' ? "error" : "ai", // Sau altă logică pentru tip
        intent: item.payload.intent, // Păstrăm intentul original dacă există
        timestamp: timestamp
      });
      console.log("[HISTORY_HANDLER] Processed 'message' entry:", item.payload);
      break;

    case HISTORY_ENTRY_TYPES.NOTIFICATION:
      // Procesează notificare (fostul NOTIFICATION/AUTOMATION)
      addMessage({
        type: "notification", // Tip specific pentru UI?
        notification: {
          type: item.payload.type || 'unknown', // Sub-tipul notificării (ex: 'booking_email')
          title: item.payload.title || "Notificare",
          message: item.payload.message || "Detaliile notificării lipsesc.",
          data: item.payload.data // Datele suplimentare ale notificării
        },
        timestamp: timestamp
      });
      console.log("[HISTORY_HANDLER] Processed 'notification' entry:", item.payload);
      break;

    case HISTORY_ENTRY_TYPES.EVENT:
      // Procesează eveniment general
      // TODO: Decide cum se afișează evenimentele în UI
      // Poate fi un mesaj special sau doar logat?
      addMessage({
        text: `Eveniment: ${item.payload.eventType || 'necunoscut'} - ${item.payload.action || 'detalii lipsă'}`,
        type: "system", // Sau un tip specific 'event'?
        payload: item.payload, // Trimitem tot payload-ul pentru context?
        timestamp: timestamp
      });
      console.log("[HISTORY_HANDLER] Processed 'event' entry:", item.payload);
      break;

    default:
      console.warn(`[HISTORY_HANDLER] Unknown history entry type: ${item.entryType}`, item);
      break;
  }
};

/**
 * Procesează un mesaj de tip HISTORY primit de la server.
 * 
 * @param {Object} message - Mesajul complet primit, conform RESPONSE_DOCUMENTATION.md
 * @param {string} message.type - Tipul mesajului (ar trebui să fie HISTORY)
 * @param {Object} message.data - Conține datele istoricului
 * @param {Array} message.data.items - Lista efectivă de intrări în istoric
 * @param {number} [message.data.total] - Număr total de itemi (pentru paginare)
 * @param {number} [message.data.page] - Pagina curentă (pentru paginare)
 * @param {number} [message.data.pageSize] - Mărimea paginii (pentru paginare)
 * @param {number} [message.data.totalPages] - Număr total de pagini (pentru paginare)
 * @returns {void}
 */
export const handleHistoryUpdate = (message) => {
  console.group("📜 [HISTORY_HANDLER] Processing history update");
  console.log("Message:", message);

  const { addMessage } = useChatStore.getState();

  // Verificări de bază
  if (!message || message.type !== 'HISTORY' || !message.data || !Array.isArray(message.data.items)) {
    console.error("❌ [HISTORY_HANDLER] Invalid message structure or missing history items");
    console.groupEnd();
    return;
  }

  // Procesăm fiecare item din listă
  message.data.items.forEach(item => processHistoryItem(item, addMessage));

  // TODO: Gestionare paginare dacă e necesar (folosind message.data.total, page, etc.)
  if (message.data.total !== undefined) {
      console.log(`[HISTORY_HANDLER] Received page ${message.data.page}/${message.data.totalPages} with ${message.data.items.length} items (Total: ${message.data.total})`);
      // Aici s-ar putea actualiza starea paginării în store
  }

  console.groupEnd();
}; 