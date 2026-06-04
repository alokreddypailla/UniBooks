/**
 * ChatPage.jsx — Real-time messaging between buyer and seller for a specific book.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { messagesService } from '../services/messagesService'
import { booksService } from '../services/booksService'
import { useAuth } from '../context/AuthContext'
import { formatChatTime, formatChatDate, getErrorMessage } from '../utils/helpers'

export default function ChatPage() {
  const { bookId, userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [book, setBook] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesService.getConversation(bookId, userId)
      setMessages(res.data)
    } catch (err) {
      console.error('Fetch messages error:', err)
    }
  }, [bookId, userId])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        const [bookRes] = await Promise.all([
          booksService.getBook(bookId),
          fetchMessages(),
        ])
        setBook(bookRes.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    init()

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => clearInterval(pollRef.current)
  }, [bookId, userId, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = newMessage.trim()
    if (!text || isSending) return

    setIsSending(true)
    const optimistic = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: userId,
      book_id: bookId,
      content: text,
      created_at: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages((prev) => [...prev, optimistic])
    setNewMessage('')

    try {
      await messagesService.sendMessage({
        receiver_id: userId,
        book_id: bookId,
        content: text,
      })
      await fetchMessages()
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setNewMessage(text)
      setError(getErrorMessage(err))
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  // Group messages by date for dividers
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = formatChatDate(msg.created_at)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(msg)
    return groups
  }, {})

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  )

  const otherUserName = messages.find((m) => m.sender_id !== user?.id)?.sender_name || 'Seller'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1.5px solid var(--color-border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
        <button className="btn-back" onClick={() => navigate(-1)} style={{ flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        </button>

        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
          {otherUserName[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherUserName}</p>
          {book && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Re: {book.title}
            </p>
          )}
        </div>

        {book && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/books/${bookId}`)}>
            View Book
          </button>
        )}
      </div>

      {/* Book Context Banner */}
      {book && (
        <div style={{ background: 'rgba(26,43,74,0.04)', borderBottom: '1px solid var(--color-border-light)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>{book.title}</strong> — ${book.price}
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{ background: 'var(--color-error-bg)', borderBottom: '1px solid #fecaca', padding: '10px 20px', fontSize: '13px', color: 'var(--color-error)', flexShrink: 0 }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', color: 'var(--color-error)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {messages.length === 0 && !isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'var(--color-text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>No messages yet</p>
            <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '240px' }}>Start the conversation! Ask about the book condition, pickup location, or negotiate the price.</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-bg)', padding: '2px 10px', borderRadius: '9999px', border: '1px solid var(--color-border)' }}>{date}</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            {msgs.map((msg, idx) => {
              const isOwn = msg.sender_id === user?.id
              const showAvatar = !isOwn && (idx === 0 || msgs[idx - 1]?.sender_id !== msg.sender_id)

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '6px', gap: '8px', alignItems: 'flex-end' }}>
                  {!isOwn && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: showAvatar ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {showAvatar ? (otherUserName[0]?.toUpperCase() || '?') : ''}
                    </div>
                  )}
                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isOwn ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isOwn ? 'white' : 'var(--color-text-primary)',
                      fontSize: '14px', lineHeight: 1.5,
                      border: isOwn ? 'none' : '1.5px solid var(--color-border)',
                      boxShadow: 'var(--shadow-sm)',
                      opacity: msg._optimistic ? 0.7 : 1,
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', padding: '0 4px' }}>
                      {formatChatTime(msg.created_at)}
                      {msg._optimistic && ' · Sending...'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} style={{ background: 'var(--color-surface)', borderTop: '1.5px solid var(--color-border)', padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1 }}
          maxLength={1000}
          autoComplete="off"
        />
        <button type="submit" className="btn-send" disabled={!newMessage.trim() || isSending}>
          {isSending ? (
            <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          )}
        </button>
      </form>
    </div>
  )
}
