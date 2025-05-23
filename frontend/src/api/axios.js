import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URI || 'http://localhost:5000',
  withCredentials: true, // Enable cookies for all requests
});

export default api;