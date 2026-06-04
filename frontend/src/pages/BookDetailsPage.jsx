/**
 * BookDetailsPage.jsx — Full book details with contact seller and favourite actions.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { booksService } from '../services/booksService'
import { favouritesService } from '../services/favouritesService'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getConditionBadgeClass, getSubjectColor, formatRelativeTime, getErrorMessage } from '../utils/helpers'

export default function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavourited, setIsFavourited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true)
      try {
        const [bookRes, favRes] = await Promise.all([
          booksService.getBook(id),
          favouritesService.checkFavourite(id).catch(() => ({ data: { is_favourited: false } })),
        ])
        setBook(bookRes.data)
        setIsFavourited(favRes.data.is_favourited)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchBook()
  }, [id])

  const toggleFavourite = async () => {
    setFavLoading(true)
    try {
      if (isFavourited) {
        await favouritesService.removeFavourite(id)
        setIsFavourited(false)
      } else {
        await favouritesService.addFavourite(id)
        setIsFavourited(true)
      }
    } catch (err) {
      console.error('Favourite error:', err)
    } finally {
      setFavLoading(false)
    }
  }

  const handleContactSeller = () => {
    if (book?.seller_id) navigate(`/chat/${id}/${book.seller_id}`)
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  )

  if (error) return (
    <div style={{ padding: '24px' }}>
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      <div style={{ marginTop: '24px', background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', color: 'var(--color-error)' }}>{error}</div>
    </div>
  )

  if (!book) return null

  const subjectColor = getSubjectColor(book.subject)
  const isOwnListing = user?.id === book.seller_id

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Browse
      </button>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }} className="book-details-grid">
        {/* Book Image */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} style={{ width: '100%', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', objectFit: 'cover', aspectRatio: '3/4' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '16px', background: `linear-gradient(135deg, ${subjectColor.bg}, ${subjectColor.bg}cc)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: 'var(--shadow-lg)' }}>
              <span style={{ fontSize: '64px' }}>{subjectColor.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: subjectColor.text, textAlign: 'center', padding: '0 16px' }}>{book.title}</span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{book.subject}</span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '6px 0 4px', lineHeight: 1.2 }}>{book.title}</h1>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', margin: 0 }}>by {book.author}</p>
            {book.edition && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{book.edition}</p>}
          </div>

          {/* Price + Condition */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)' }}>{formatPrice(book.price)}</span>
            <span className={`badge ${getConditionBadgeClass(book.condition)}`} style={{ fontSize: '13px', padding: '5px 12px' }}>{book.condition}</span>
          </div>

          {/* Description */}
          {book.description && (
            <div style={{ background: 'var(--color-surface-2)', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Description</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.7, margin: 0 }}>{book.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Subject', value: book.subject },
              { label: 'Condition', value: book.condition },
              { label: 'Edition', value: book.edition || 'Not specified' },
              { label: 'Pickup Location', value: book.pickup_location || 'Contact seller' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border-light)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Seller Info */}
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
              {book.seller_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{book.seller_name || 'Unknown Seller'}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{book.seller_university || ''} · Listed {formatRelativeTime(book.created_at)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnListing && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleContactSeller} style={{ flex: 1, minWidth: '160px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Contact Seller
              </button>
              <button
                className={`btn ${isFavourited ? 'btn-accent' : 'btn-outline'} btn-lg`}
                onClick={toggleFavourite}
                disabled={favLoading}
                style={{ minWidth: '140px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavourited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {isFavourited ? 'Saved' : 'Save'}
              </button>
            </div>
          )}

          {isOwnListing && (
            <div style={{ background: 'var(--color-warning-bg)', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
              📌 This is your listing. Go to <button onClick={() => navigate('/my-listings')} style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>My Listings</button> to edit or delete it.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .book-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
