import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const fetchNotifications = async (page = 1, limit = 20) => {
  const res = await axios.get(`${API_BASE}/notifications?page=${page}&limit=${limit}`, authHeaders());
  return res.data;
};

export const fetchUnreadCount = async () => {
  const res = await axios.get(`${API_BASE}/notifications/unread-count`, authHeaders());
  return res.data.count;
};

export const markNotificationRead = async (id) => {
  const res = await axios.patch(`${API_BASE}/notifications/${id}/read`, {}, authHeaders());
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.patch(`${API_BASE}/notifications/read-all`, {}, authHeaders());
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axios.delete(`${API_BASE}/notifications/${id}`, authHeaders());
  return res.data;
};
