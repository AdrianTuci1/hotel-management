# Chat Actions

## Prezentare Generală

`chatActions.js` este modulul central care gestionează comunicarea între interfața utilizator și serverul WebSocket pentru sistemul de chat. Acest modul coordonează toate acțiunile legate de chat, actualizările de date și notificările.

## Funcționalități Principale

### 1. Inițializare și Conectare

```javascript
initializeChat(): Promise<void>
```

Inițializează conexiunea WebSocket și configurează handler-ele pentru mesaje.

- **Responsabilități**:
  - Stabilește conexiunea WebSocket prin `connectSocket()`
  - Configurează handler-ele pentru diferite tipuri de mesaje
  - Gestionează logging-ul pentru debugging
- **Erori Gestionate**:
  - Eșec la inițializarea conexiunii
  - Mesaje de tip necunoscut
  - Erori de la server

### 2. Procesare Mesaje

#### Normalizare Tip Mesaj

```javascript
normalizeMessageType(type: string): string
```

Convertește tipurile de mesaje primite în formate standardizate.

- **Input**: Tipul mesajului (string)
- **Output**: Tipul normalizat conform `OUTGOING_MESSAGE_TYPES`
- **Mapări Suportate**:
  ```javascript
  {
    'STATUS' -> OUTGOING_MESSAGE_TYPES.STATUS
    'CHAT_RESPONSE' -> OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE
    'CHATRESPONSE' -> OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE
    // ... etc
  }
  ```

#### Tipuri de Mesaje Gestionate

1. **Chat Response**
   - Procesează răspunsurile de la bot
   - Actualizează UI-ul cu mesaje noi
   - Gestionează intent-uri pentru navigare

2. **Rezervations Update**
   - Actualizează lista de rezervări
   - Sincronizează starea cu CalendarStore
   - Logging detaliat pentru debugging

3. **Rooms Update**
   - Actualizează informațiile despre camere
   - Sincronizează cu CalendarStore
   - Logging pentru modificări

4. **Notifications**
   - Procesează notificări sistem
   - Afișează mesaje în interfață
   - Gestionează diferite tipuri de notificări

5. **Error Handling**
   - Procesează erori de la server
   - Afișează mesaje de eroare utilizatorului
   - Încearcă reconectarea când este necesar

### 3. Trimitere Mesaje

```javascript
handleChatMessage(message: string): Promise<void>
```

Gestionează trimiterea mesajelor către server.

- **Proces**:
  1. Adaugă mesajul în UI
  2. Verifică conexiunea WebSocket
  3. Trimite mesajul către server
  4. Gestionează erori și reconectare

- **Retry Logic**:
  - Încearcă reconectarea la 5 secunde
  - Afișează mesaje de eroare utilizatorului
  - Logging detaliat pentru debugging

### 4. Funcții de Automatizare

```javascript
checkBookingEmails(): void
checkWhatsAppMessages(): void
analyzePrices(): void
```

Funcții pentru automatizări și verificări periodice.

## Integrare cu Store-uri

### ChatStore
- Gestionează mesajele și starea chat-ului
- Actualizează UI-ul cu mesaje noi
- Controlează componenta activă

### CalendarStore
- Sincronizează rezervările
- Actualizează informațiile despre camere
- Gestionează perioadele de vizualizare

## Logging și Debugging

### Grupuri de Logging
```javascript
console.group("📩 Mesaj WebSocket Primit");
console.log("Tip original:", rawType);
console.log("Tip normalizat:", type);
console.log("Payload:", payload);
console.log("Timestamp:", new Date().toISOString());
console.groupEnd();
```

### Mesaje de Eroare
```javascript
console.error("❌ Eroare la trimiterea mesajului:", error);
```

## Exemple de Utilizare

### Inițializare Chat
```javascript
await initializeChat();
```

### Trimitere Mesaj
```javascript
await handleChatMessage("Verifică disponibilitatea pentru camera 101");
```

### Verificare Booking
```javascript
checkBookingEmails();
```

## Best Practices

1. **Gestionare Erori**
   - Folosiți try-catch pentru operații async
   - Oferiți feedback utilizatorului
   - Implementați mecanisme de retry

2. **Logging**
   - Folosiți grupuri pentru context
   - Includeți timestamp-uri
   - Logați starea înainte și după actualizări

3. **Tipuri de Mesaje**
   - Folosiți constante pentru tipuri
   - Normalizați mesajele primite
   - Validați payload-ul

4. **State Management**
   - Actualizați store-urile atomic
   - Verificați starea înainte de actualizare
   - Mențineți consistența între store-uri

## Troubleshooting

### Probleme Comune

1. **Conexiune Pierdută**
   ```javascript
   if (!worker) {
     console.log("⚠️ Worker nu există, încercăm să ne conectăm...");
     worker = await connectSocket();
   }
   ```

2. **Mesaje Necunoscute**
   ```javascript
   console.warn("⚠️ Tip de mesaj necunoscut:", rawType, "->", type);
   ```

3. **Erori de Comunicare**
   ```javascript
   setTimeout(initializeChat, 5000); // Reconectare automată
   ```

### Debugging

1. Verificați conexiunea WebSocket
2. Monitorizați console.group pentru context
3. Verificați normalizarea tipurilor de mesaje
4. Urmăriți actualizările de state 