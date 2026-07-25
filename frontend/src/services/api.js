import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL
});

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const instanceApi = {
  getUserInstances: (userId) => api.get(`/instances/user/${userId}`),
  getInstance: (id) => api.get(`/instances/${id}`),
  saveInstance: (data) => api.post('/instances/save', data),
  startInstance: (id, config) => api.post(`/instances/${id}/start`, config),
  stopInstance: (id) => api.post(`/instances/${id}/stop`),
  deleteInstance: (id) => api.delete(`/instances/${id}`)
};

export const adminApi = {
  getUsers: (adminEmail) =>
    api.get('/admin/users', { headers: { 'x-admin-email': adminEmail } }),
  updateUser: (data, adminEmail) =>
    api.post('/admin/users/update', data, { headers: { 'x-admin-email': adminEmail } }),
  getGeminiStats: (adminEmail) =>
    api.get('/admin/gemini/stats', { headers: { 'x-admin-email': adminEmail } }),
  updateGeminiConfig: (data, adminEmail) =>
    api.post('/admin/gemini/config', data, { headers: { 'x-admin-email': adminEmail } }),
  getAdminGarden: (adminEmail) =>
    api.get('/admin/admin-garden', { headers: { 'x-admin-email': adminEmail } })
};
