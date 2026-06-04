/**
 * authService.js — Authentication API calls.
 */
import api from './api'

export const authService = {
  /** Register a new user account */
  register: (data) => api.post('/auth/register', data),

  /** Login with email and password */
  login: (data) => api.post('/auth/login', data),

  /** Get the currently authenticated user */
  getMe: () => api.get('/auth/me'),
}
