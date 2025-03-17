# WebSocket Protocol Documentation for Hotel Management System

## Connection Setup

### Connection URL
Connect to the WebSocket server at:
```
ws://your-server-url/api/chat
```

### Connection Initialization
When a client connects, the server will automatically:
1. Add the client to the active clients list
2. Send current active reservations data
3. Set up automation checks

## Message Format

### Client to Server Messages

The client can send messages to the server in the following format:

```javascript
{
  "type": "MESSAGE_TYPE",
  "content": "Message content", // For chat messages
  "action": "ACTION_TYPE",      // For action messages
  "data": {}                    // Optional data for actions
}
```

#### Supported Incoming Message Types (`INCOMING_MESSAGE_TYPES`)

| Type | Description | Required Fields |
|------|-------------|----------------|
| `CHAT_MESSAGE` | Message for natural language processing | `content` (string) |
| `RESERVATION_ACTION` | Action related to reservations | `action`, `data` |
| `ROOM_ACTION` | Action related to rooms | `action`, `data` |
| `POS_ACTION` | Action related to point of sale | `action`, `data` |
| `AUTOMATION_ACTION` | Action related to automation | `action` |

#### Example Chat Message
```javascript
{
  "type": "CHAT_MESSAGE",
  "content": "Rezervă camera 101 de la 15 mai până la 20 mai"
}
```

#### Example Reservation Action
```javascript
{
  "type": "RESERVATION_ACTION",
  "action": "CREATE",
  "data": {
    "fullName": "John Doe",
    "phone": "0712345678",
    "email": "john@example.com",
    "startDate": "2023-05-15",
    "endDate": "2023-05-20",
    "rooms": [{"roomNumber": "101"}]
  }
}
```

#### Example Automation Action
```javascript
{
  "type": "AUTOMATION_ACTION",
  "action": "BOOKING_EMAIL"
}
```

### Server to Client Messages

The server sends messages to clients in the following format:

```javascript
{
  "type": "MESSAGE_TYPE",
  "response": {},    // For chat responses
  "action": "",      // For reservation updates
  "reservations": [],// For reservation data
  "message": ""      // For error messages
}
```

#### Supported Outgoing Message Types (`OUTGOING_MESSAGE_TYPES`)

| Type | Description | Fields |
|------|-------------|--------|
| `CHAT_RESPONSE` | Response to chat message | `response` object |
| `RESERVATIONS_UPDATE` | Reservations data update | `action`, `reservations` |
| `ROOMS_UPDATE` | Rooms data update | Room data |
| `POS_UPDATE` | POS data update | POS data |
| `ERROR` | Error message | `message` |
| `NOTIFICATION` | System notification | `message` |

#### Example Chat Response
```javascript
{
  "type": "CHAT_RESPONSE",
  "response": {
    "intent": "RESERVATION",
    "type": "ACTION",
    "message": "Se deschide formularul pentru o rezervare nouă în camera 101 de la 15 mai până la 20 mai",
    "extraIntents": [],
    "reservation": {
      "roomNumber": "101",
      "startDate": "15 mai",
      "endDate": "20 mai"
    }
  }
}
```

#### Example Reservations Update
```javascript
{
  "type": "RESERVATIONS_UPDATE",
  "action": "sync",  // "init" for initial data, "sync" for updates
  "reservations": [
    {
      "id": 1,
      "fullName": "John Doe",
      "phone": "0712345678",
      "email": "john@example.com",
      "startDate": "2023-05-15",
      "endDate": "2023-05-20",
      "status": "confirmed",
      "rooms": [
        {
          "roomNumber": "101",
          "type": "standard",
          "basePrice": 200,
          "price": 200,
          "startDate": "2023-05-15",
          "endDate": "2023-05-20",
          "status": "confirmed"
        }
      ],
      "isPaid": true,
      "hasInvoice": true,
      "hasReceipt": true,
      "notes": "Special request for extra pillows"
    }
  ]
}
```

#### Example Error Message
```javascript
{
  "type": "ERROR",
  "message": "A apărut o eroare la procesarea mesajului"
}
```

## Intent Types and Response Types

### Chat Intent Types (`CHAT_INTENTS`)

| Intent | Description |
|--------|-------------|
| `RESERVATION` | Create a new reservation |
| `MODIFY_RESERVATION` | Modify an existing reservation |
| `CANCEL_RESERVATION` | Cancel a reservation |
| `ADD_PHONE` | Add phone number to reservation |
| `CREATE_ROOM` | Create a new room |
| `MODIFY_ROOM` | Modify room details |
| `SHOW_REPORTS` | Show reports |
| `SHOW_INVOICES` | Show invoices |
| `SHOW_ROOM_INVOICE` | Show room invoice |
| `SHOW_POS` | Show point of sale module |
| `SELL_PRODUCT` | Sell a product |
| `SHOW_CALENDAR` | Show calendar |
| `SHOW_STOCK` | Show stock |
| `UNKNOWN` | Unknown intent |
| `DEFAULT` | Default intent |

### Response Types (`RESPONSE_TYPES`)

| Type | Description |
|------|-------------|
| `CONFIRM` | Confirmation response |
| `POS` | Point of sale response |
| `ROOM` | Room-related response |
| `ERROR` | Error response |
| `ACTION` | Action response |
| `INFO` | Informational response |

## Action Types

### Reservation Actions (`RESERVATION_ACTIONS`)
- `CREATE` - Create a new reservation
- `UPDATE` - Update an existing reservation
- `DELETE` - Delete a reservation
- `ADD_PHONE` - Add phone number to reservation

### Room Actions (`ROOM_ACTIONS`)
- `CREATE` - Create a new room
- `UPDATE` - Update room details
- `DELETE` - Delete a room

### POS Actions (`POS_ACTIONS`)
- `SELL` - Sell a product
- `REFUND` - Refund a sale
- `CLOSE_SALE` - Close a sale

### Automation Actions (`AUTOMATION_ACTIONS`)
- `BOOKING_EMAIL` - Send booking email
- `WHATSAPP_MESSAGE` - Send WhatsApp message
- `PRICE_ANALYSIS` - Perform price analysis

## Client Implementation Example

Here's a basic client implementation to connect to the WebSocket server:

```javascript
// Connect to WebSocket server
const ws = new WebSocket("ws://your-server-url/api/chat");

// Handle connection open
ws.onopen = () => {
  console.log("WebSocket connection established");
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case "CHAT_RESPONSE":
      handleChatResponse(data.response);
      break;
      
    case "RESERVATIONS_UPDATE":
      if (data.action === "init") {
        // Initialize reservations in the UI
        initializeReservations(data.reservations);
      } else if (data.action === "sync") {
        // Update existing reservations in the UI
        updateReservations(data.reservations);
      }
      break;
      
    case "ERROR":
      console.error("Server error:", data.message);
      // Display error to user
      showError(data.message);
      break;
      
    default:
      console.log("Received message:", data);
  }
};

// Handle chat responses
function handleChatResponse(response) {
  const { intent, type, message, extraIntents } = response;
  
  console.log(`Received ${intent} response of type ${type}: ${message}`);
  
  switch (type) {
    case "ACTION":
      // Perform UI action based on intent
      performAction(intent, response);
      break;
      
    case "ERROR":
      // Display error to user
      showError(message);
      break;
      
    case "INFO":
    default:
      // Display informational message
      showMessage(message);
      break;
  }
}

// Send a chat message to the server
function sendChatMessage(content) {
  ws.send(JSON.stringify({
    type: "CHAT_MESSAGE",
    content: content
  }));
}

// Perform a reservation action
function performReservationAction(action, data) {
  ws.send(JSON.stringify({
    type: "RESERVATION_ACTION",
    action: action,
    data: data
  }));
}

// Handle WebSocket closure
ws.onclose = () => {
  console.log("WebSocket connection closed");
  // Attempt to reconnect or notify user
};

// Handle WebSocket errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

## Reservation Format

Reservations are formatted in the following structure:

```javascript
{
  "id": 1,
  "fullName": "John Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "startDate": "2023-05-15",
  "endDate": "2023-05-20",
  "status": "confirmed", // "booked", "confirmed", "cancelled"
  "rooms": [
    {
      "roomNumber": "101",
      "type": "standard",
      "basePrice": 200,
      "price": 200,
      "startDate": "2023-05-15", // Optional, defaults to reservation startDate
      "endDate": "2023-05-20",   // Optional, defaults to reservation endDate
      "status": "confirmed"
    }
  ],
  "isPaid": true,
  "hasInvoice": true,
  "hasReceipt": true,
  "notes": "Special request for extra pillows"
}
```

## Error Handling

The server handles errors by sending error messages with the `ERROR` type:

```javascript
{
  "type": "ERROR",
  "message": "Error message describing what went wrong"
}
```

Clients should implement appropriate error handling to display these messages to users and take appropriate actions.

## Real-time Synchronization

The system provides real-time synchronization for reservations:

1. When a client connects, they receive all active reservations with action `init`
2. When reservation data changes, all connected clients receive updates with action `sync`

This ensures all clients have up-to-date information without needing to poll the server. 