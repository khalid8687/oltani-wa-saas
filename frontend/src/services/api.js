import { io } from 'socket.io-client';
import { auth, getIdToken } from './firebase.js';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const SOCKET_BASE = import.meta.env.VITE_SOCKET_BASE || (typeof window !== 'undefined' ? window.location.origin : '');

/** Append Firebase ID token to every request. */
async function authHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (auth.currentUser) {
    try {
      // getIdToken returns cached token; auto-refreshes ~5min before expiry.
      headers.Authorization = `Bearer ${await getIdToken(auth.currentUser)}`;
    } catch (err) {
      console.warn('[api] failed to get ID token:', err.message);
    }
  }
  return headers;
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: await authHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const data = text ? safeJson(text) : {};
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.code = data?.code;
    err.payload = data;
    throw err;
  }
  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch (_) { return { raw: text }; }
}

export const api = {
  get:    (p)    => request('GET',    p),
  post:   (p, b) => request('POST',   p, b),
  put:    (p, b) => request('PUT',    p, b),
  del:    (p)    => request('DELETE', p)
};

export const authApi = {
  sync: () => api.post('/auth/sync')
};

export const instanceApi = {
  list:         ()            => api.get('/instances/me'),
  save:         (data)        => api.post('/instances/save', data),
  start:        (id)          => api.post(`/instances/${id}/start`),
  stop:         (id)          => api.post(`/instances/${id}/stop`),
  remove:       (id)          => api.del(`/instances/${id}`)
};

export const adminApi = {
  stats:           ()          => api.get('/admin/stats'),
  users:           ()          => api.get('/admin/users'),
  updateUser:      (data)      => api.post('/admin/users/update', data),
  blockUser:       (uid)       => api.del(`/admin/users/${uid}`),
  geminiStats:     ()          => api.get('/admin/gemini/stats'),
  geminiConfig:    (data)      => api.post('/admin/gemini/config', data),
  garden:          ()          => api.get('/admin/garden')
};

let socket = null;
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_BASE, {
      transports: ['websocket', 'polling'],
      autoConnect: false
    });
    socket.on('connect_error', (err) => {
      if (typeof window !== 'undefined' && err.message?.includes('auth')) {
        console.warn('[OLTANI] Socket auth rejected — re-login needed.');
      }
    });
  }
  return socket;
}

export async function connectSocket() {
  const s = getSocket();
  if (s.connected) return s;
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser);
      s.auth = { token };
    } catch (_) { /* anonymous fallthrough */ }
  }
  return new Promise((resolve, reject) => {
    const onConnect = () => { s.off('connect_error', onError); resolve(s); };
    const onError = (err) => { s.off('connect', onConnect); reject(err); };
    s.once('connect', onConnect);
    s.once('connect_error', onError);
    s.connect();
    setTimeout(() => {
      s.off('connect', onConnect);
      s.off('connect_error', onError);
      if (s.connected) resolve(s); else reject(new Error('Socket timeout'));
    }, 8000);
  });
}

export { API_BASE };
