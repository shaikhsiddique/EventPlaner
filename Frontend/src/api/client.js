import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Convenience wrappers for backend routes
export const AuthApi = {
  studentLogin: (data) => api.post('/api/auth/student/login', data),
  studentSignup: (data) => api.post('/api/auth/student/signup', data),
  adminLogin: (data) => api.post('/api/auth/admin/login', data),
  adminSignup: (data) => api.post('/api/auth/admin/signup', data),
  logout: () => api.post('/api/auth/logout'),
};

export const EventApi = {
  list: () => api.get('/api/events'),
  get: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  remove: (id) => api.delete(`/api/events/${id}`),
};

export const RegistrationApi = {
  registerForEvent: (eventId, data) =>
    api.post(`/api/registrations/${eventId}/register`, data),
  getStudentsForEvent: (eventId) =>
    api.get(`/api/registrations/${eventId}/students`),
  updateStudentForEvent: (eventId, studentId, data) =>
    api.put(`/api/registrations/${eventId}/students/${studentId}`, data),
  deleteStudentForEvent: (eventId, studentId) =>
    api.delete(`/api/registrations/${eventId}/students/${studentId}`),
};


