# Chat Component Documentation

This document provides an overview of the chat component architecture, its sub-components, state management, key interaction flows, and guidelines for extension.

## Directory Structure

```
src/components/Chat/
├── ChatWindow.jsx             # Main UI orchestrator component
├── ChatInput.jsx              # User input field and command suggestions
├── ChatMessage.jsx            # Renders standard user/bot/notification/analysis messages
├── AutomationMessage.jsx      # Renders messages related to external automations
├── ChatOverlay.jsx            # Renders modal overlays (acts as a switcher based on type)
├── hooks/
│   └── useChatWindowLogic.js  # Custom hook managing ChatWindow state and logic
├── constants.js               # Shared constants (message types, automation types)
├── index.js                   # Exports main components
├── utils/                     # Utility functions (overlay handlers, suggestions)
│   └── overlayHandlers.js     # Logic for handling overlay actions (API calls, store updates)
├── types/                     # Type definitions (if any)
├── constants/                 # Command definitions
│   └── commands.js            # Definitions for structured commands
├── ChatWindow.module.css      # Styles for ChatWindow
├── ChatInput.module.css       # Styles for ChatInput
├── ChatMessage.module.css     # Styles for ChatMessage & AutomationMessage
└── ChatOverlay.module.css     # Styles for ChatOverlay
```

## Component Responsibilities & Data Flow

*   **`ChatWindow.jsx`**: (UI Layer)
    *   Acts as the primary UI container for the chat interface.
    *   Uses the `useChatWindowLogic` hook to get state (`messages`, `latestIntent`, `overlay`, `showCommands`) and event handlers (`onShowDetails`, `onOverlayAction`, `handleCloseOverlay`, `toggleCommands`).
    *   Renders the list of messages (`ChatMessage`), the input area (`ChatInput`), and the overlay container (`ChatOverlay`) based on the state received from the hook.
    *   Passes necessary handlers down to child components (e.g., `onShowDetails` to `ChatMessage`, `handleChatMessage` (imported action) to `ChatInput`, `onClose`/`onAction` to `ChatOverlay`).
    *   **Data Flow**: Receives data and handlers *from* `useChatWindowLogic`. Passes handlers *down* to children.

*   **`useChatWindowLogic.js`**: (Logic/State Layer for ChatWindow)
    *   Encapsulates the logic and state management specifically for the main chat window view.
    *   Connects to Zustand stores (`useChatStore`, `useRoomOptionsStore`, `useCalendarStore`) to select relevant state and actions.
    *   Contains `useEffect` for initialization (`initializeChat`) and cleanup (`resetRoomOptions`).
    *   Defines event handlers (`onShowDetails`, `onOverlayAction`, `handleCloseOverlay`, `toggleCommands`) which often orchestrate calls to utility functions (`overlayHandlers.js`) or directly modify store state.
    *   Manages local UI state like `showCommands`.
    *   Returns an object containing the necessary state values and handlers for `ChatWindow.jsx` to consume.
    *   **Data Flow**: Selects state *from* stores. Defines handlers that call utility functions or modify stores. Provides state/handlers *to* `ChatWindow.jsx`.

*   **`ChatInput.jsx`**: (UI & Local State)
    *   Provides the text input field and suggestion display.
    *   Manages its own local state for the input value and suggestions.
    *   Imports and calls `handleChatMessage` directly via its `onSendMessage` prop when the user submits.
    *   **Data Flow**: Receives `onSendMessage` handler prop. Calls `handleChatMessage` (action) *directly*.

*   **`ChatMessage.jsx`**: (UI Layer)
    *   Renders individual messages.
    *   If a message contains `reservation` data, it calls the `onShowDetails` prop (received from `ChatWindow` -> `useChatWindowLogic`) to trigger the overlay display.
    *   Delegates rendering of `automation` type messages to `AutomationMessage`.
    *   **Data Flow**: Receives `message` data and `onShowDetails` handler *from* `ChatWindow`.

*   **`AutomationMessage.jsx`**: (UI Layer)
    *   Specialized component for rendering automation messages.
    *   Displays data based on the message prop.
    *   **Data Flow**: Receives `message` data *from* `ChatMessage`.

*   **`ChatOverlay.jsx`**: (UI Layer - Switcher)
    *   Acts as a conditional renderer (switcher) for different overlay contents based on the `type` prop (`reservation`, `room`, `productSales`).
    *   Renders the corresponding component (`ReservationDetails`, `RoomManagement`, `ProductSales`) passing the `data` prop.
    *   Receives `isVisible`, `type`, `data`, `onClose`, and `onAction` props from `ChatWindow`.
    *   Passes `onClose` and `onAction` down to the rendered content component (e.g., `ReservationDetails`).
    *   **Data Flow**: Receives props *from* `ChatWindow`. Renders specific overlay components and passes `data`, `onClose`, `onAction` props *down*.

*   **`overlayHandlers.js`**: (Utility/Service Layer)
    *   Contains functions (`handleShowDetails`, `handleOverlayAction`) that encapsulate the *logic* for specific overlay interactions.
    *   These functions directly import and use Zustand store actions/state (`useChatStore.getState()`, `useRoomOptionsStore.getState()`, etc.) to modify application state.
    *   They also make API calls (e.g., `createReservation`, `updateRoom`).
    *   They are called by the handlers defined in `useChatWindowLogic.js`.
    *   **Data Flow**: Called *by* `useChatWindowLogic` handlers. Imports/modifies state *directly from* stores. Calls *external* APIs.

*   **Overlay Content Components (`ReservationDetails`, `RoomManagement`, `ProductSales`)**: (UI & State Layer)
    *   Responsible for rendering the specific UI for their respective overlay type.
    *   **Crucially**: Components like `ReservationDetails` (and its sub-components like `RoomsSection`) now directly import and use hooks for relevant stores (`useRoomOptionsStore`, `useCalendarStore`) to get the data and actions they need, eliminating prop drilling through `ChatOverlay`.
    *   They receive `data` (initial data for the overlay), `onAction`, and `onClose` props from `ChatOverlay`.
    *   They call `onAction` (e.g., `onAction('finalizeReservation', currentData)`) when the user performs an action within the overlay.
    *   They call `onClose` when the user cancels or closes the overlay.
    *   May manage their own internal form state.
    *   **Data Flow**: Receive `data`, `onAction`, `onClose` *from* `ChatOverlay`. Use hooks (`useRoomOptionsStore`, etc.) *directly* to access/modify shared state. Call `onAction` / `onClose` props.

## State Management (Zustand)

The chat system relies heavily on Zustand for global state management:

*   **`useChatStore` (`src/store/chatStore.js`)**: Manages core chat state: `messages`, `hiddenMessages`, `latestIntent`, `latestUserMessage`, and `overlay` state (`isVisible`, `type`, `data`). Provides actions like `addMessage`, `removeMessage`, `restoreMessage`, `showOverlay`, `closeOverlay`, etc.
*   **`useRoomOptionsStore` (`src/store/roomOptionsStore.js`)**: Manages state related to room selection and temporary configuration during reservation/management flows (e.g., in `ReservationDetails`). Tracks `selectedRooms` and provides actions like `addRoom`, `removeRoom`, `updateRoomPeriod`, `updateRoomPrice`, `reset`.
*   **`useCalendarStore` (`src/store/calendarStore.js`)**: Manages calendar view state, room availability data (`rooms`, `isRoomAvailable`), and default date selection (`defaultDates`, `setDefaultDates`).

## Key Interaction Flows (Updated)

1.  **Sending a Message/Command**:
    *   User types in `ChatInput`.
    *   User submits.
    *   `ChatInput` calls `onSendMessage` prop -> `handleChatMessage` action (imported).
    *   `handleChatMessage` adds user message to `useChatStore`, processes command (API calls, etc.), adds bot responses to `useChatStore`.
2.  **Displaying Reservation Overlay**:
    *   A message with `reservation` data is added to `useChatStore`.
    *   `ChatWindow` (getting state from `useChatWindowLogic`) renders `ChatMessage`.
    *   `ChatMessage` detects `reservation` data and calls `onShowDetails` prop.
    *   `ChatWindow` passes this call to the `onShowDetails` handler from `useChatWindowLogic`.
    *   `useChatWindowLogic.onShowDetails` calls `handleShowDetails` (utility function) with reservation data and message ID.
    *   `handleShowDetails`:
        *   Imports required actions/state directly from stores (`useChatStore`, `useRoomOptionsStore`, `useCalendarStore`).
        *   Calls `removeMessage(messageId)`.
        *   Prepares initial overlay data.
        *   Calls `resetRoomOptions()`.
        *   Sets up default dates/view period in `useCalendarStore` and adds rooms to `useRoomOptionsStore` based on reservation data.
        *   Calls `showOverlay('reservation', initialData)`.
    *   `ChatWindow` (via `useChatWindowLogic`) detects updated `overlay` state and renders `ChatOverlay`.
    *   `ChatOverlay` renders `ReservationDetails` with the `data`.
3.  **Handling Overlay Actions (e.g., Finalize Reservation)**:
    *   User interacts within `ReservationDetails` (which uses `useRoomOptionsStore` directly for room selection).
    *   User clicks "Finalize".
    *   `ReservationDetails` calls its `onFinalize` prop.
    *   This maps to `ChatOverlay` calling its `onAction('finalizeReservation', data)` prop.
    *   `ChatWindow` passes this to the `onOverlayAction` handler from `useChatWindowLogic`.
    *   `useChatWindowLogic.onOverlayAction` calls `handleOverlayAction('finalizeReservation', data)` (utility function).
    *   `handleOverlayAction`:
        *   Imports required actions/state directly from stores.
        *   Reads `selectedRooms` from `useRoomOptionsStore`.
        *   Makes API call (`createReservation`).
        *   Calls `addMessage` to confirm.
        *   Calls `closeOverlay` and `resetRoomOptions`.
4.  **Closing an Overlay (Cancel)**:
    *   User clicks "Cancel" in `ReservationDetails`.
    *   `ReservationDetails` calls its `onCancel` prop.
    *   This maps to `ChatOverlay` calling its `onClose` prop.
    *   `ChatWindow` passes this to the `handleCloseOverlay` handler from `useChatWindowLogic`.
    *   `useChatWindowLogic.handleCloseOverlay`:
        *   Calls `closeOverlay()`.
        *   Calls `resetRoomOptions()`.
        *   Handles message cleanup (`restoreMessage`/`removeMessage`) if needed based on `overlay.data.messageId`.

## Extending the Chat System

*   **Adding a New Command**: (No change in process)
    1.  Define in `constants/commands.js`.
    2.  Update `utils/chatSuggestions.js` if needed.
    3.  Implement handling in `actions/chatActions.js`.
*   **Adding a New Overlay Type**:
    1.  Define type constant in `ChatOverlay.OVERLAY_TYPES`.
    2.  Create the content component (e.g., `MyNewOverlay.jsx`). This component should use store hooks directly if needed.
    3.  Add `case` to `ChatOverlay.renderContent`.
    4.  Update triggering logic (e.g., in `overlayHandlers` or `chatActions`) to call `showOverlay` with the new type.
    5.  Define necessary action handling logic within `overlayHandlers.handleOverlayAction` for actions originating from the new overlay.
    6.  Ensure the `onAction` calls from the new overlay component pass the correct action string and data.
*   **Adding a New Message Type**: (No change in process)
    1.  Define type in `constants.js`.
    2.  Update `ChatMessage.jsx` rendering.
    3.  Ensure correct `addMessage` usage.
*   **Adding an Automation Source**: (No change in process)
    1.  Define type in `constants.js`.
    2.  Update icon/rendering in `AutomationMessage.jsx`.
    3.  Ensure backend sends correct type/data.

## Testing Considerations

*   **Unit Tests**: Test individual UI components (`ChatInput`, `ChatMessage`, `ChatOverlay` switcher logic) by mocking props. Test utility functions (`overlayHandlers`) by mocking store `getState` returns and API calls. Test the logic hook (`useChatWindowLogic`) using tools like `@testing-library/react-hooks` by mocking store interactions.
*   **Integration Tests**: Test `ChatWindow` rendering and basic interactions by providing a mocked `useChatWindowLogic`. Test full flows by rendering `ChatWindow` and mocking the actual stores and API responses expected by `useChatWindowLogic` and `overlayHandlers`.
*   **Mocking**: Zustand stores can be mocked. API calls should be mocked using libraries like `msw` or `jest.mock`. 