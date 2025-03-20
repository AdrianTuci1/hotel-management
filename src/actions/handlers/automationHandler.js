/**
 * @fileoverview Handler pentru mesajele de automatizare.
 * 
 * Procesează mesajele de tip AUTOMATION_ACTION și afișează notificări.
 */

import { useChatStore } from "../../store/chatStore";

/**
 * Procesează o notificare/acțiune de automatizare
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {void}
 */
export const handleNotification = (payload) => {
  console.group("🤖 [AUTOMATION_HANDLER] Processing notification");
  console.log("Payload:", payload);
  
  if (!payload) {
    console.error("❌ [AUTOMATION_HANDLER] Invalid payload");
    console.groupEnd();
    return;
  }

  const { addMessage } = useChatStore.getState();
  
  // Verificăm dacă avem un mesaj de automatizare complet
  if (payload.notification) {
    addMessage({
      type: "automation",
      notification: {
        type: payload.notification.type,
        title: payload.notification.title || "Notificare automatizare",
        message: payload.notification.message,
        data: payload.notification.data
      },
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ [AUTOMATION_HANDLER] Automation message added to chat");
  }
  // Caz pentru mesaje simple
  else if (payload.message) {
    addMessage({
      text: payload.message,
      type: "notification",
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ [AUTOMATION_HANDLER] Simple notification added to chat");
  }
  
  // Procesăm acțiuni specifice
  if (payload.action) {
    console.log("Action:", payload.action);
    
    // Dacă action are format Intent, actualizăm starea
    if (payload.action.startsWith('show_')) {
      const { setLatestIntent, setDisplayComponent } = useChatStore.getState();
      
      // Setăm intent-ul
      setLatestIntent(payload.action);
      
      // Setăm componenta de afișare
      setDisplayComponent(payload.action.replace('show_', ''));
    }
  }
  
  console.groupEnd();
}; 