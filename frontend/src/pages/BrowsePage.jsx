/**
 * BrowsePage.jsx — Main book browsing page with search, filter, and sort.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksService } from '../services/booksService'
import BookCard from '../components/ui/BookCard'
import { getErrorMessage } from '../utils/helpers'

const SUBJECTS = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Economics', 'Literature', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Psychology', 'History', 'Other']
const CONDITIONS = ['All', 'Like New', 'Good', 'Fair']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function BrowsePage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('All')
  const [condition, setCondition] = useState('All')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = { sort_by: sort }
      if (search.trim()) params.search = search.trim()
      if (subject !== 'All') params.subject = subject
      if (condition !== 'All') params.condition = condition
      if (minPrice) params.min_price = parseFloat(minPrice)
      if (maxPrice) params.max_price = parseFloat(maxPrice)
      const res = await booksService.getBooks(params)
      setBooks(res.data.books || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [search, subject, condition, sort, minPrice, maxPrice])

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 350)
    return () => clearTimeout(timer)
  }, [fetchBooks])

  const clearFilters = () => {
    setSearch(''); setSubject('All'); setCondition('All')
    setSort('newest'); setMinPrice(''); setMaxPrice('')
  }

  const hasActiveFilters = subject !== 'All' || condition !== 'All' || minPrice || maxPrice

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Browse Books</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {isLoading ? 'Loading...' : `${books.length} book${books.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" className="form-input" placeholder="Search by title, author, or subject..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>

        <select className="form-input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button className={`btn-icon${showFilters ? ' active' : ''}`} onClick={() => setShowFilters(!showFilters)} style={{ position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {hasActiveFilters && <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent)' }} />}
        </button>

        <button className="btn btn-accent" onClick={() => navigate('/post')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post Book
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }} className="animate-fade-in">
          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Subject</label>
            <select className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
            <label className="form-label">Condition</label>
            <select className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
            <label className="form-label">Min Price ($)</label>
            <input type="number" className="form-input" placeholder="0" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
            <label className="form-label">Max Price ($)</label>
            <input type="number" className="form-input" placeholder="Any" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear Filters</button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--color-error)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="book-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--color-border-light)' }}>
              <div style={{ aspectRatio: '3/4', background: 'linear-gradient(90deg, #e8edf5 25%, #f1f5f9 50%, #e8edf5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '10px', background: '#e8edf5', borderRadius: '6px', width: '60%' }} />
                <div style={{ height: '14px', background: '#e8edf5', borderRadius: '6px' }} />
                <div style={{ height: '12px', background: '#e8edf5', borderRadius: '6px', width: '70%' }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      )}

      {/* Books Grid */}
      {!isLoading && books.length > 0 && (
        <div className="book-grid animate-fade-in">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && books.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '56px' }}>📚</span>
          <h3>{search || hasActiveFilters ? 'No books match your search' : 'No books listed yet'}</h3>
          <p>{search || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Be the first to list a book for your university!'}</p>
          {hasActiveFilters && <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>}
          <button className="btn btn-primary" onClick={() => navigate('/post')}>Post a Book</button>
        </div>
      )}
    </div>
  )
}
