/**
 * BookCard.jsx — Reusable book listing card component.
 * Used in BrowsePage, FavouritesPage, and MyListingsPage.
 */

import { useNavigate } from 'react-router-dom'
import { formatPrice, getConditionBadgeClass, getSubjectColor } from '../../utils/helpers'

export default function BookCard({ book }) {
  const navigate = useNavigate()
  const subjectColor = getSubjectColor(book.subject)

  return (
    <div
      className="book-card"
      onClick={() => navigate(`/books/${book.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/books/${book.id}`)}
      aria-label={`View ${book.title}`}
    >
      {/* Book Cover Image */}
      {book.image_url ? (
        <img
          src={book.image_url}
          alt={book.title}
          className="book-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}

      {/* Placeholder when no image */}
      <div
        className="book-card-image-placeholder"
        style={{
          display: book.image_url ? 'none' : 'flex',
          background: `linear-gradient(135deg, ${subjectColor.bg}, ${subjectColor.bg}cc)`,
          color: subjectColor.text,
        }}
      >
        <span style={{ fontSize: '36px' }}>{subjectColor.icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>
          {book.title.length > 30 ? book.title.slice(0, 30) + '…' : book.title}
        </span>
      </div>

      {/* Card Body */}
      <div className="book-card-body">
        <span className="book-card-subject">{book.subject}</span>
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        {book.edition && (
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{book.edition}</p>
        )}

        <div className="book-card-footer">
          <span className="book-card-price">{formatPrice(book.price)}</span>
          <span className={`badge ${getConditionBadgeClass(book.condition)}`}>
            {book.condition}
          </span>
        </div>
      </div>
    </div>
  )
}
