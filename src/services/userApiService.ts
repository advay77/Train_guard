// API service for user profile and password update
import axios from 'axios';

const API_BASE = '/api';

export async function updateUserProfile(data: { name: string; email: string; phone: string }) {
  const res = await axios.put(`${API_BASE}/users/me`, data, { withCredentials: true });
  return res.data;
}

export async function changeUserPassword(data: { currentPassword: string; newPassword: string }) {
  const res = await axios.post(`${API_BASE}/auth/change-password`, data, { withCredentials: true });
  return res.data;
}
