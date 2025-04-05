/**
 * Store Index
 * 
 * This file serves as the central export point for all store modules in the application.
 * It provides a single import point for components to access any store they need.
 * 
 * Store Modules:
 * - bookingStore: Manages booking-related state and actions
 * - receptionStore: Handles reception desk operations and state
 * - chatStore: Manages chat functionality and messages
 * - automationStore: Controls automated processes and rules
 * - calendarStore: Handles calendar and scheduling state
 * - roomOptionsStore: Manages room configurations and options
 * - assistantStore: Controls AI assistant interactions
 * - navigationStore: Manages navigation and routing state
 * - useMiddlewareStore: Central middleware for action handling and UI state
 */

import bookingStore from './bookingStore';
import receptionStore from './receptionStore';
import chatStore from './chatStore';
import automationStore from './automationStore';
import calendarStore from './calendarStore';
import roomOptionsStore from './roomOptionsStore';
import assistantStore from './assistantStore';
import navigationStore from './navigationStore';
import useMiddlewareStore from './middleware';

// Export all store modules for use throughout the application
export {
    bookingStore,
    receptionStore,
    chatStore,
    automationStore,
    calendarStore,
    roomOptionsStore,
    assistantStore,
    navigationStore,
    useMiddlewareStore
}; 