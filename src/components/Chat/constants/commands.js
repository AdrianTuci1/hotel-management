/**
 * Chat Commands Configuration
 * 
 * This file contains all supported chat commands in the application.
 * Commands can be extended here and will be automatically available in the chat interface.
 */

/**
 * List of supported chat commands
 * @type {string[]}
 */
export const CHAT_COMMANDS = [
  "deschide calendarul",
  "deschide pos-ul",
  "deschide facturile",
  "deschide stocurile",
  // Add more commands here as needed
];

/**
 * Command categories for better organization
 * @type {Object}
 */
export const COMMAND_CATEGORIES = {
  NAVIGATION: "navigation",
  RESERVATION: "reservation",
  INVOICE: "invoice",
  INVENTORY: "inventory",
};

/**
 * Structured commands with additional metadata
 * @type {Array<{command: string, category: string, description: string}>}
 */
export const STRUCTURED_COMMANDS = [
  {
    command: "deschide calendarul",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide vizualizarea calendarului de rezervări"
  },
  {
    command: "deschide pos-ul",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide sistemul Point of Sale"
  },
  {
    command: "deschide facturile",
    category: COMMAND_CATEGORIES.INVOICE,
    description: "Deschide lista de facturi"
  },
  {
    command: "deschide stocurile",
    category: COMMAND_CATEGORIES.INVENTORY,
    description: "Deschide vizualizarea stocurilor"
  },
  // Add more structured commands here
]; 