import { API_BASE_URL, getAuthHeaders } from './index';

export const createReservation = async (reservationData, token) => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(reservationData)
  });
  return response.json();
};

export const updateReservation = async (id, reservationData, token) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(reservationData)
  });
  return response.json();
};

export const deleteReservation = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  return response.json();
}; 