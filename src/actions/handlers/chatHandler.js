/**
 * @fileoverview Handler pentru mesajele de chat.
 * 
 * Procesează mesajele de tip CHAT_MESSAGE și actualizează interfața în consecință.
 */

import { useChatStore } from "../../store/chatStore";
import { INTENT_TO_COMPONENT_MAP, CHAT_INTENTS, RESPONSE_TYPES } from "../types";

/**
 * Actualizează UI-ul bazat pe intent-ul mesajului
 * 
 * @param {string} intent - Intent-ul de procesat
 * @param {Function} setDisplayComponent - Funcție pentru setarea componentei
 * @returns {boolean} - true dacă a fost găsită o componentă pentru acest intent
 */
const updateUIForIntent = (intent, setDisplayComponent) => {
  if (!intent) return false;
  
  // Convertim la lowercase pentru căutare în map
  const intentLower = intent.toLowerCase();
  
  // Verificăm dacă există o componentă pentru acest intent
  if (INTENT_TO_COMPONENT_MAP[intentLower]) {
    setDisplayComponent(INTENT_TO_COMPONENT_MAP[intentLower]);
    return true;
  }
  
  return false;
};

/**
 * Procesează mesajele de tip rezervare
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @returns {void}
 */
const handleReservationIntent = (payload) => {
  const { showOverlay } = useChatStore.getState();
  
  // Verificăm dacă avem un obiect de rezervare
  if (payload.reservation) {
    // Deschidem formularul de rezervare
    showOverlay('reservation', payload.reservation);
  }
};

/**
 * Procesează un răspuns de chat și actualizează interfața
 * 
 * @param {Object} payload - Payload-ul mesajului
 * @param {Object} ui - Obiect cu funcții pentru actualizarea UI
 * @param {Function} ui.addMessage - Funcție pentru adăugarea unui mesaj în chat
 * @param {Function} ui.setDisplayComponent - Funcție pentru setarea componentei UI
 * @returns {void}
 */
export const handleChatResponse = (payload, { addMessage, setDisplayComponent }) => {
  console.group("🤖 [CHAT_HANDLER] Processing chat response");
  console.log("Payload:", payload);
  
  // Asigurăm că avem un payload valid
  if (!payload) {
    console.error("❌ [CHAT_HANDLER] Invalid payload");
    console.groupEnd();
    return;
  }
  
  // Definim cazuri speciale pentru anumite intenții
  const specialIntentHandlers = {
    [CHAT_INTENTS.RESERVATION]: () => handleReservationIntent(payload),
    [CHAT_INTENTS.MODIFY_RESERVATION]: () => handleReservationIntent(payload)
  };
  
  // Extragem intent-ul
  const intent = payload.intent || CHAT_INTENTS.DEFAULT;
  console.log("Intent:", intent);
  
  // Pasul 1: Adăugăm mesajul în chat
  if (payload.message) {
    addMessage({
      text: payload.message,
      type: payload.type === RESPONSE_TYPES.ERROR ? "error" : "ai",
      timestamp: new Date().toISOString()
    });
  }
  
  // Pasul 2: Setăm intent-ul curent
  useChatStore.getState().setLatestIntent(intent);
  
  // Pasul 3: Actualizăm UI-ul bazat pe intent
  const componentUpdated = updateUIForIntent(intent, setDisplayComponent);
  console.log("Component updated:", componentUpdated);
  
  // Pasul 4: Verificăm dacă avem un handler special pentru acest intent
  if (specialIntentHandlers[intent]) {
    console.log("Executing special handler for intent:", intent);
    specialIntentHandlers[intent]();
  }
  
  console.groupEnd();
}; 