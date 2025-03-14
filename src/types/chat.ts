export type MessageType = 'user' | 'bot' | 'notification' | 'analysis';

export interface ChatMessage {
  type: MessageType;
  text: string;
  reservation?: ReservationData;
  link?: {
    url: string;
    text: string;
  };
  aiResponse?: string;
  options?: string[];
}

export interface ReservationData {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  isPaid?: boolean;
  hasInvoice?: boolean;
  hasReceipt?: boolean;
  rooms: RoomReservation[];
}

export interface RoomReservation {
  roomNumber: string;
  startDate: string;
  endDate: string;
  price: number;
  type: string;
  status: ReservationStatus;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface OutgoingMessage {
  type: string;
  payload: any;
}

export interface IncomingMessage {
  type: string;
  payload: any;
}

export interface ChatResponse {
  text: string;
  type: MessageType;
  reservation?: ReservationData;
  options?: string[];
}

export interface ReservationsUpdate {
  reservations: ReservationData[];
}

export interface RoomsUpdate {
  rooms: Room[];
}

export interface Room {
  number: string;
  type: string;
  basePrice: number;
  status: RoomStatus;
  features?: string[];
}

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'; 