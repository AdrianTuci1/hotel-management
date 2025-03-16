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
    postMessage({ type: "STATUS", payload: "connected" });
    reconnectAttempts = 0; // Resetăm numărul de reconectări
  };

  socket.onmessage = (event) => {
    try {
      const response = JSON.parse(event.data);
      console.log("📩 Mesaj primit de la WebSocket:", response);

      // 🔹 Procesăm tipurile de mesaje conform protocolului din README
      switch (response.type) {
        case "CHAT_RESPONSE":
          postMessage({ type: "CHAT_RESPONSE", payload: response });
          break;

        case "RESERVATIONS_UPDATE":
          console.log("📅 Actualizare rezervări primită:", response);
          postMessage({ 
            type: "RESERVATIONS_UPDATE", 
            payload: response.action === "init" 
              ? response.reservations 
              : response.reservations // Sincronizare incrementală în viitor
          });
          break;

        case "ROOMS_UPDATE":
          console.log("🏠 Actualizare camere primită:", response);
          postMessage({ type: "ROOMS_UPDATE", payload: response.rooms });
          break;

        case "POS_UPDATE":
          console.log("💰 Actualizare POS primită:", response);
          postMessage({ type: "POS_UPDATE", payload: response.data });
          break;

        case "NOTIFICATION":
          console.log("🔔 Notificare primită:", response);
          postMessage({ type: "NOTIFICATION", payload: response });
          break;

        case "ERROR":
          console.error("❌ Eroare primită de la server:", response);
          postMessage({ type: "ERROR", payload: response.message || "Eroare de la server" });
          break;

        default:
          console.warn("⚠️ Tip de mesaj necunoscut:", response);
          // Încercăm să normalizăm tipurile pentru compatibilitate
          if (response.type?.toLowerCase() === "chat_response") {
            postMessage({ type: "CHAT_RESPONSE", payload: response });
          } else if (Array.isArray(response)) {
            // Tratăm array-uri direct ca rezervări (compatibilitate)
            console.log("📅 Rezervări active primite (format array):", response);
            postMessage({ type: "RESERVATIONS_UPDATE", payload: response });
          }
          break;
      }
    } catch (error) {
      console.error("❌ Eroare la parsarea mesajului WebSocket:", event.data, error);
      postMessage({ type: "ERROR", payload: "Eroare la parsarea mesajului WebSocket" });
    }
  };

  socket.onclose = () => {
    console.warn("⚠️ WebSocket s-a deconectat.");
    postMessage({ type: "STATUS", payload: "disconnected" });

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
    postMessage({ type: "ERROR", payload: "Eroare WebSocket" });
  };
};

// 🔥 Conectăm WebSocket la pornirea worker-ului
connectWebSocket();

// 🔹 Gestionăm mesajele primite de la frontend
self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === "init") {
    // Reinițializăm conexiunea dacă este necesar
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
  } else if (type === "send_message") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Formatăm mesajul conform protocolului din README
      let messageToSend;
      
      // Verificăm dacă payload-ul este deja un string JSON sau un obiect
      if (typeof payload === 'string') {
        try {
          // Încercăm să parsăm în caz că e deja un JSON
          const parsedPayload = JSON.parse(payload);
          messageToSend = parsedPayload;
        } catch (e) {
          // Dacă nu e JSON, îl încapsulăm ca text simplu
          messageToSend = { 
            type: "CHAT_MESSAGE",
            content: payload
          };
        }
      } else {
        // Dacă e obiect, îl folosim direct
        messageToSend = payload;
      }
      
      console.log("📤 Trimitere mesaj prin WebSocket:", messageToSend);
      socket.send(JSON.stringify(messageToSend));
    } else {
      console.warn("⚠️ WebSocket nu este conectat, mesajul nu a fost trimis.");
      postMessage({ type: "ERROR", payload: "WebSocket nu este conectat, mesajul nu a fost trimis." });
      
      // Încercăm reconectarea
      if (!socket || socket.readyState !== WebSocket.CONNECTING) {
        connectWebSocket();
      }
    }
  } else if (type === "automation_action") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("🤖 Trimitere acțiune automată:", payload);
      socket.send(JSON.stringify({ 
        type: "AUTOMATION_ACTION", 
        action: payload
      }));
    } else {
      console.warn("⚠️ WebSocket nu este conectat, acțiunea automată nu a fost trimisă.");
    }
  }
};