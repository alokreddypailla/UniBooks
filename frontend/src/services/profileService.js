/**
 * profileService.js — Profile management API calls.
 */
import api from './api'

export const profileService = {
  /** Get current user's profile with stats */
  getProfile: () => api.get('/profile'),

  /** Update profile information */
  updateProfile: (data) => api.put('/profile', data),

  /** Change password */
  changePassword: (data) => api.put('/profile/password', data),
}
