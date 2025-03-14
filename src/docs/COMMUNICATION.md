# Comunicare între Componente

## Arhitectura de Comunicare

### 1. Store-uri Principale

#### ChatStore (`src/store/chatStore.js`)
- **Scop**: Gestionează starea chat-ului și comunicarea cu utilizatorul
- **State Principal**:
  - `messages`: Array de mesaje în chat
  - `displayComponent`: Componenta activă pentru afișare
- **Acțiuni**:
  - `addMessage`: Adaugă un mesaj în chat
  - `setDisplayComponent`: Setează componenta activă
  - `closeDisplayComponent`: Închide componenta activă
  - `resetChat`: Resetează starea chat-ului

#### CalendarStore (`src/store/calendarStore.js`)
- **Scop**: Gestionează starea calendarului și rezervărilor
- **State Principal**:
  - `rooms`: Lista camerelor disponibile
  - `reservations`: Lista rezervărilor
  - `startDate`, `endDate`: Perioada vizualizată
- **Acțiuni**:
  - `setDateRange`: Actualizează perioada vizualizată
  - `setReservations`: Actualizează lista de rezervări
  - `isRoomAvailable`: Verifică disponibilitatea unei camere
  - `findReservationById`: Găsește o rezervare după ID

### 2. Flux de Comunicare

#### Chat -> chatActions
1. Utilizatorul introduce un mesaj în `ChatInput`
2. `handleChatMessage` din chatActions este apelat
3. Mesajul este adăugat în ChatStore
4. Worker-ul WebSocket procesează mesajul

#### chatActions -> Calendar
1. Worker-ul primește răspuns de la server
2. În funcție de tipul răspunsului:
   - `CHAT_RESPONSE`: Adaugă mesaj în ChatStore
   - `RESERVATIONS_UPDATE`: Actualizează CalendarStore
   - `ROOMS_UPDATE`: Actualizează informațiile despre camere

#### Calendar -> Chat
1. Interacțiunile din Calendar pot genera mesaje în chat
2. Actualizările de rezervări sunt reflectate în ambele componente
3. Selecția perioadelor este sincronizată

### 3. Tipuri de Mesaje

#### Mesaje Chat
```typescript
interface ChatMessage {
  type: "user" | "bot" | "notification" | "analysis";
  text: string;
  reservation?: ReservationData;
  link?: { url: string; text: string };
  aiResponse?: string;
}
```

#### Actualizări Rezervări
```typescript
interface ReservationUpdate {
  id: string;
  rooms: Array<{
    roomNumber: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
  }>;
  fullName: string;
  phone: string;
}
```

### 4. Best Practices

1. **Consistență în Actualizări**
   - Folosiți întotdeauna acțiunile store-ului pentru modificări
   - Evitați actualizarea directă a state-ului

2. **Gestionarea Erorilor**
   - Implementați handling pentru erori de comunicare
   - Oferiți feedback vizual utilizatorului

3. **Performanță**
   - Evitați actualizări în cascadă
   - Folosiți memoizare pentru calcule costisitoare

4. **Debugging**
   - Folosiți grupuri de console.log pentru urmărire
   - Mențineți un format consistent pentru logging

### 5. Exemple de Utilizare

```javascript
// Adăugare mesaj în chat
const { addMessage } = useChatStore.getState();
addMessage({
  type: "bot",
  text: "Am găsit următoarele camere disponibile..."
});

// Actualizare rezervări
const { setReservations } = useCalendarStore.getState();
setReservations(newReservations);

// Verificare disponibilitate cameră
const { isRoomAvailable } = useCalendarStore.getState();
const available = isRoomAvailable(roomNumber, startDate, endDate);
``` 