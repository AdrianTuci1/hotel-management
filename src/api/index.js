export * from './auth.service';
export * from './room.service';
export * from './room-status.service';
export * from './reservation.service';

// API base URL
export const API_BASE_URL = 'http://localhost:3000/api';

// Common headers helper
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}); 