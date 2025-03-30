import { API_BASE_URL, getAuthHeaders } from './index';

export const getAllRoomStatuses = async (token) => {
  const response = await fetch(`${API_BASE_URL}/room-status`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};

export const getRoomStatus = async (roomNumber, token) => {
  const response = await fetch(`${API_BASE_URL}/room-status/${roomNumber}`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};

export const createRoomStatus = async (statusData, token) => {
  const response = await fetch(`${API_BASE_URL}/room-status`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(statusData)
  });
  return response.json();
};

export const updateRoomStatus = async (roomNumber, statusData, token) => {
  const response = await fetch(`${API_BASE_URL}/room-status/${roomNumber}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(statusData)
  });
  return response.json();
};

export const deleteRoomStatus = async (roomNumber, token) => {
  const response = await fetch(`${API_BASE_URL}/room-status/${roomNumber}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  return response.json();
}; 