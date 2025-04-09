/**
 * @fileoverview Parser simplu pentru mesajele JSON primite de la server.
 */

/**
 * Parsează mesajul brut primit de la WebSocket.
 * 
 * @param {string | MessageEvent} rawMessage - Mesajul brut (string JSON sau obiect MessageEvent).
 * @returns {Object | null} - Obiectul parsat sau null dacă parsarea eșuează sau mesajul e invalid.
 */
export const parseIncomingMessage = (rawMessage) => {
  let messageData;

  // Extragem datele din MessageEvent dacă e cazul
  if (typeof rawMessage === 'object' && rawMessage !== null && rawMessage.data) {
    messageData = rawMessage.data;
  } else {
    // If it's not a MessageEvent, maybe it's already the data object?
    // This handles cases where the worker might send data directly in tests or specific scenarios.
    messageData = rawMessage; 
  }

  // Removed the string check and JSON.parse as the worker sends objects directly
  // console.error('[MESSAGE_PARSER] Received non-string message data:', messageData); // No longer an error if it's an object

  // Validare - ne așteptăm la un obiect cu o proprietate 'type'
  if (typeof messageData !== 'object' || messageData === null || !messageData.type) {
    console.error('[MESSAGE_PARSER] Invalid message structure or missing type:', messageData);
    return null;
  }

  console.log('[MESSAGE_PARSER] Successfully processed message:', messageData);
  return messageData; // Return the object directly

  // Removed the try...catch block for JSON.parse
  // } catch (error) { ... }
}; 