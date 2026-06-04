/**
 * MyListingsPage.jsx — View, edit, and delete the current user's book listings.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksService } from '../services/booksService'
import { formatPrice, getConditionBadgeClass, getSubjectColor, formatRelativeTime, getErrorMessage } from '../utils/helpers'

export default function MyListingsPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // book to confirm deletion

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const res = await booksService.getMyListings()
        setBooks(res.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [])

  const handleDelete = async (bookId) => {
    setDeletingId(bookId)
    try {
      await booksService.deleteBook(bookId)
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
      setConfirmDelete(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  )

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>My Listings</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {books.length} book{books.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/post')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post New Book
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--color-error)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {books.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '56px' }}>📖</span>
          <h3>No listings yet</h3>
          <p>You haven't posted any books for sale. Start by listing your first textbook!</p>
          <button className="btn btn-primary" onClick={() => navigate('/post')}>Post Your First Book</button>
        </div>
      )}

      {books.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {books.map((book) => {
            const subjectColor = getSubjectColor(book.subject)
            return (
              <div key={book.id} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', gap: '0', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s ease' }}>
                {/* Book Thumbnail */}
                <div
                  onClick={() => navigate(`/books/${book.id}`)}
                  style={{ width: '80px', flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
                >
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '100px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', minHeight: '100px', background: `linear-gradient(135deg, ${subjectColor.bg}, ${subjectColor.bg}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                      {subjectColor.icon}
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{book.subject}</span>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>{book.author}</p>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>{formatPrice(book.price)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${getConditionBadgeClass(book.condition)}`}>{book.condition}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Listed {formatRelativeTime(book.created_at)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/books/${book.id}`)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDelete(book)}
                      disabled={deletingId === book.id}
                    >
                      {deletingId === book.id ? (
                        <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-xl)' }} className="animate-pop-in">
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Delete Listing?</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
              Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, background: 'var(--color-error)', color: 'white', borderColor: 'var(--color-error)' }} onClick={() => handleDelete(confirmDelete.id)} disabled={deletingId === confirmDelete.id}>
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
