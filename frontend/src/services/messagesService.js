/**
 * messagesService.js — Messaging API calls.
 */
import api from './api'

export const messagesService = {
  /** Get all conversations for the current user */
  getConversations: () => api.get('/messages/conversations'),

  /** Get messages in a specific conversation */
  getConversation: (bookId, otherUserId) =>
    api.get(`/messages/${bookId}/${otherUserId}`),

  /** Send a new message */
  sendMessage: (data) => api.post('/messages', data),
}
