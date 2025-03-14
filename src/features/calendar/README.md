# CalendarView Component Documentation

## Overview
`CalendarView` is a complex React component that implements a hotel room reservation calendar system. It provides an interactive interface for viewing and managing room reservations across multiple dates.

## Dependencies

### State Management
- `useCalendarStore` - Manages calendar-related state (rooms, reservations, dates)
- `useRoomOptionsStore` - Handles room selection and highlighting
- `useChatStore` - Manages chat interactions for reservation details

### Components
1. **DateSelector**
   - Purpose: Handles date range selection for the calendar view
   - Props: `startDate`, `endDate`, `setDateRange`

2. **CalendarTable**
   - Purpose: Main calendar grid display
   - Props: 
     - `rooms` - List of available rooms
     - `days` - Array of dates to display
     - `highlightedRoom` - Currently highlighted room
     - `isInSelectedPeriod` - Function to check date selection
     - `getRoomStatus` - Function to get room availability status
     - `handleCellClick` - Click handler for cells
     - Drag-related props for scrolling functionality

### Custom Hooks
- **useDragScroll**
  - Purpose: Implements horizontal scrolling functionality
  - Returns:
    - `isDragging` - Current drag state
    - `tableWrapperRef` - Ref for scroll container
    - `handleMouseDown` - Mouse down event handler
    - `handleMouseMove` - Mouse move event handler
    - `dragStartTimeRef` - Reference to drag start time

### Utility Functions
From `dateUtils.js`:
- `generateDatesArray` - Creates an array of dates between start and end dates
- `isDateRangeOverlapping` - Checks if two date ranges overlap
- `isDateInRange` - Verifies if a date falls within a range

## Key Features

### 1. Reservation Management
- Displays room reservations in a grid format
- Handles reservation conflicts
- Shows reservation details on cell click

### 2. Interactive Features
- Drag-to-scroll functionality
- Room highlighting
- Date range selection
- Reservation detail viewing through chat interface

### 3. Status Tracking
- Monitors room availability
- Tracks reservation status (booked, free)
- Highlights selected periods

## Main Functions

### `handleCellClick(roomNumber, date)`
- Handles cell clicks in the calendar
- Checks for drag operations to prevent unwanted clicks
- Displays reservation details in chat when clicking on a booked room

### `isInSelectedPeriod(date, roomNumber)`
- Determines if a specific date is within the selected period for a room
- Considers both selected rooms and existing reservations
- Uses default dates when available

### `isRoomAvailable(roomNumber, startDate, endDate)`
- Checks room availability for a given period
- Prevents double bookings
- Considers existing reservations

### `getRoomStatus(roomNumber, date)`
- Returns the status of a room for a specific date
- Possible statuses: "booked", "free"
- Used for visual representation in the calendar

## State Management

### Calendar Store Integration
- Manages rooms and reservations data
- Handles date range selection
- Provides room availability checking

### Room Options Store Integration
- Manages room highlighting
- Handles selected rooms state

### Chat Store Integration
- Displays reservation details
- Provides interactive options for room management

## Logging and Debugging
- Includes comprehensive logging for reservation updates
- Tracks calendar initialization
- Groups related logs for better debugging

## CSS Styling
- Uses CSS modules for scoped styling
- Main styles defined in `CalendarView.module.css`

## Performance Considerations
- Implements drag detection timing (200ms threshold)
- Uses effect hooks for initialization and updates
- Maintains separate concerns through component composition

## Project Structure
```
src/features/calendar/
├── components/
│   ├── CalendarTable.jsx
│   ├── RoomRow.jsx
│   ├── DayCell.jsx
│   └── DateSelector.jsx
├── hooks/
│   └── useDragScroll.js
├── utils/
│   └── dateUtils.js
├── CalendarView.jsx
└── CalendarView.module.css
```

## Contributing
When contributing to this component:
1. Ensure all new features maintain the existing logging structure
2. Add appropriate error handling for new functionality
3. Follow the established component structure
4. Update this documentation as needed

## Usage Example
```jsx
import CalendarView from './features/calendar/CalendarView';

function App() {
  return (
    <div className="app">
      <CalendarView />
    </div>
  );
}
```

This documentation provides a comprehensive overview of the CalendarView component and its ecosystem. The component is well-structured and follows React best practices, with clear separation of concerns and modular architecture. 