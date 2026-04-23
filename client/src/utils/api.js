import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

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

export default api;
