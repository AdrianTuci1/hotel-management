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
    messageData = rawMessage;
  }

  // Ne asigurăm că avem un string înainte de a parsa
  if (typeof messageData !== 'string') {
    console.error('[MESSAGE_PARSER] Received non-string message data:', messageData);
    return null;
  }

  try {
    const parsed = JSON.parse(messageData);
    
    // Validare minimă - ne așteptăm la un obiect cu o proprietate 'type'
    if (typeof parsed !== 'object' || parsed === null || !parsed.type) {
      console.error('[MESSAGE_PARSER] Invalid message structure after parsing:', parsed);
      return null;
    }

    console.log('[MESSAGE_PARSER] Successfully parsed message:', parsed);
    return parsed;

  } catch (error) {
    console.error('[MESSAGE_PARSER] Failed to parse incoming JSON message:', error);
    console.error('[MESSAGE_PARSER] Raw message data:', messageData);
    return null;
  }
}; 