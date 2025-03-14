# Chat Components

This directory contains components related to the chat functionality of the hotel management system.

## Component Structure

- `ChatWindow`: Main container component that orchestrates the chat experience
- `ChatMessage`: Renders individual chat messages with different styling based on types
- `ChatInput`: Handles user input with command suggestions
- `ChatOverlay`: Displays various overlay UI based on chat interactions (reservations, notifications, etc.)

## Usage

Import the components from the index file:

```jsx
import { ChatWindow, ChatInput, ChatMessage, ChatOverlay } from '../components/Chat';
```

The primary entry point is the `ChatWindow` component, which manages the entire chat interface:

```jsx
<ChatWindow />
```

## State Management

These components interact with several global stores:
- `useChatStore`: Manages chat messages and history
- `useRoomOptionsStore`: Handles room selection and configurations
- `useCalendarStore`: Manages calendar state and availability

## Command System

The chat system responds to specific text commands like:
- "deschide calendarul"
- "deschide pos-ul"
- "deschide facturile"
- "deschide stocurile"

These commands can be extended in the `commandsList` array in ChatWindow. 