/**
 * booksService.js — Book listing API calls.
 */
import api from './api'

export const booksService = {
  /** Browse books with optional search/filter/sort/pagination */
  getBooks: (params) => api.get('/books', { params }),

  /** Get a single book by ID */
  getBook: (id) => api.get(`/books/${id}`),

  /** Get the current user's listings */
  getMyListings: () => api.get('/books/my-listings'),

  /** Create a new book listing */
  createBook: (data) => api.post('/books', data),

  /** Update a book listing */
  updateBook: (id, data) => api.put(`/books/${id}`, data),

  /** Delete a book listing */
  deleteBook: (id) => api.delete(`/books/${id}`),

  /** Upload a book cover image — uses multipart/form-data */
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/books/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
