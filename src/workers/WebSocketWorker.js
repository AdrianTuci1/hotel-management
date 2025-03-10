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
      if (response.type === "chat_response") {
        postMessage({ type: "chat_response", payload: response });
      } else if (response.type === "active_reservations") {
        postMessage({ type: "active_reservations", payload: response.reservations });
      } else {
        console.warn("⚠️ Tip de mesaj necunoscut:", response);
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