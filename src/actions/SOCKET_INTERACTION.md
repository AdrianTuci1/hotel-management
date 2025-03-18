# Socket Interaction Protocol

## Overview

This document outlines the protocol for socket interaction between the client and server in the Hotel Management System.

## Message Flow

```
┌─────────┐                           ┌──────────────┐                           ┌────────┐
│   UI    │                           │  WebSocket   │                           │ Server │
│Component│                           │   Worker     │                           │        │
└────┬────┘                           └──────┬───────┘                           └───┬────┘
     │                                       │                                       │
     │ 1. User Action (message, command)     │                                       │
     │──────────────────────────────────────>│                                       │
     │                                       │ 2. Formatted Message                  │
     │                                       │──────────────────────────────────────>│
     │                                       │                                       │
     │                                       │ 3. Server Response                    │
     │                                       │<──────────────────────────────────────│
     │ 4. Normalized & Processed Response    │                                       │
     │<──────────────────────────────────────│                                       │
     │                                       │                                       │
     │ 5. UI Update                          │                                       │
     │                                       │                                       │
```

## Message Types

### Outgoing Messages (Client to Server)

We use a standardized format for all outgoing messages:

```json
{
  "type": "CHAT_MESSAGE",
  "content": "Message content from the user"
}
```

### Incoming Messages (Server to Client)

The server can send four types of messages:

1. **CHAT_MESSAGE**: Regular chat responses
2. **RESERVATION_ACTION**: Updates related to reservations
3. **AUTOMATION_ACTION**: Automation and notification messages
4. **STATUS**: Connection status updates

## Message Processing Pipeline

1. User input is captured in the UI
2. The input is formatted as a standardized message
3. The WebSocket worker sends the message to the server
4. The server response is received by the WebSocket worker
5. The response is normalized and classified by message type
6. The appropriate handler processes the message
7. The UI is updated accordingly

## Message Handlers

### Chat Message Handler
- Processes intents and actions
- Updates UI components
- Handles error messages

### Reservation Action Handler
- Updates reservation data
- Syncs with calendar view
- Manages reservation operations (create, update, delete)

### Automation Action Handler
- Processes notifications
- Handles automated tasks
- Manages system alerts

### Status Handler
- Manages connection status
- Handles reconnection logic
- Provides user feedback on connection state

## Special Intent Processing

Some intents trigger specific UI updates:

- `show_calendar`: Opens the calendar view
- `reservation`: Opens the reservation form
- `show_pos`: Opens the point of sale view
- `show_invoices`: Opens the invoices view
- `show_stock`: Opens the stock management view
- `show_reports`: Opens the reports view 