import { API_BASE_URL, getAuthHeaders } from './index';

export const getAllRooms = async (token) => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};

export const createRoom = async (roomData, token) => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(roomData)
  });
  return response.json();
};

export const updateRoom = async (roomNumber, roomData, token) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(roomData)
  });
  return response.json();
};

export const deleteRoom = async (roomNumber, token) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  return response.json();
}; 