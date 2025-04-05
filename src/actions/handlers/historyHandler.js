/**
 * @fileoverview Handler pentru mesajele de istoric.
 * 
 * Procesează mesajele de tip HISTORY și afișează istoricul conversațiilor.
 */

import { useChatStore } from "../../store/chatStore";

/**
 * Procesează un mesaj de istoric și actualizează interfața
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {void}
 */
export const handleHistory = (payload) => {
  console.group("📜 [HISTORY_HANDLER] Processing history message");
  console.log("Payload:", payload);
  
  if (!payload) {
    console.error("❌ [HISTORY_HANDLER] Invalid payload");
    console.groupEnd();
    return;
  }

  const { addMessage, setDisplayComponent } = useChatStore.getState();
  
  // Verificăm dacă avem un mesaj de istoric complet
  if (payload.history) {
    // Adăugăm mesajul de istoric în chat
    addMessage({
      type: "history",
      history: {
        title: payload.history.title || "Istoric conversații",
        items: payload.history.items || [],
        data: payload.history.data
      },
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ [HISTORY_HANDLER] History message added to chat");
    
    // Dacă avem o componentă specifică pentru istoric, o setăm
    if (payload.history.component) {
      setDisplayComponent(payload.history.component);
      console.log("✅ [HISTORY_HANDLER] Display component set to:", payload.history.component);
    }
  }
  // Caz pentru mesaje simple
  else if (payload.message) {
    addMessage({
      text: payload.message,
      type: "history",
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ [HISTORY_HANDLER] Simple history message added to chat");
  }
  
  // Procesăm acțiuni specifice
  if (payload.action) {
    console.log("Action:", payload.action);
    
    // Dacă action are format Intent, actualizăm starea
    if (payload.action.startsWith('show_')) {
      const { setLatestIntent } = useChatStore.getState();
      
      // Setăm intent-ul
      setLatestIntent(payload.action);
      
      // Setăm componenta de afișare
      setDisplayComponent(payload.action.replace('show_', ''));
    }
  }
  
  console.groupEnd();
}; 