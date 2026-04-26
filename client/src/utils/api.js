import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Only redirect if NOT on login or register pages
//       const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

//       if (!isAuthPage) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );


// ==========================================
// API HELPER FUNCTIONS
// ==========================================

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmailToken = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};

export const resendOTP = async (data) => {
  const response = await api.post('/auth/resend-otp', data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const getMyCases = async () => {
  const response = await api.get('/fir/my-firs');
  return response.data;
};

export const getCaseById = async (id) => {
  const response = await api.get(`/fir/${id}`);
  return response.data;
};

export const fileComplaint = async (complaintData) => {
  const response = await api.post('/fir/', complaintData);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/user/profile', profileData);
  return response.data;
};

export const deleteFIR = async (id) => {
  const response = await api.delete(`/fir/${id}`);
  return response.data;
};

export const uploadEvidence = async (firId, file, fileType, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);
  formData.append('description', description);

  const response = await api.post(`/evidence/upload/${firId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getEvidenceByFir = async (firId) => {
  const response = await api.get(`/evidence/fir/${firId}`);
  return response.data;
};

export const getAllEvidence = async () => {
  const response = await api.get(`/evidence/all`);
  return response.data;
};

// ==========================================
// POLICE API FUNCTIONS
// ==========================================

export const getAllFirs = async (params = {}) => {
  const response = await api.get('/fir/', { params });
  return response.data;
};

export const getPoliceStats = async () => {
  const response = await api.get('/fir/stats');
  return response.data;
};

export const getForensicExperts = async () => {
  const response = await api.get('/user/forensic-experts');
  return response.data;
};

// ==========================================
// FORENSIC API FUNCTIONS
// ==========================================

export const assignForensic = async (firId, forensicId) => {
  const response = await api.patch(`/fir/${firId}/assign-forensic`, { forensicId });
  return response.data;
};

export const getMyAssignedForensicCases = async (params = {}) => {
  const response = await api.get('/fir/assigned-forensic/me', { params });
  return response.data;
};

export const getForensicStats = async () => {
  const response = await api.get('/evidence/stats/forensic');
  return response.data;
};

export const analyzeEvidence = async (evidenceId, notes = '') => {
  const response = await api.post(`/evidence/analyze/${evidenceId}`, { notes });
  return response.data;
};

export const updateFirStatus = async (id, status) => {
  const response = await api.patch(`/fir/${id}/status`, { status });
  return response.data;
};

export const getPoliceOfficers = async () => {
  const response = await api.get('/user/officers');
  return response.data;
};

export const assignOfficer = async (firId, officerId) => {
  const response = await api.patch(`/fir/${firId}/assign`, { officerId });
  return response.data;
};

export const getMyAssignedCases = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/fir/assigned/me?${query}`);
  return response.data;
};

// ==========================================
// ADMIN API FUNCTIONS
// ==========================================

export const getAdminStats = async () => {
  const response = await api.get('/fir/admin/stats');
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await api.get('/user/', { params });
  return response.data;
};

export const deleteUserAccount = async (id) => {
  const response = await api.delete(`/user/${id}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export default api;

