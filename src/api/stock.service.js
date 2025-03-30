import { API_BASE_URL, getAuthHeaders } from './index';

export const getAllStock = async (token) => {
  const response = await fetch(`${API_BASE_URL}/stock`, {
    headers: getAuthHeaders(token)
  });
  return response.json();
};

export const createStockItem = async (stockData, token) => {
  const response = await fetch(`${API_BASE_URL}/stock`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(stockData)
  });
  return response.json();
};

export const updateStockItem = async (id, stockData, token) => {
  const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(stockData)
  });
  return response.json();
};

export const deleteStockItem = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  return response.json();
}; 