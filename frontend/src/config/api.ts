export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  auth: {
    signup: `${API_URL}/api/auth/signup`,
    signin: `${API_URL}/api/auth/signin`,
  },
  events: `${API_URL}/api/events`,
};
