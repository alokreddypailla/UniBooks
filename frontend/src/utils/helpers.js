/**
 * helpers.js — Shared utility functions used across the application.
 */

/** Format a price number as a dollar string: 45 → "$45", 35.50 → "$35.50" */
export function formatPrice(price) {
  const num = parseFloat(price)
  return `$${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`
}

/** Get the CSS class for a condition badge */
export function getConditionBadgeClass(condition) {
  const map = {
    'Like New': 'badge-like-new',
    'Good': 'badge-good',
    'Fair': 'badge-fair',
  }
  return map[condition] || 'badge-good'
}

/** Get initials from a full name: "Alex Johnson" → "AJ" */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Format a date string to a relative time: "2 days ago" */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format a date for chat timestamps: "10:30 AM" */
export function formatChatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Format a date for chat date dividers: "Today", "Yesterday", or "Mon 3 Jun" */
export function formatChatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Extract a display name from an email: "john.doe@uni.edu" → "John Doe" */
export function nameFromEmail(email) {
  if (!email) return 'Student'
  const local = email.split('@')[0]
  return local
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Subject colour palette for book placeholders */
export const SUBJECT_COLORS = {
  'Computer Science': { bg: '#dbeafe', text: '#1d4ed8', icon: '💻' },
  'Mathematics':      { bg: '#fce7f3', text: '#be185d', icon: '📐' },
  'Physics':          { bg: '#d1fae5', text: '#065f46', icon: '⚛️' },
  'Economics':        { bg: '#fef3c7', text: '#92400e', icon: '📊' },
  'Literature':       { bg: '#ede9fe', text: '#5b21b6', icon: '📖' },
  'Chemistry':        { bg: '#ffedd5', text: '#9a3412', icon: '🧪' },
  'Biology':          { bg: '#dcfce7', text: '#15803d', icon: '🧬' },
  'Engineering':      { bg: '#e0f2fe', text: '#0369a1', icon: '⚙️' },
  'Business':         { bg: '#fef9c3', text: '#713f12', icon: '💼' },
  'Psychology':       { bg: '#fae8ff', text: '#86198f', icon: '🧠' },
  'History':          { bg: '#f5f5f4', text: '#44403c', icon: '📜' },
  'Other':            { bg: '#f1f5f9', text: '#475569', icon: '📚' },
}

export function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['Other']
}

/** Extract a user-friendly error message from an Axios error */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred. Please try again.'
  )
}
