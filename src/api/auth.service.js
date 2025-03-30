import { API_BASE_URL, getAuthHeaders } from './index';

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

export const gmailLogin = async (gmailData) => {
  const response = await fetch(`${API_BASE_URL}/auth/gmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gmailData)
  });
  return response.json();
};

export const registerPasskey = async (passkeyData) => {
  const response = await fetch(`${API_BASE_URL}/auth/passkey/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passkeyData)
  });
  return response.json();
};

export const loginWithPasskey = async (passkeyData) => {
  const response = await fetch(`${API_BASE_URL}/auth/passkey/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passkeyData)
  });
  return response.json();
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`);
  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const resetPassword = async (resetData) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resetData)
  });
  return response.json();
}; 