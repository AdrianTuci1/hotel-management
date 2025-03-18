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
  
  // Adăugăm mesajul în chat
  if (payload.message) {
    const { addMessage } = useChatStore.getState();
    
    addMessage({
      text: payload.message,
      type: "notification",
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ [AUTOMATION_HANDLER] Notification added to chat");
  }
  
  // Procesăm acțiuni specifice
  if (payload.action) {
    // Aici putem adăuga logică pentru acțiuni specifice
    // Exemplu: afișare dialog, deschidere modal, etc.
    console.log("Action:", payload.action);
    
    // Dacă action are format Intent, actualizăm starea
    if (payload.action.startsWith('show_')) {
      const { setLatestIntent, setDisplayComponent } = useChatStore.getState();
      
      // Setăm intent-ul
      setLatestIntent(payload.action);
      
      // Mapare directă între acțiuni și componente
      const actionToComponent = {
        'show_calendar': 'calendar',
        'show_pos': 'pos',
        'show_invoices': 'invoices',
        'show_stock': 'stock',
        'show_reports': 'reports'
      };
      
      // Setăm componenta dacă există în mapare
      if (actionToComponent[payload.action]) {
        setDisplayComponent(actionToComponent[payload.action]);
        console.log(`✅ [AUTOMATION_HANDLER] UI updated to: ${actionToComponent[payload.action]}`);
      }
    }
  }
  
  console.groupEnd();
}; 