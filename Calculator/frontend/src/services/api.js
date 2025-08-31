import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_BASE });

export const fetchHistory = (limit = 20) => api.get(`/calculations?limit=${limit}`);
export const postCalculation = (expression) => api.post('/calculations', { expression });
export const clearHistory = () => api.delete('/calculations');