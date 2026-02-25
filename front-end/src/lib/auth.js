// src/lib/auth.js
import { api } from './apiClient';

export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register({ fullName, email, password }) {
  const res = await api.post('/auth/register', { fullName, email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.user;
}
