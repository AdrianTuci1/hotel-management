/**
 * @fileoverview Worker pentru comunicarea WebSocket cu backend-ul.
 * 
 * Acest worker:
 * 1. Gestionează conexiunea WebSocket cu serverul backend
 * 2. Primește mesaje de la firul principal și le trimite la server
 * 3. Parsează mesajele JSON de la server și le trimite direct către firul principal
 * 4. Trimite mesaje de status despre conexiune către firul principal
 * 5. Gestionează reconnectare în caz de erori
 * 
 * Protocolul pentru comunicarea cu firul principal:
 * 
 * Mesaje primite (de la firul principal):
 * - {type: "init"} - Inițializare/verificare conexiune
 * - {type: "send_message", payload: Object} - Trimite mesaj formatat la server
 * 
 * Mesaje trimise (către firul principal):
 * - {type: "STATUS", payload: "connected"|"disconnected"} - Status conexiune
 * - Orice obiect JSON valid primit de la server (cu proprietatea `type`)
 */

/// <reference lib="webworker" />

// Configurație pentru conectare WebSocket
const SOCKET_URL = "ws://localhost:5001/api/chat"; // TODO: Mută într-o configurație externă?
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 secunde
let lastConnectionStatus = null; // Stocăm ultimul status pentru a evita mesaje duplicate

const STATUS_MESSAGE_TYPE = 'STATUS'; // Tip specific pentru mesajele de status intern

/**
 * Conectează la serverul WebSocket și configurează handleri pentru evenimente
 * 
 * @returns {void}
 */
const connectWebSocket = () => {
  // Previne conexiuni multiple
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      console.log("ℹ️ [WEBSOCKET] Connection attempt skipped, already connecting or open.");
      return;
  }

  console.log(`🔌 [WEBSOCKET] Attempting to connect to ${SOCKET_URL}...`);
  socket = new WebSocket(SOCKET_URL);

  // Handler pentru conectare reușită
  socket.onopen = () => {
    console.log("✅ [WEBSOCKET] Connected to", SOCKET_URL);
    
    // Trimitem status doar dacă s-a schimbat
    if (lastConnectionStatus !== "connected") {
      lastConnectionStatus = "connected";
      postMessage({ type: STATUS_MESSAGE_TYPE, payload: { status: "connected" } }); // Trimitem obiect cu status
    }
    
    reconnectAttempts = 0;
  };

  // Handler pentru mesaje primite de la server
  socket.onmessage = (event) => {
    console.group("🔍 [WEBSOCKET] MESSAGE RECEIVED");
    console.log("Raw data:", event.data);
    
    try {
      const parsedData = JSON.parse(event.data);

      // Validare minimă - ne asigurăm că e obiect și are `type`
      if (typeof parsedData === 'object' && parsedData !== null && parsedData.type) {
         console.log("Parsed data:", parsedData);
         // Trimitem obiectul parsat direct către firul principal
         postMessage(parsedData); 
      } else {
         console.error("❌ [WEBSOCKET] Received message is not a valid object with a 'type' property:", parsedData);
         // Nu trimitem mesajul invalid mai departe
      }
    } catch (error) {
      console.error("❌ [WEBSOCKET] Error parsing incoming JSON message:", error);
      console.error("Raw data causing error:", event.data);
      // Nu trimitem datele neparsabile
    }

    console.groupEnd();
  };

  // Handler pentru închiderea conexiunii
  socket.onclose = (event) => {
    console.warn(`⚠️ [WEBSOCKET] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    
    // Trimitem status doar dacă s-a schimbat
    if (lastConnectionStatus !== "disconnected") {
      lastConnectionStatus = "disconnected";
      postMessage({ type: STATUS_MESSAGE_TYPE, payload: { status: "disconnected" } }); // Trimitem obiect cu status
    }

    socket = null; // Reset socket object

    // Mecanism de reconnectare cu număr maxim de încercări
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`🔄 [WEBSOCKET] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_INTERVAL / 1000}s`);
      setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    } else {
      console.error(`❌ [WEBSOCKET] Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`);
    }
  };

  // Handler pentru erori
  socket.onerror = (error) => {
    // Erorile de WebSocket de obicei preced sau coincid cu `onclose`.
    // `onclose` va gestiona trimiterea statusului și reconnectarea.
    console.error("❌ [WEBSOCKET] WebSocket error observed:", error);
    // Nu mai trimitem mesaj de eroare separat aici, onclose va raporta deconectarea.
  };
};

// Funcțiile `processIncomingMessage` și `postMessageWithNormalizedType` au fost eliminate.

// Inițializare conexiune WebSocket la pornirea worker-ului
connectWebSocket();

/**
 * Handler pentru mesaje primite de la firul principal
 * 
 * Procesează următoarele tipuri de mesaje:
 * - init: Inițializare/reinițializare conexiune
 * - send_message: Trimite mesaj către server
 */
self.onmessage = (event) => {
  // Validăm că avem date și un tip
  if (!event.data || !event.data.type) {
    console.warn("❓ [WEBSOCKET] Received invalid message from main thread:", event.data);
    return;
  }

  console.log("📥 [WEBSOCKET] Message from main thread:", event.data);
  
  const { type, payload } = event.data;

  // Inițializare/verificare conexiune
  if (type === "init") {
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      console.log("🔄 [WEBSOCKET] Received 'init', attempting connection.");
      connectWebSocket();
    } else {
       console.log("ℹ️ [WEBSOCKET] Received 'init', connection already open or connecting.");
       // Putem trimite statusul curent înapoi?
       if (socket.readyState === WebSocket.OPEN) {
          postMessage({ type: STATUS_MESSAGE_TYPE, payload: { status: "connected" } });
       }
    }
  } 
  // Trimitere mesaj către server
  else if (type === "send_message") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Mesajul este deja formatat în chatActions, doar îl trimitem
      if (typeof payload === 'object' && payload !== null) {
        try {
          const messageString = JSON.stringify(payload);
          console.log("📤 [WEBSOCKET] Sending message to server:", messageString);
          socket.send(messageString);
        } catch (error) {
          console.error("❌ [WEBSOCKET] Failed to stringify message payload:", error, payload);
        }
      } else {
        console.error("❌ [WEBSOCKET] Invalid payload for 'CHAT_MESSAGE'. Expected object, got:", payload);
      }
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, message not sent:", payload);
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        console.log("🔄 [WEBSOCKET] Attempting reconnect due to send on closed socket.");
        connectWebSocket();
      }
    }
  } 
  // Ignorăm alte tipuri de mesaje
  else {
      console.warn(`❓ [WEBSOCKET] Received unknown message type from main thread: ${type}`);
  }
};