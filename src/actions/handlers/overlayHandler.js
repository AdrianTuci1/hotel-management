/**
 * @fileoverview Handler pentru mesajele de tip OVERLAY.
 * 
 * Procesează mesajele care comandă schimbarea view-ului principal sau deschiderea unui overlay/modal.
 */

import { useChatStore } from "../../store/chatStore"; // Presupunem că funcțiile UI sunt în chatStore
import { INTENT_TO_COMPONENT_MAP } from "../types"; // Păstrăm maparea pentru a traduce acțiunea în componentă UI

/**
 * Procesează un mesaj de tip OVERLAY.
 * 
 * @param {Object} message - Mesajul complet primit, conform RESPONSE_DOCUMENTATION.md
 * @param {string} message.type - Tipul mesajului (ar trebui să fie OVERLAY)
 * @param {string} message.action - Acțiunea specifică (ex: "show_calendar", "show_pos")
 * @param {Object | null} message.payload - Datele pentru overlay (dacă există) sau null pentru view switch
 * @param {string} [message.intent] - Intentul original (opțional, pentru context)
 * @returns {void}
 */
export const handleOverlayAction = (message) => {
  console.group("🖱️ [OVERLAY_HANDLER] Processing overlay action");
  console.log("Message:", message);

  const { setDisplayComponent, showOverlay, setLatestIntent } = useChatStore.getState();

  // Verificări de bază
  if (!message || message.type !== 'OVERLAY' || !message.action) {
    console.error("❌ [OVERLAY_HANDLER] Invalid message structure or missing action");
    console.groupEnd();
    return;
  }

  const action = message.action; // ex: "show_calendar", "show_pos"
  const payload = message.payload;
  const intent = message.intent; // ex: "RESERVATION", "SELL_PRODUCT"

  // Păstrăm intentul original, dacă e furnizat
  if (intent) {
      setLatestIntent(intent);
  }

  // Verificăm dacă este o acțiune de deschidere overlay (payload prezent)
  if (payload) {
    console.log(`✨ Opening overlay with action context '${action}' and payload:`, payload);
    // Acțiunea ("show_calendar") indică contextul, intentul ("RESERVATION") ar putea defini tipul overlay-ului?
    // Sau folosim direct intentul pentru a determina ce overlay deschidem?
    // Documentația sugerează că payload-ul e suficient. Vom folosi 'intent' dacă e disponibil, altfel 'action'.
    const overlayType = intent || action; 
    // TODO: Verifică dacă `overlayType` necesită mapare sau este folosit direct.
    showOverlay(overlayType, payload); 

  } 
  // Altfel, este o acțiune de schimbare a view-ului principal (payload null/absent)
  else {
    console.log(`📺 Switching main view based on action '${action}'`);
    // Folosim maparea pentru a găsi componenta corespunzătoare acțiunii
    const componentKey = action.toLowerCase();
    if (INTENT_TO_COMPONENT_MAP[componentKey]) {
      setDisplayComponent(INTENT_TO_COMPONENT_MAP[componentKey]);
      console.log(`✅ Set display component to: ${INTENT_TO_COMPONENT_MAP[componentKey]}`);
    } else {
      console.warn(`⚠️ [OVERLAY_HANDLER] No component mapping found for action: ${action}`);
      // Poate setăm un default sau afișăm o eroare?
    }
  }

  console.groupEnd();
}; 