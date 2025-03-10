import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";

let chatWorker;

export const connectSocket = () => {
  if (!chatWorker) {
    chatWorker = new Worker(new URL("../workers/WebSocketWorker.js", import.meta.url));

    chatWorker.onmessage = (event) => {
      const { type, payload } = event.data;
      const { addMessage, setDisplayComponent } = useChatStore.getState();
      const { setReservations } = useCalendarStore.getState();

      console.log("📩 Răspuns WebSocket din Worker:", event.data);

      if (type === "chat_response" && payload.response) {
        const { intent, message, type: msgType, options, formFields, extraIntents } = payload.response;

        // 🔹 Adăugăm răspunsul în chat
        addMessage({
          text: message,
          type: msgType || "bot",
          options: options || null,
          formFields: formFields || null,
        });

        // 📊 Gestionăm deschiderea panourilor UI
        if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(intent)) {
          console.log(`📌 Deschidem panoul: ${intent.replace("show_", "")}`);
          setDisplayComponent(intent.replace("show_", ""));
        }

        // 📊 Gestionăm extraIntents
        if (Array.isArray(extraIntents) && extraIntents.length > 0) {
          extraIntents.forEach((extraIntent) => {
            if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(extraIntent)) {
              console.log(`📌 Deschidem panoul suplimentar: ${extraIntent.replace("show_", "")}`);
              setDisplayComponent(extraIntent.replace("show_", ""));
            }
          });
        }
      } 
      
      else if (type === "active_reservations") {
        console.log("📡 Rezervări active primite:", payload);
        setReservations(payload);
      } 
      
      else if (type === "status") {
        console.log(`ℹ️ WebSocket Status: ${payload}`);
      } 
      
      else if (type === "error") {
        console.error("❌ Eroare WebSocket:", payload);
      }
    };
  }
};

export const handleChatMessage = (message) => {
  const { addMessage } = useChatStore.getState();

  addMessage({ text: message, type: "user" });

  if (chatWorker && chatWorker.postMessage) {
    chatWorker.postMessage({ type: "send_message", payload: message });
  } else {
    console.warn("⚠️ Web Worker nu este inițializat sau nu suportă postMessage!");
  }
};