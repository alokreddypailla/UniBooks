/**
 * PostBookPage.jsx — Create a new book listing with cover image URL input.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksService } from '../services/booksService'
import { getErrorMessage } from '../utils/helpers'

const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'Economics', 'Literature', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Psychology', 'History', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair']

const INITIAL_FORM = { title: '', author: '', edition: '', subject: '', condition: '', price: '', description: '', image_url: '', pickup_location: '' }

export default function PostBookPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.author.trim()) e.author = 'Author is required'
    if (!form.subject) e.subject = 'Subject is required'
    if (!form.condition) e.condition = 'Condition is required'
    if (!form.price || isNaN(form.price) || parseFloat(form.price) < 0) e.price = 'Enter a valid price (0 or more)'
    if (form.image_url) {
      try {
        new URL(form.image_url)
      } catch (err) {
        e.image_url = 'Enter a valid image URL'
      }
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setIsLoading(true)
    try {
      const bookData = {
        ...form,
        price: parseFloat(form.price),
      }

      const res = await booksService.createBook(bookData)

      // Navigate to confirmation page with the new book data
      navigate('/confirmation', { state: { book: res.data } })
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back
      </button>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Post a Book</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>List your textbook for other students to find</p>
      </div>

      {apiError && (
        <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--color-error)', marginBottom: '20px' }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Book Cover URL */}
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '14px' }}>Book Cover Image URL <span className="optional-tag">Optional</span></h3>
          <div className="form-group">
            <input
              type="url"
              name="image_url"
              className={`form-input${errors.image_url ? ' error' : ''}`}
              placeholder="https://example.com/book-cover.jpg"
              value={form.image_url}
              onChange={handleChange}
            />
            {errors.image_url && <span className="form-error">{errors.image_url}</span>}
          </div>
          {form.image_url && !errors.image_url && (
            <div style={{ marginTop: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img src={form.image_url} alt="Book cover preview" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '260px' }} />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Book Details</h3>

          <div className="form-group">
            <label className="form-label">Title <span className="required-tag">*</span></label>
            <input type="text" name="title" className={`form-input${errors.title ? ' error' : ''}`} placeholder="e.g. Introduction to Algorithms" value={form.title} onChange={handleChange} />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Author <span className="required-tag">*</span></label>
              <input type="text" name="author" className={`form-input${errors.author ? ' error' : ''}`} placeholder="e.g. Thomas H. Cormen" value={form.author} onChange={handleChange} />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Edition <span className="optional-tag">Optional</span></label>
              <input type="text" name="edition" className="form-input" placeholder="e.g. 3rd Edition" value={form.edition} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject <span className="required-tag">*</span></label>
              <select name="subject" className={`form-input${errors.subject ? ' error' : ''}`} value={form.subject} onChange={handleChange}>
                <option value="">Select subject...</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Condition <span className="required-tag">*</span></label>
              <select name="condition" className={`form-input${errors.condition ? ' error' : ''}`} value={form.condition} onChange={handleChange}>
                <option value="">Select condition...</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.condition && <span className="form-error">{errors.condition}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="optional-tag">Optional</span></label>
            <textarea name="description" className="form-input form-textarea" placeholder="Describe the book's condition, any highlights or notes, missing pages, etc." value={form.description} onChange={handleChange} rows={3} />
          </div>
        </div>

        {/* Pricing & Pickup */}
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Pricing & Pickup</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (AUD) <span className="required-tag">*</span></label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input type="number" name="price" className={`form-input with-prefix${errors.price ? ' error' : ''}`} placeholder="0.00" min="0" step="0.50" value={form.price} onChange={handleChange} />
              </div>
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Pickup Location <span className="optional-tag">Optional</span></label>
              <input type="text" name="pickup_location" className="form-input" placeholder="e.g. Library, Building A" value={form.pickup_location} onChange={handleChange} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
          {isLoading ? (
            <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Posting...</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Post Listing</>
          )}
        </button>
      </form>
    </div>
  )
}
