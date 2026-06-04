/**
 * FavouritesPage.jsx — View and manage saved/favourite books.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { favouritesService } from '../services/favouritesService'
import { formatPrice, getConditionBadgeClass, getSubjectColor, getErrorMessage } from '../utils/helpers'

export default function FavouritesPage() {
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    const fetchFavourites = async () => {
      setIsLoading(true)
      try {
        const res = await favouritesService.getFavourites()
        setFavourites(res.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchFavourites()
  }, [])

  const handleRemove = async (bookId) => {
    setRemovingId(bookId)
    try {
      await favouritesService.removeFavourite(bookId)
      setFavourites((prev) => prev.filter((f) => f.book_id !== bookId && f.id !== bookId))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  )

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Saved Books</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {favourites.length} book{favourites.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--color-error)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {favourites.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '56px' }}>❤️</span>
          <h3>No saved books yet</h3>
          <p>Browse books and tap the heart icon to save them here for easy access later.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Books</button>
        </div>
      )}

      {favourites.length > 0 && (
        <div className="book-grid animate-fade-in">
          {favourites.map((fav) => {
            // API returns either the book directly or nested under fav.book
            const book = fav.book || fav
            const bookId = fav.book_id || book.id
            const subjectColor = getSubjectColor(book.subject)

            return (
              <div key={fav.id || bookId} style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Remove Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(bookId) }}
                  disabled={removingId === bookId}
                  style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s ease' }}
                  title="Remove from favourites"
                >
                  {removingId === bookId ? (
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-error)" stroke="var(--color-error)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  )}
                </button>

                {/* Book Image */}
                <div onClick={() => navigate(`/books/${bookId}`)} style={{ cursor: 'pointer' }}>
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="book-card-image" loading="lazy" />
                  ) : (
                    <div className="book-card-image-placeholder" style={{ background: `linear-gradient(135deg, ${subjectColor.bg}, ${subjectColor.bg}cc)`, color: subjectColor.text }}>
                      <span style={{ fontSize: '36px' }}>{subjectColor.icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>
                        {book.title?.length > 30 ? book.title.slice(0, 30) + '…' : book.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="book-card-body" onClick={() => navigate(`/books/${bookId}`)} style={{ cursor: 'pointer' }}>
                  <span className="book-card-subject">{book.subject}</span>
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>

                  <div className="book-card-footer">
                    <span className="book-card-price">{formatPrice(book.price)}</span>
                    <span className={`badge ${getConditionBadgeClass(book.condition)}`}>{book.condition}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <div style={{ padding: '0 16px 14px' }}>
                  <button className="btn btn-outline btn-sm btn-full" onClick={() => navigate(`/books/${bookId}`)}>
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
