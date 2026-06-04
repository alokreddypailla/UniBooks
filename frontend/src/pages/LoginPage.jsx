/**
 * LoginPage.jsx — User login screen.
 * Matches the MVP design: navy gradient background, white card.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { getErrorMessage } from '../utils/helpers'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.login({ email: form.email, password: form.password })
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2b4a 0%, #243660 50%, #2d4a7a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background circles */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-200px', right: '-150px', borderRadius: '50%', background: 'white', opacity: 0.06, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '350px', height: '350px', bottom: '-150px', left: '-100px', borderRadius: '50%', background: 'white', opacity: 0.06, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'white' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.12)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#1a2b4a"/>
              <path d="M8 28L20 10L32 28H8Z" fill="#f5a623" opacity="0.9"/>
              <rect x="14" y="20" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px', color: 'white', margin: 0 }}>UniBooks</h1>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#f5a623', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Exchange</p>
        </div>

        {/* Login Card */}
        <div style={{ width: '100%', background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Welcome Back 👋</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Sign in with your university email to continue</p>
          </div>

          {error && (
            <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--color-error)', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">University Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" name="email" className="form-input" placeholder="yourname@university.edu" value={form.email} onChange={handleChange} autoComplete="email" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input type="password" name="password" className="form-input" placeholder="Enter your password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? (
                <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          Only university email addresses are accepted
        </p>
      </div>
    </div>
  )
}
