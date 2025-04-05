/**
 * @fileoverview Worker pentru comunicarea WebSocket cu backend-ul.
 * 
 * Acest worker:
 * 1. Gestionează conexiunea WebSocket cu serverul backend
 * 2. Primește mesaje de la firul principal și le trimite la server
 * 3. Procesează mesaje de la server și le trimite înapoi la firul principal
 * 4. Gestionează reconnectare în caz de erori
 * 
 * Protocolul pentru comunicarea cu firul principal:
 * 
 * Mesaje primite (de la firul principal):
 * - {type: "init"} - Inițializare conexiune
 * - {type: "send_message", payload: Object|String} - Trimite mesaj la server
 * - {type: "automation_action", payload: String} - Trimite acțiune de automatizare
 * - {type: "reservation_action", payload: Object} - Trimite acțiune pentru rezervări
 * 
 * Mesaje trimise (către firul principal):
 * - {type: "STATUS", payload: "connected"|"disconnected"} - Status conexiune
 * - {type: "CHAT_MESSAGE", payload: Object} - Mesaj de chat de la server
 * - {type: "RESERVATION_ACTION", payload: Object} - Acțiune pentru rezervări
 * - {type: "AUTOMATION_ACTION", payload: Object} - Acțiune de automatizare/notificare
 */

/// <reference lib="webworker" />

// Configurație pentru conectare WebSocket
const SOCKET_URL = "ws://localhost:5001/api/chat";
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 secunde
let lastConnectionStatus = null; // Stocăm ultimul status pentru a evita mesaje duplicate

// Constante pentru tipuri de mesaje
const MESSAGE_TYPES = {
  CHAT: 'chat',
  RESERVATIONS: 'reservations',
  NOTIFICATION: 'notification',
  HISTORY: 'history',
  STATUS: 'status'
};

/**
 * Conectează la serverul WebSocket și configurează handleri pentru evenimente
 * 
 * @returns {void}
 */
const connectWebSocket = () => {
  socket = new WebSocket(SOCKET_URL);

  // Handler pentru conectare reușită
  socket.onopen = () => {
    console.log("✅ [WEBSOCKET] Connected to", SOCKET_URL);
    
    // Trimitem status doar dacă s-a schimbat
    if (lastConnectionStatus !== "connected") {
      lastConnectionStatus = "connected";
      postMessage({ type: MESSAGE_TYPES.STATUS, payload: "connected" });
    }
    
    reconnectAttempts = 0;
  };

  // Handler pentru mesaje primite de la server
  socket.onmessage = (event) => {
    // Log raw message for debugging
    console.group("🔍 [WEBSOCKET] MESSAGE RECEIVED");
    console.log("Raw data:", event.data);
    
    // Procesăm mesajul în format standardizat
    processIncomingMessage(event.data);
    
    console.groupEnd();
  };

  // Handler pentru închiderea conexiunii
  socket.onclose = () => {
    console.warn("⚠️ [WEBSOCKET] Connection closed");
    
    // Trimitem status doar dacă s-a schimbat
    if (lastConnectionStatus !== "disconnected") {
      lastConnectionStatus = "disconnected";
      postMessage({ type: MESSAGE_TYPES.STATUS, payload: "disconnected" });
    }

    // Mecanism de reconnectare cu număr maxim de încercări
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`🔄 [WEBSOCKET] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    } else {
      console.error("❌ [WEBSOCKET] Maximum reconnection attempts reached");
    }
  };

  // Handler pentru erori
  socket.onerror = (error) => {
    console.error("❌ [WEBSOCKET] WebSocket error:", error);
    postMessage({ 
      type: MESSAGE_TYPES.CHAT, 
      payload: { 
        type: "error",
        message: "WebSocket connection error" 
      } 
    });
  };
};

/**
 * Procesează un mesaj primit de la server și îl trimite în format standardizat
 * către firul principal
 * 
 * @param {any} data - Datele primite de la server
 * @returns {void}
 */
const processIncomingMessage = (data) => {
  // CARCASĂ 1: OBIECT DIRECT
  if (typeof data === 'object' && data !== null) {
    const directObject = data;
    
    // Procesăm în funcție de proprietățile obiectului
    if (directObject.type && typeof directObject.type === 'string') {
      // Trimitem direct cu tipul standardizat
      postMessageWithNormalizedType(directObject.type, directObject);
      return;
    }
    
    // Dacă nu are tip, detectăm tipul din alte proprietăți
    if (directObject.intent || directObject.message) {
      postMessage({ type: MESSAGE_TYPES.CHAT, payload: directObject });
      return;
    }
    
    if (Array.isArray(directObject.reservations)) {
      postMessage({ type: MESSAGE_TYPES.RESERVATIONS, payload: directObject });
      return;
    }
    
    if (directObject.notification) {
      postMessage({ type: MESSAGE_TYPES.NOTIFICATION, payload: directObject });
      return;
    }
    
    // Default fallback pentru obiecte
    postMessage({ type: MESSAGE_TYPES.CHAT, payload: directObject });
    return;
  }
  
  // CARCASĂ 2: JSON STRING
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      
      // După parsare, procesăm ca obiect
      if (parsedData.type && typeof parsedData.type === 'string') {
        // Trimitem direct cu tipul standardizat
        postMessageWithNormalizedType(parsedData.type, parsedData);
        return;
      }
      
      // Dacă nu are tip, detectăm tipul din alte proprietăți
      if (parsedData.intent || parsedData.message) {
        postMessage({ type: MESSAGE_TYPES.CHAT, payload: parsedData });
        return;
      }
      
      if (parsedData.response && parsedData.response.intent) {
        postMessage({ type: MESSAGE_TYPES.CHAT, payload: parsedData.response });
        return;
      }
      
      if (Array.isArray(parsedData.reservations) || Array.isArray(parsedData)) {
        postMessage({ 
          type: MESSAGE_TYPES.RESERVATIONS, 
          payload: Array.isArray(parsedData) ? { reservations: parsedData } : parsedData 
        });
        return;
      }
      
      if (parsedData.notification) {
        postMessage({ type: MESSAGE_TYPES.NOTIFICATION, payload: parsedData });
        return;
      }
      
      // Default fallback pentru JSON
      postMessage({ type: MESSAGE_TYPES.CHAT, payload: parsedData });
    } catch (error) {
      // Dacă nu e JSON valid, trimitem ca mesaj text simplu
      console.error("❌ [WEBSOCKET] Error parsing JSON message:", error.message);
      postMessage({ 
        type: MESSAGE_TYPES.CHAT, 
        payload: { 
          type: "message",
          message: data 
        } 
      });
    }
    return;
  }
  
  // CARCASĂ 3: ALT TIP DE DATE
  console.warn("❓ [WEBSOCKET] Unknown message data type:", typeof data);
  postMessage({ 
    type: MESSAGE_TYPES.CHAT, 
    payload: { 
      type: "system",
      message: `Received message of unknown type: ${typeof data}` 
    } 
  });
};

/**
 * Trimite un mesaj către firul principal, normalizând tipul mesajului
 * 
 * @param {string} type - Tipul mesajului
 * @param {Object} payload - Conținutul mesajului
 * @returns {void}
 */
const postMessageWithNormalizedType = (type, payload) => {
  const upperType = type.toUpperCase();
  
  if (upperType === 'CHAT' || upperType === 'MESSAGE' || upperType === 'CHAT_MESSAGE') {
    postMessage({ type: MESSAGE_TYPES.CHAT, payload });
  } 
  else if (upperType === 'RESERVATIONS' || upperType === 'BOOKING' || upperType === 'RESERVATION') {
    postMessage({ type: MESSAGE_TYPES.RESERVATIONS, payload });
  }
  else if (upperType === 'NOTIFICATION' || upperType === 'ALERT' || upperType === 'AUTOMATION') {
    postMessage({ type: MESSAGE_TYPES.NOTIFICATION, payload });
  }
  else if (upperType === 'HISTORY') {
    postMessage({ type: MESSAGE_TYPES.HISTORY, payload });
  }
  else {
    // Default, trimitem ca mesaj de chat
    postMessage({ type: MESSAGE_TYPES.CHAT, payload });
  }
};

// Inițializare conexiune WebSocket la pornirea worker-ului
connectWebSocket();

/**
 * Handler pentru mesaje primite de la firul principal
 * 
 * Procesează următoarele tipuri de mesaje:
 * - init: Inițializare/reinițializare conexiune
 * - send_message: Trimite mesaj către server
 * - automation_action: Trimite acțiune de automatizare
 * - reservation_action: Trimite acțiune pentru rezervări
 */
self.onmessage = (event) => {
  console.log("📥 [WEBSOCKET] Message from main thread:", event.data);
  
  const { type, payload } = event.data;

  // Inițializare conexiune
  if (type === "init") {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("🔄 [WEBSOCKET] Initializing connection");
      connectWebSocket();
    }
  } 
  // Trimitere mesaj către server
  else if (type === "send_message") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      let messageToSend;
      
      // Procesare payload string sau obiect
      if (typeof payload === 'string') {
        try {
          // Încercăm parsarea ca JSON
          messageToSend = JSON.parse(payload);
        } catch (e) {
          // Dacă nu e JSON, îl împachetăm ca CHAT_MESSAGE
          messageToSend = { 
            type: "CHAT_MESSAGE",
            content: payload
          };
        }
      } else {
        // Dacă e deja obiect, îl folosim direct
        messageToSend = payload;
      }
      
      console.log("📤 [WEBSOCKET] Sending message:", messageToSend);
      socket.send(JSON.stringify(messageToSend));
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, message not sent");
      postMessage({ 
        type: MESSAGE_TYPES.CHAT, 
        payload: { 
          type: "error",
          message: "WebSocket not connected, message not sent" 
        } 
      });
      
      // Încercăm reconnectarea
      if (!socket || socket.readyState !== WebSocket.CONNECTING) {
        connectWebSocket();
      }
    }
  } 
  // Trimitere acțiune automată
  else if (type === "automation_action") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("🤖 [WEBSOCKET] Sending automation action:", payload);
      
      // Format conform protocolului
      socket.send(JSON.stringify({ 
        type: "AUTOMATION_ACTION", 
        action: payload
      }));
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, automation action not sent");
    }
  } 
  // Trimitere acțiune rezervare
  else if (type === "reservation_action") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("🏨 [WEBSOCKET] Sending reservation action:", payload);
      
      // Verificare câmpuri obligatorii
      if (!payload.action) {
        console.error("❌ [WEBSOCKET] Missing action field in reservation action");
        return;
      }
      
      // Format conform protocolului
      socket.send(JSON.stringify({ 
        type: "reservations", 
        action: payload.action,
        data: payload.data || {}
      }));
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, reservation action not sent");
    }
  }
};