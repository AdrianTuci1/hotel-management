# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Hotel Management System Store Documentation

This document provides an overview of the state management stores used in the Hotel Management application. The application uses Zustand for state management, with two primary stores: `chatStore` and `calendarStore`.

## Table of Contents
- [Chat Store](#chat-store)
  - [State Structure](#chat-state-structure)
  - [Key Functions](#chat-key-functions)
  - [Usage in Components](#chat-usage-in-components)
- [Calendar Store](#calendar-store)
  - [State Structure](#calendar-state-structure)
  - [Key Functions](#calendar-key-functions)
  - [Usage in Components](#calendar-usage-in-components)
- [Store Integration Examples](#store-integration-examples)
- [Important Implementation Notes](#important-implementation-notes)

## Chat Store

The Chat Store manages the chat interface state, messages, display components, and overlay functionality.

### Chat State Structure

```javascript
{
  messages: [],                // List of chat messages
  hiddenMessages: {},          // Temporarily removed messages
  displayComponent: null,      // Active UI component to display
  latestIntent: null,          // Latest detected intent
  latestUserMessage: null,     // Latest user message text
  overlay: {                   // Overlay state for modals/popups
    isVisible: false,
    type: null,
    data: null
  }
}
```

### Chat Key Functions

| Function | Description |
|----------|-------------|
| `addMessage(message)` | Adds a new message to the chat with auto-generated ID |
| `setLatestIntent(intent)` | Updates the latest detected intent |
| `removeMessage(messageId)` | Temporarily removes a message from display |
| `restoreMessage(messageId, markAsCanceled)` | Restores a previously hidden message |
| `setDisplayComponent(component)` | Sets the active UI component (e.g., calendar, analysis) |
| `closeDisplayComponent()` | Closes the currently active component |
| `showOverlay(type, data)` | Opens an overlay with specified type and data |
| `updateOverlayData(data)` | Updates data for the currently open overlay |
| `closeOverlay()` | Closes the current overlay |
| `resetChat()` | Resets the entire chat state to default values |

### Chat Usage in Components

The Chat Store is primarily used in:

- `ChatWindow.jsx`: Central component that manages chat messages, user interactions, and overlays
- `Dashboard.jsx`: Main application view that handles component switching
- `DisplayPanel.jsx`: Component that renders different UI panels based on the current `displayComponent`
- Various feature components like `CalendarView.jsx`, `AnalysisView.jsx`, and `NotificationView.jsx`
- Action handlers like `chatHandler.js`, `statusHandler.js`, and `automationHandler.js`

#### Example Usage:

```javascript
// From ChatWindow.jsx
const messages = useChatStore((state) => state.messages);
const addMessage = useChatStore((state) => state.addMessage);
const overlay = useChatStore((state) => state.overlay);
const showOverlay = useChatStore((state) => state.showOverlay);

// Adding a message
addMessage({
  type: "system",
  text: "Welcome to the hotel management system!"
});

// Showing an overlay
showOverlay("reservation-details", { reservationId: 123 });
```

## Calendar Store

The Calendar Store manages hotel room data, reservations, and date range functionality.

### Calendar State Structure

```javascript
{
  rooms: [],                   // List of hotel rooms
  reservations: [],            // List of reservations
  startDate: "YYYY-MM-DD",     // Current calendar view start date
  endDate: "YYYY-MM-DD",       // Current calendar view end date
  defaultDates: {              // Default date range for new reservations
    startDate: "",
    endDate: ""
  }
}
```

### Calendar Key Functions

| Function | Description |
|----------|-------------|
| `setDateRange(start, end)` | Updates the date range for calendar view |
| `setDefaultDates(dates)` | Sets default dates for new reservations |
| `setRooms(rooms)` | Updates the list of hotel rooms |
| `isRoomAvailable(roomNumber, startDate, endDate)` | Checks if a room is available for a specific period |
| `getAvailableRooms(startDate, endDate)` | Returns all available rooms for a period |
| `updateViewPeriod(reservationStartDate, reservationEndDate)` | Updates calendar view to show a reservation period |
| `fetchRooms()` | Fetches room data from the API |
| `setReservations(reservations)` | Updates the list of reservations |
| `findReservationById(id)` | Finds a reservation by its ID |
| `findRoomInReservation(reservationId, roomNumber)` | Finds a specific room in a reservation |

### Calendar Usage in Components

The Calendar Store is primarily used in:

- `CalendarView.jsx`: Main calendar component that displays rooms and reservations
- `ChatWindow.jsx`: For checking room availability and setting default dates
- `RoomsSection.jsx`: For displaying room information and availability
- `POSView.jsx`: For point of sale operations related to rooms
- `chatActions.js`: For handling chat commands related to room booking

#### Example Usage:

```javascript
// From CalendarView.jsx
const { 
  rooms, 
  reservations, 
  startDate, 
  endDate, 
  setDateRange, 
  fetchRooms 
} = useCalendarStore();

// Fetch rooms on component mount
useEffect(() => {
  fetchRooms();
  setDays(generateDatesArray(startDate, endDate));
}, [startDate, endDate]);

// Check if a room is available
const isRoomAvailable = (roomNumber, startDate, endDate) => {
  // Implementation using the store's functions
};
```

## Store Integration Examples

The stores are often used together to create a cohesive user experience:

### Calendar Display from Chat

```javascript
// In chat handler:
const handleShowCalendar = () => {
  // Using chatStore to display the calendar component
  useChatStore.getState().setDisplayComponent('calendar');
  
  // Using calendarStore to set the date range
  const today = new Date().toISOString().split("T")[0];
  const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];
  useCalendarStore.getState().setDateRange(today, twoWeeksLater);
  
  // Add confirmation message to chat
  useChatStore.getState().addMessage({
    type: "system",
    text: "Here's the calendar view."
  });
};
```

### Room Booking Flow

1. User requests to book a room through chat
2. Chat handler uses `calendarStore.getAvailableRooms()` to find available rooms
3. Results are displayed using `chatStore.addMessage()`
4. User selects a room, which triggers `chatStore.showOverlay()` with booking form
5. On confirmation, reservation data is stored and `calendarStore.setReservations()` is called
6. Confirmation is shown via `chatStore.addMessage()`

## Important Implementation Notes

### Setting Calendar Date Range

⚠️ **IMPORTANT**: When implementing calendar functionality, follow these guidelines:

1. **Use Calendar Date Range Only via Chat Intents**:
   - The `setDateRange` function in the `calendarStore` should ONLY be called when receiving a reservation through CHAT_INTENTS.
   - Do NOT call `setDateRange` when a user selects a reservation from the calendar view.

2. **Helper Function**:
   - Use the `updateCalendarDateRangeFromChat` helper function from `features/calendar/utils/calendarHelpers.js` to ensure date ranges are only updated via chat intents.
   - This function checks that the intent is a valid chat intent before updating the date range.

3. **Implementation in CalendarView**:
   - The `handleCellClick` function in `CalendarView.jsx` should NOT modify the calendar date range when a user clicks on a reservation.
   - Date ranges should only be updated in response to chat interactions, not direct calendar interactions.

This implementation prevents unexpected date range changes when users interact with the calendar directly, while still allowing the chat system to control the calendar view when needed.
