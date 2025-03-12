import { useChatStore } from "../store/chatStore";
import { useCalendarStore } from "../store/calendarStore";

let chatWorker = null;
let isInitializing = false;

export const connectSocket = async () => {
  if (chatWorker || isInitializing) return;

  try {
    isInitializing = true;
    chatWorker = new Worker(new URL("../workers/WebSocketWorker.js", import.meta.url));

    // Verificăm dacă Worker-ul s-a inițializat corect
    if (!chatWorker) {
      throw new Error("Nu s-a putut inițializa Web Worker-ul");
    }

    // Adăugăm handler pentru erori
    chatWorker.onerror = (error) => {
      console.error("❌ Eroare în Web Worker:", error);
      chatWorker = null;
    };

    chatWorker.onmessage = (event) => {
      const { type, payload } = event.data;
      const { addMessage, setDisplayComponent } = useChatStore.getState();
      const { setReservations } = useCalendarStore.getState();

      console.log("📩 Răspuns WebSocket din Worker:", event.data);

      if (type === "chat_response" && payload.response) {
        const { intent, message, type: msgType, options, formFields, extraIntents, reservation } = payload.response;

        // Formatăm rezervarea dacă există
        const formattedReservation = reservation ? {
          id: reservation.id || null,
          fullName: reservation.guestName,
          preferences: reservation.preferences,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          type: reservation.roomType,
          status: "booked"
        } : null;

        // Adăugăm răspunsul în chat
        addMessage({
          text: message,
          type: msgType || "bot",
          reservation: formattedReservation,
          formFields: formFields || null,
        });

        // Gestionăm deschiderea panourilor UI
        if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(intent)) {
          console.log(`📌 Deschidem panoul: ${intent.replace("show_", "")}`);
          setDisplayComponent(intent.replace("show_", ""));
        }

        if (Array.isArray(extraIntents) && extraIntents.length > 0) {
          extraIntents.forEach((extraIntent) => {
            if (["show_calendar", "show_pos", "show_invoices", "show_stock"].includes(extraIntent)) {
              console.log(`📌 Deschidem panoul suplimentar: ${extraIntent.replace("show_", "")}`);
              setDisplayComponent(extraIntent.replace("show_", ""));
            }
          });
        }
      } 
      
      else if (type === "active_reservations" || type === "reservations_update") {
        console.log(`📡 ${type === "active_reservations" ? "Rezervări active" : "Actualizare rezervări"} primite:`, payload);
        
        // Asigurăm-ne că toate rezervările au formatul corect
        const formattedReservations = payload.map(reservation => ({
          id: reservation.id,
          fullName: reservation.fullName,
          phone: reservation.phone,
          rooms: Array.isArray(reservation.rooms) ? reservation.rooms : [{
            roomNumber: reservation.roomNumber,
            startDate: reservation.startDate || reservation.checkInDate,
            endDate: reservation.endDate || reservation.checkOutDate,
            price: reservation.price,
            type: reservation.roomType,
            status: reservation.status || "pending"
          }]
        }));

        setReservations(formattedReservations);
      }
      
      else if (type === "status") {
        console.log(`ℹ️ WebSocket Status: ${payload}`);
      } 
      
      else if (type === "error") {
        console.error("❌ Eroare WebSocket:", payload);
        // Încercăm să reinițializăm conexiunea în caz de eroare
        chatWorker = null;
        setTimeout(connectSocket, 5000);
      }
    };

    // Verificăm dacă Worker-ul este gata
    chatWorker.postMessage({ type: "init" });
    console.log("✅ Web Worker inițializat cu succes");
  } catch (error) {
    console.error("❌ Eroare la inițializarea Web Worker:", error);
    chatWorker = null;
  } finally {
    isInitializing = false;
  }
};

export const handleChatMessage = async (message) => {
  const { addMessage } = useChatStore.getState();
  addMessage({ text: message, type: "user" });

  // Încercăm să reinițializăm Worker-ul dacă nu există
  if (!chatWorker) {
    await connectSocket();
  }

  try {
    if (chatWorker?.postMessage) {
      chatWorker.postMessage({ type: "send_message", payload: message });
    } else {
      throw new Error("Web Worker nu este disponibil");
    }
  } catch (error) {
    console.error("❌ Eroare la trimiterea mesajului:", error);
    addMessage({
      type: "bot",
      text: "Ne pare rău, dar a apărut o eroare în comunicarea cu serverul. Vă rugăm să încercați din nou.",
    });
    
    // Încercăm să reinițializăm conexiunea
    chatWorker = null;
    setTimeout(connectSocket, 5000);
  }
};