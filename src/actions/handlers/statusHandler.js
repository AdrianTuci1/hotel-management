/**
 * @fileoverview Handler pentru mesajele de status.
 * 
 * Procesează mesajele de tip STATUS și actualizează starea conexiunii.
 */

import { useChatStore } from "../../store/chatStore";

// Stocăm ultimul status pentru a evita loguri duplicate
let lastStatus = null;

/**
 * Procesează un mesaj de status pentru conexiunea WebSocket
 * 
 * @param {Object|string} payload - Payload-ul mesajului
 * @returns {void}
 */
export const handleConnectionStatus = (payload) => {
  // Extragem status din diferite formate posibile
  let status;
  
  if (typeof payload === 'string') {
    status = payload;
  } else if (payload && payload.status) {
    status = payload.status;
  } else {
    console.error("❌ [STATUS_HANDLER] Invalid status payload");
    return;
  }
  
  // Verificăm dacă statusul s-a schimbat
  if (status === lastStatus) {
    // Status neschimbat, nu mai logăm
    return;
  }
  
  // Status schimbat, logăm și actualizăm
  console.group("🔌 [STATUS_HANDLER] Connection status changed");
  console.log("New status:", status);
  console.log("Previous status:", lastStatus);
  
  // Actualizăm starea conexiunii în store
  const { setConnectionStatus } = useChatStore.getState();
  setConnectionStatus(status);
  
  // Afișăm un mesaj de notificare dacă conexiunea s-a modificat
  const { addMessage } = useChatStore.getState();
  
  if (status === "connected") {
    addMessage({
      text: "✅ Conectat la server",
      type: "system",
      timestamp: new Date().toISOString()
    });
  } else if (status === "disconnected") {
    addMessage({
      text: "⚠️ Deconectat de la server. Se încearcă reconectarea...",
      type: "system",
      timestamp: new Date().toISOString()
    });
  }
  
  console.log("✅ [STATUS_HANDLER] Connection status updated");
  console.groupEnd();
  
  // Salvăm noul status
  lastStatus = status;
}; 