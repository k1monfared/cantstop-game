// API configuration
// In production (Render), VITE_API_URL will be set to the backend service URL
// In development, it will use the Vite proxy to localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';
