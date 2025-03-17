/// <reference lib="webworker" />

const SOCKET_URL = "ws://localhost:5001/api/chat";
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// 🔹 Connect to WebSocket server
const connectWebSocket = () => {
  socket = new WebSocket(SOCKET_URL);

  socket.onopen = () => {
    console.log("✅ [WEBSOCKET] Connected to", SOCKET_URL);
    postMessage({ type: "STATUS", payload: "connected" });
    reconnectAttempts = 0;
  };

  socket.onmessage = (event) => {
    // Log raw message for debugging
    console.group("🔍 [WEBSOCKET] MESSAGE RECEIVED");
    console.log("Raw data:", event.data);
    
    // 1. HOTEL-BACKEND DIRECT OBJECT FORMAT
    if (typeof event.data === 'object' && event.data !== null) {
      const directData = event.data;
      
      // Formatul exact hotel-backend
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
      
      // Generic direct object handling
      if (directData.intent || directData.action) {
        postMessage({
          type: "CHAT_MESSAGE",
          payload: directData
        });
      } else if (Array.isArray(directData.reservations)) {
        postMessage({
          type: "RESERVATION_ACTION",
          payload: directData
        });
      } else {
        postMessage({
          type: "CHAT_MESSAGE",
          payload: directData
        });
      }
      
      console.groupEnd();
      return;
    }
    
    // 2. JSON STRING FORMAT
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
        
        // Handle other standard formats
        if (message.intent) {
          // Format cu intent direct
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: message
          });
        }
        else if (message.response && message.response.intent) {
          // Format cu response wrapper
          postMessage({ 
            type: "CHAT_MESSAGE", 
            payload: message.response 
          });
        }
        else if (Array.isArray(message) || (message.reservations && Array.isArray(message.reservations))) {
          // Format rezervări
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
          // Format action -> tratat ca intent
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
            // Trimitem ca atare
            postMessage({ type: "CHAT_MESSAGE", payload: message });
          }
        }
        else if (message.type) {
          // Handle based on message type
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
            postMessage({ type: "CHAT_MESSAGE", payload: message });
          }
        }
        else if (message.message && typeof message.message === 'string') {
          // Simple message
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
          // Unknown format
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
        // Error processing JSON
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
    
    // Unknown data type
    console.warn("❓ [WEBSOCKET] Unknown message data type:", typeof event.data);
    console.groupEnd();
  };

  socket.onclose = () => {
    console.warn("⚠️ [WEBSOCKET] Connection closed");
    postMessage({ type: "STATUS", payload: "disconnected" });

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`🔄 [WEBSOCKET] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    } else {
      console.error("❌ [WEBSOCKET] Maximum reconnection attempts reached");
    }
  };

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

// Connect WebSocket when worker starts
connectWebSocket();

// Handle messages from the main thread
self.onmessage = (event) => {
  console.log("📥 [WEBSOCKET] Message from main thread:", event.data);
  
  const { type, payload } = event.data;

  if (type === "init") {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("🔄 [WEBSOCKET] Initializing connection");
      connectWebSocket();
    }
  } else if (type === "send_message") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      let messageToSend;
      
      // Handle string or object payload
      if (typeof payload === 'string') {
        try {
          // Try to parse as JSON first
          messageToSend = JSON.parse(payload);
        } catch (e) {
          // If not JSON, wrap it as CHAT_MESSAGE
          messageToSend = { 
            type: "CHAT_MESSAGE",
            content: payload
          };
        }
      } else {
        // If already an object, use it directly
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
      
      // Try to reconnect
      if (!socket || socket.readyState !== WebSocket.CONNECTING) {
        connectWebSocket();
      }
    }
  } else if (type === "automation_action") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("🤖 [WEBSOCKET] Sending automation action:", payload);
      
      // Format according to protocol
      socket.send(JSON.stringify({ 
        type: "AUTOMATION_ACTION", 
        action: payload
      }));
    } else {
      console.warn("⚠️ [WEBSOCKET] WebSocket not connected, automation action not sent");
    }
  } else if (type === "reservation_action") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("🏨 [WEBSOCKET] Sending reservation action:", payload);
      
      // Ensure payload has all required fields
      if (!payload.action) {
        console.error("❌ [WEBSOCKET] Missing action field in reservation action");
        return;
      }
      
      // Format according to protocol
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