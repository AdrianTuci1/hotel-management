import { create } from 'zustand';

// Definim tipurile de asistenți disponibili
export const AssistantTypes = {
  RESERVATION: 'reservation',
  REPORTING: 'reporting',
};

// Definim capacitățile asistenților
export const AssistantCapabilities = {
  CHAT: 'chat',
  DATA_ANALYSIS: 'data_analysis',
  AUTOMATION: 'automation',
  REPORTING: 'reporting',
};

const initialState = {
  assistants: {
    reservation: {
      id: 'reservation',
      type: AssistantTypes.RESERVATION,
      isActive: true,
      config: {
        platforms: ['whatsapp', 'email', 'booking'],
        connectedPlatforms: [], // Platforme conectate
        platformCredentials: {}, // Credențiale pentru fiecare platformă
        autoConfirm: false,
        priceRange: { min: 0, max: 1000 },
        responseTemplates: {
          confirmation: 'Vă mulțumim pentru rezervare! Confirmăm perioada {dates} pentru {guests} persoane.',
          inquiry: 'Pentru perioada {dates}, avem disponibilitate. Prețul este de {price} RON pe noapte.',
          unavailable: 'Ne pare rău, nu avem disponibilitate pentru perioada solicitată.',
        },
      },
      metrics: {
        reservationsToday: 0,
        averageResponseTime: 0,
        totalReservations: 0,
        successRate: 0,
      }
    },
    reporting: {
      id: 'reporting',
      type: AssistantTypes.REPORTING,
      isActive: true,
      config: {
        metrics: ['occupancy', 'revenue', 'satisfaction'],
        schedule: 'daily',
        priceAdjustment: {
          enabled: true,
          maxChange: 20, // procente
          factors: ['season', 'occupancy', 'demand'],
        },
        alerts: {
          occupancy: { threshold: 80, enabled: true },
          revenue: { threshold: 5000, enabled: true },
        },
      },
      metrics: {
        currentOccupancy: 0,
        priceAdjustments: 0,
        revenueIncrease: 0,
        alertsSent: 0,
      }
    },
  },
  activeConversation: null,
  conversations: {},
};

export const useAssistantStore = create((set, get) => ({
  ...initialState,

  // Adăugare asistent nou
  addAssistant: (assistant) => {
    set(state => ({
      assistants: {
        ...state.assistants,
        [assistant.type]: {
          ...assistant,
          isActive: true,
        },
      },
    }));
  },

  // Activare/dezactivare asistent
  toggleAssistant: (assistantId) => {
    set(state => ({
      assistants: {
        ...state.assistants,
        [assistantId]: {
          ...state.assistants[assistantId],
          isActive: !state.assistants[assistantId].isActive,
        },
      },
    }));
  },

  // Actualizare configurație asistent
  updateAssistantConfig: (assistantId, config) => {
    set(state => ({
      assistants: {
        ...state.assistants,
        [assistantId]: {
          ...state.assistants[assistantId],
          config: {
            ...state.assistants[assistantId].config,
            ...config,
          },
        },
      },
    }));
  },

  // Ștergere asistent
  deleteAssistant: (assistantId) => {
    set(state => ({
      assistants: {
        ...state.assistants,
        [assistantId]: {
          ...state.assistants[assistantId],
          isActive: false,
        },
      },
    }));
  },

  // Inițiere conversație cu asistent
  startConversation: (assistantId) => {
    const conversation = {
      id: Date.now().toString(),
      assistantId,
      messages: [],
      startedAt: new Date().toISOString(),
      isActive: true,
    };

    set(state => ({
      activeConversation: conversation.id,
      conversations: {
        ...state.conversations,
        [conversation.id]: conversation,
      },
    }));

    return conversation.id;
  },

  // Adăugare mesaj în conversație
  addMessage: (conversationId, message) => {
    set(state => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          messages: [
            ...state.conversations[conversationId].messages,
            {
              id: Date.now().toString(),
              ...message,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      },
    }));
  },

  // Execuție comandă asistent
  executeAssistantCommand: async (assistantId, command, params) => {
    const assistant = get().assistants[assistantId];
    if (!assistant || !assistant.isActive) return;

    try {
      // Logica de execuție a comenzilor va fi implementată aici
      // Va gestiona diferite tipuri de comenzi în funcție de capacitățile asistentului
    } catch (error) {
      console.error('Error executing assistant command:', error);
    }
  },

  // Conectare platformă
  connectPlatform: async (assistantId, platform, credentials) => {
    try {
      // Aici vom implementa logica de conectare specifică fiecărei platforme
      const connection = await connectToPlatform(platform, credentials);
      
      set(state => ({
        assistants: {
          ...state.assistants,
          [assistantId]: {
            ...state.assistants[assistantId],
            config: {
              ...state.assistants[assistantId].config,
              connectedPlatforms: [
                ...state.assistants[assistantId].config.connectedPlatforms,
                platform
              ],
              platformCredentials: {
                ...state.assistants[assistantId].config.platformCredentials,
                [platform]: credentials
              }
            },
          },
        },
      }));

      return connection;
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error);
      throw error;
    }
  },

  // Deconectare platformă
  disconnectPlatform: async (assistantId, platform) => {
    try {
      // Aici vom implementa logica de deconectare
      await disconnectFromPlatform(platform);
      
      set(state => ({
        assistants: {
          ...state.assistants,
          [assistantId]: {
            ...state.assistants[assistantId],
            config: {
              ...state.assistants[assistantId].config,
              connectedPlatforms: state.assistants[assistantId].config.connectedPlatforms
                .filter(p => p !== platform),
              platformCredentials: {
                ...state.assistants[assistantId].config.platformCredentials,
                [platform]: undefined
              }
            },
          },
        },
      }));
    } catch (error) {
      console.error(`Failed to disconnect from ${platform}:`, error);
      throw error;
    }
  },

  // Actualizare metrici
  updateMetrics: (assistantId, metrics) => {
    set(state => ({
      assistants: {
        ...state.assistants,
        [assistantId]: {
          ...state.assistants[assistantId],
          metrics: {
            ...state.assistants[assistantId].metrics,
            ...metrics,
          },
        },
      },
    }));
  },
}));

// Funcții helper pentru conectarea la platforme
const connectToPlatform = async (platform, credentials) => {
  switch (platform) {
    case 'whatsapp':
      // Implementare conectare WhatsApp
      return await connectWhatsApp(credentials);
    case 'email':
      // Implementare conectare Email
      return await connectEmail(credentials);
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
};

const disconnectFromPlatform = async (platform) => {
  switch (platform) {
    case 'whatsapp':
      // Implementare deconectare WhatsApp
      return await disconnectWhatsApp();
    case 'email':
      // Implementare deconectare Email
      return await disconnectEmail();
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
};

// Funcții mock pentru conectare (vor fi înlocuite cu implementări reale)
const connectWhatsApp = async (credentials) => {
  // Simulăm o conectare
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

const connectEmail = async (credentials) => {
  // Simulăm o conectare
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

const disconnectWhatsApp = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

const disconnectEmail = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}; 