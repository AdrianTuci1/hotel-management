/**
 * Chat Component Types
 * 
 * This file defines common types used across chat components.
 * These type definitions help with documenting the expected shapes
 * of objects used throughout the chat interface.
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} text - Message text content
 * @property {('user'|'bot'|'notification'|'analysis')} type - Message type
 * @property {Object} [reservation] - Optional reservation data
 * @property {Object} [link] - Optional link data
 * @property {string} [aiResponse] - Optional AI response suggestion
 */

/**
 * @typedef {Object} ChatLink
 * @property {string} url - URL to navigate to
 * @property {string} [text] - Optional display text
 */

/**
 * @typedef {Object} ChatReservation
 * @property {string|number} id - Unique identifier
 * @property {string} [fullName] - Guest's full name
 * @property {string} [guestName] - Alternative property for guest name
 * @property {string} [phone] - Contact phone
 * @property {string} [email] - Contact email
 * @property {string} [notes] - Reservation notes
 * @property {boolean} [isPaid] - Payment status
 * @property {boolean} [hasInvoice] - Invoice status
 * @property {boolean} [hasReceipt] - Receipt status
 * @property {Array<ChatReservationRoom>} [rooms] - Rooms in this reservation
 */

/**
 * @typedef {Object} ChatReservationRoom
 * @property {string|number} roomNumber - Room identifier
 * @property {string} startDate - Reservation start date
 * @property {string} endDate - Reservation end date
 * @property {number} [price] - Room price
 * @property {number} [basePrice] - Base room price
 * @property {string} [type] - Room type
 */

/**
 * @typedef {Object} ChatOverlayState
 * @property {boolean} isVisible - Whether overlay is currently visible
 * @property {string|null} type - Type of overlay content
 * @property {Object|null} data - Data for the overlay
 */

/**
 * @typedef {Object} ChatCommand
 * @property {string} command - The command text
 * @property {string} category - Category this command belongs to
 * @property {string} description - Description of what the command does
 */

// Export these types for use with JSDoc
export default {}; 