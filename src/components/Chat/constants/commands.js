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
  // Comenzi de navigare/deschidere module
  "calendar",
  "pos",
  "facturi",
  "stocuri",
  "rapoarte",
  
  // Comenzi pentru gestionarea rezervărilor
  "rezervare [tip camera] [nume] [data] [preferinte]",
  "modifica [nr camera] [data]",
  
  // Comenzi pentru gestionarea camerelor
  "adauga camera [numar] [tip]",
  "modifica camera [numar]",
  "telefon [nr camera] [data]",
  
  // Comenzi pentru vânzări și produse
  "vinde [cantitate] [produs]",
  "adauga produs [nume] [pret] [categorie]",
  
  // Comenzi diverse
  "raport [tip] [perioada]",
  "ajutor"
];

/**
 * Command categories for better organization
 * @type {Object}
 */
export const COMMAND_CATEGORIES = {
  NAVIGATION: "Navigare",
  RESERVATION: "Rezervări",
  ROOM: "Camere",
  SALES: "Vânzări & Produse",
  REPORT: "Rapoarte",
  HELP: "Ajutor"
};

/**
 * Structured commands with additional metadata
 * @type {Array<{command: string, category: string, description: string, example?: string}>}
 */
export const STRUCTURED_COMMANDS = [
  // Comenzi de navigare
  {
    command: "calendar",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide vizualizarea calendarului de rezervări",
    example: "calendar"
  },
  {
    command: "pos",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide sistemul Point of Sale",
    example: "pos"
  },
  {
    command: "facturi",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide lista de facturi",
    example: "facturi"
  },
  {
    command: "stocuri",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide vizualizarea stocurilor",
    example: "stocuri"
  },
  {
    command: "rapoarte",
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: "Deschide secțiunea de rapoarte",
    example: "rapoarte"
  },
  
  // Comenzi pentru rezervări
  {
    command: "rezervare [tip camera] [nume] [data] [preferinte]",
    category: COMMAND_CATEGORIES.RESERVATION,
    description: "Creează o rezervare nouă cu detaliile specificate",
    example: "rezervare dublă Popescu Ion 15.06.2023 mic dejun inclus"
  },
  {
    command: "modifica [nr camera] [data]",
    category: COMMAND_CATEGORIES.RESERVATION,
    description: "Modifică o rezervare existentă",
    example: "modifica 101 15.06.2023"
  },
  
  // Comenzi pentru gestionarea camerelor
  {
    command: "adauga camera [numar] [tip]",
    category: COMMAND_CATEGORIES.ROOM,
    description: "Adaugă o cameră nouă în sistem",
    example: "adauga camera 204 dublă"
  },
  {
    command: "modifica camera [numar]",
    category: COMMAND_CATEGORIES.ROOM,
    description: "Modifică detaliile unei camere existente",
    example: "modifica camera 101"
  },
  {
    command: "telefon [nr camera] [data]",
    category: COMMAND_CATEGORIES.ROOM,
    description: "Înregistrează un apel telefonic pentru o cameră",
    example: "telefon 101 acum"
  },
  
  // Comenzi pentru vânzări
  {
    command: "vinde [cantitate] [produs]",
    category: COMMAND_CATEGORIES.SALES,
    description: "Înregistrează o vânzare de produse",
    example: "vinde 2 sticle apă"
  },
  {
    command: "adauga produs [nume] [pret] [categorie]",
    category: COMMAND_CATEGORIES.SALES,
    description: "Adaugă un produs nou în inventar",
    example: "adauga produs suc portocale 7.5 băuturi"
  },
  
  // Comenzi diverse
  {
    command: "raport [tip] [perioada]",
    category: COMMAND_CATEGORIES.REPORT,
    description: "Generează un raport cu tipul și perioada specificate",
    example: "raport vânzări luna curentă"
  },
  {
    command: "ajutor",
    category: COMMAND_CATEGORIES.HELP,
    description: "Afișează lista de comenzi disponibile",
    example: "ajutor"
  }
]; 