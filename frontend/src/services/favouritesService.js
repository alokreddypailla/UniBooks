/**
 * favouritesService.js — Favourites API calls.
 */
import api from './api'

export const favouritesService = {
  /** Get all favourites for the current user (with book details) */
  getFavourites: () => api.get('/favourites'),

  /** Check if a specific book is favourited */
  checkFavourite: (bookId) => api.get(`/favourites/check/${bookId}`),

  /** Add a book to favourites */
  addFavourite: (bookId) => api.post('/favourites', { book_id: bookId }),

  /** Remove a book from favourites */
  removeFavourite: (bookId) => api.delete(`/favourites/${bookId}`),
}
