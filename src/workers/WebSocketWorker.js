/// <reference lib="webworker" />

const SOCKET_URL = "ws://localhost:5001/api/chat";
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 secunde

// 🔹 Funcție pentru conectarea WebSocket
const connectWebSocket = () => {
  socket = new WebSocket(SOCKET_URL);

  socket.onopen = () => {
    console.log("✅ WebSocket conectat la", SOCKET_URL);
    postMessage({ type: "status", payload: "connected" });
    reconnectAttempts = 0; // Resetăm numărul de reconectări
  };

  socket.onmessage = (event) => {
    try {
      const response = JSON.parse(event.data);
      console.log("📩 Mesaj primit de la WebSocket:", response);

      // 🔹 Procesăm tipurile de mesaje
      switch (response.type) {
        case "chat_response":
          postMessage({ type: "chat_response", payload: response });
          break;

        case "reservations_update":
        case "array": // Handle direct array of reservations
          const reservations = response.type === "reservations_update" 
            ? response.reservations 
            : response;
          console.log("📅 Rezervări active primite:", reservations);
          postMessage({ type: "reservations_update", payload: reservations });
          break;

        case "rooms_update":
          console.log("🏠 Actualizare camere primită:", response);
          postMessage({ type: "rooms_update", payload: response.rooms });
          break;

        case "pos_update":
          console.log("💰 Actualizare POS primită:", response);
          postMessage({ type: "pos_update", payload: response.data });
          break;

        case "notification":
          console.log("🔔 Notificare primită:", response);
          // Handle specific automation notifications
          if (response.title === "Rezervare nouă Booking.com" ||
              response.title === "Mesaj WhatsApp nou" ||
              response.title === "Analiză prețuri completă") {
            postMessage({ type: "notification", payload: response });
          }
          break;

        case "error":
          console.error("❌ Eroare primită de la server:", response);
          postMessage({ type: "error", payload: response.message || "Eroare de la server" });
          break;

        default:
          console.warn("⚠️ Tip de mesaj necunoscut:", response);
          break;
      }
    } catch (error) {
      console.error("❌ Eroare la parsarea mesajului WebSocket:", event.data, error);
      postMessage({ type: "error", payload: "Eroare la parsarea mesajului WebSocket" });
    }
  };

  socket.onclose = () => {
    console.warn("⚠️ WebSocket s-a deconectat.");
    postMessage({ type: "status", payload: "disconnected" });

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`🔄 Reîncercare conexiune WebSocket... (${reconnectAttempts})`);
      setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    } else {
      console.error("❌ WebSocket a atins limita maximă de reconectări.");
    }
  };

  socket.onerror = (error) => {
    console.error("❌ Eroare WebSocket:", error);
    postMessage({ type: "error", payload: "Eroare WebSocket" });
  };
};

// 🔥 Conectăm WebSocket la pornirea worker-ului
connectWebSocket();

// 🔹 Gestionăm mesajele primite de la frontend
self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === "send_message") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("📤 Trimitere mesaj prin WebSocket:", payload);
      socket.send(JSON.stringify({ type: "chat_message", content: payload }));
    } else {
      console.warn("⚠️ WebSocket nu este conectat, mesajul nu a fost trimis.");
    }
  }
};