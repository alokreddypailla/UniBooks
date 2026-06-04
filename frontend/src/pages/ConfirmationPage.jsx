/**
 * ConfirmationPage.jsx — Success screen shown after posting a book listing.
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { formatPrice, getConditionBadgeClass } from '../utils/helpers'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const book = state?.book

  // If accessed directly without state, redirect to browse
  if (!book) {
    navigate('/')
    return null
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '48px' }}>
      {/* Success Icon */}
      <div className="animate-pop-in" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success-bg)', border: '3px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>

      {/* Success Message */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Listing Posted! 🎉</h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Your book is now live and visible to other students at your university.
        </p>
      </div>

      {/* Book Summary Card */}
      <div style={{ width: '100%', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #243660)', padding: '16px 20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>Listing Summary</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0 }}>{book.title}</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>by {book.author}</p>
        </div>

        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[
            { label: 'Subject', value: book.subject },
            { label: 'Condition', value: book.condition },
            { label: 'Price', value: formatPrice(book.price) },
            { label: 'Edition', value: book.edition || 'Not specified' },
            { label: 'Pickup', value: book.pickup_location || 'Contact seller' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>{label}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {label === 'Condition' ? (
                  <span className={`badge ${getConditionBadgeClass(value)}`}>{value}</span>
                ) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          Browse Books
        </button>
        <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => navigate('/post')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post Another
        </button>
      </div>

      <button className="btn btn-ghost" onClick={() => navigate('/my-listings')}>
        View My Listings →
      </button>
    </div>
  )
}
