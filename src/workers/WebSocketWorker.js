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
    postMessage({ type: "STATUS", payload: "connected" });
    reconnectAttempts = 0;
  };

  // Handler pentru mesaje primite de la server
  socket.onmessage = (event) => {
    // Log raw message for debugging
    console.group("🔍 [WEBSOCKET] MESSAGE RECEIVED");
    console.log("Raw data:", event.data);
    
    // ======== STRATEGIE DE PROCESARE ÎN ETAPE ========
    
    // 1. PROCESARE FORMAT DIRECT OBIECT
    if (typeof event.data === 'object' && event.data !== null) {
      const directData = event.data;
      
      // Detecție format specific pentru show_calendar
      if (directData.intent === 'show_calendar' && 
          directData.type === 'action' && 
          directData.action === 'show_calendar') {
        
        console.log("🎯 [WEBSOCKET] FORMAT HOTEL-BACKEND DETECTAT");
        
        // Trimitem direct ca CHAT_MESSAGE pentru procesare garantată
        postMessage({
          type: "CHAT_MESSAGE",
          payload: directData
        });
        
        console.groupEnd();
        return; // Oprește procesarea ulterioară
      }
      
      // Procesare generică obiect direct
      if (directData.intent || directData.action) {
        // Mesaje cu intent sau action -> CHAT_MESSAGE
        postMessage({
          type: "CHAT_MESSAGE",
          payload: directData
        });
      } else if (Array.isArray(directData.reservations)) {
        // Mesaje cu rezervări -> RESERVATION_ACTION
        postMessage({
          type: "RESERVATION_ACTION",
          payload: directData
        });
      } else {
        // Alte formate -> default CHAT_MESSAGE
        postMessage({
          type: "CHAT_MESSAGE",
          payload: directData
        });
      }
      
      console.groupEnd();
      return;
    }
    
    // 2. PROCESARE FORMAT JSON STRING
    if (typeof event.data === 'string') {
      try {
        const message = JSON.parse(event.data);
        
        // Detecție format hotel-backend în JSON
        if (message.intent === 'show_calendar' && 
            message.type === 'action' && 
            message.action === 'show_calendar') {
          
          console.log("🎯 [WEBSOCKET] FORMAT HOTEL-BACKEND IN JSON");
          
          postMessage({
            type: "CHAT_MESSAGE",
            payload: message
          });
          
          console.groupEnd();
          return;
        }
        
        // Procesare tipuri standard de mesaje
        if (message.intent) {
          // Format cu intent direct -> CHAT_MESSAGE
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: message
          });
        }
        else if (message.response && message.response.intent) {
          // Format cu response wrapper -> CHAT_MESSAGE cu payload response
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: message.response 
          });
        }
        else if (Array.isArray(message) || (message.reservations && Array.isArray(message.reservations))) {
          // Format rezervări -> RESERVATION_ACTION
          const reservations = Array.isArray(message) ? message : message.reservations;
          postMessage({ 
            type: "RESERVATION_ACTION", 
            payload: { 
              action: message.action || "sync",
              reservations: reservations 
            } 
          });
        }
        else if (message.action && typeof message.action === 'string') {
          // Format action transformată în intent dacă este show_*
          const intent = message.action.startsWith('show_') ? message.action : null;
          
          if (intent) {
            postMessage({
              type: "CHAT_MESSAGE",
              payload: {
                intent: intent,
                type: 'action',
                message: message.message || `Acțiune: ${intent}`,
                ...message
              }
            });
          } else {
            // Trimitem ca atare -> CHAT_MESSAGE
            postMessage({ type: "CHAT_MESSAGE", payload: message });
          }
        }
        else if (message.type) {
          // Procesare bazată pe tipul mesajului
          const upperType = message.type.toUpperCase();
          
          if (["CHAT_RESPONSE", "MESSAGE", "CHAT"].includes(upperType)) {
            postMessage({ type: "CHAT_MESSAGE", payload: message });
          } 
          else if (["RESERVATION", "BOOKING", "RESERVATIONS_UPDATE"].includes(upperType)) {
            postMessage({ type: "RESERVATION_ACTION", payload: message });
          }
          else if (["AUTOMATION", "AUTO", "NOTIFICATION"].includes(upperType)) {
            postMessage({ type: "AUTOMATION_ACTION", payload: message });
          }
          else {
            // Default -> CHAT_MESSAGE
            postMessage({ type: "CHAT_MESSAGE", payload: message });
          }
        }
        else if (message.message && typeof message.message === 'string') {
          // Mesaj simplu -> CHAT_MESSAGE format standard
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: {
              message: message.message,
              type: "message",
              intent: "default"
            }
          });
        }
        else {
          // Format necunoscut -> CHAT_MESSAGE cu avertisment
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: { 
              message: "Received message in unknown format", 
              type: "message",
              intent: "default",
              originalData: message 
            } 
          });
        }
      } catch (error) {
        // Eroare la procesarea JSON
        console.error("❌ [WEBSOCKET] Error parsing message:", error.message);
        postMessage({ 
          type: "CHAT_MESSAGE", 
          payload: { 
            type: "error",
            message: "Error parsing WebSocket message" 
          } 
        });
      }
      
      console.groupEnd();
      return;
    }
    
    // Format necunoscut de date
    console.warn("❓ [WEBSOCKET] Unknown message data type:", typeof event.data);
    console.groupEnd();
  };

  // Handler pentru închiderea conexiunii
  socket.onclose = () => {
    console.warn("⚠️ [WEBSOCKET] Connection closed");
    postMessage({ type: "STATUS", payload: "disconnected" });

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
      type: "CHAT_MESSAGE", 
      payload: { 
        type: "error",
        message: "WebSocket connection error" 
      } 
    });
  };
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
        type: "CHAT_MESSAGE", 
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
        type: "RESERVATION_ACTION", 
        action: payload.action,
        data: payload.data || {}
      }));
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, reservation action not sent");
    }
  }
};