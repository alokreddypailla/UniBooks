/**
 * RegisterPage.jsx — New user registration screen.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { getErrorMessage } from '../utils/helpers'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ full_name: '', university: '', email: '', password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim() || form.full_name.trim().length < 2) newErrors.full_name = 'Full name must be at least 2 characters'
    if (!form.university.trim() || form.university.trim().length < 2) newErrors.university = 'University name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\.(edu|edu\.au|ac\.uk|edu\.sg|ac\.nz|edu\.in|ac\.in)$/i.test(form.email)) newErrors.email = 'Only university email addresses are accepted (.edu, .edu.au, .ac.uk, etc.)'
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setIsLoading(true)
    try {
      const res = await authService.register(form)
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a2b4a 0%, #243660 50%, #2d4a7a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-200px', right: '-150px', borderRadius: '50%', background: 'white', opacity: 0.06, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '350px', height: '350px', bottom: '-150px', left: '-100px', borderRadius: '50%', background: 'white', opacity: 0.06, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#1a2b4a"/>
            <path d="M8 28L20 10L32 28H8Z" fill="#f5a623" opacity="0.9"/>
            <rect x="14" y="20" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
          </svg>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0 }}>UniBooks Exchange</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Create your student account</p>
        </div>

        {/* Register Card */}
        <div style={{ width: '100%', background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Create Account 🎓</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Join your university's book marketplace</p>
          </div>

          {apiError && (
            <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--color-error)', fontWeight: 500 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required-tag">*</span></label>
                <input type="text" name="full_name" className={`form-input${errors.full_name ? ' error' : ''}`} placeholder="John Smith" value={form.full_name} onChange={handleChange} />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">University <span className="required-tag">*</span></label>
                <input type="text" name="university" className={`form-input${errors.university ? ' error' : ''}`} placeholder="State University" value={form.university} onChange={handleChange} />
                {errors.university && <span className="form-error">{errors.university}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">University Email <span className="required-tag">*</span></label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" name="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="yourname@university.edu" value={form.email} onChange={handleChange} />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password <span className="required-tag">*</span></label>
                <input type="password" name="password" className={`form-input${errors.password ? ' error' : ''}`} placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required-tag">*</span></label>
                <input type="password" name="confirm_password" className={`form-input${errors.confirm_password ? ' error' : ''}`} placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
                {errors.confirm_password && <span className="form-error">{errors.confirm_password}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading} style={{ marginTop: '4px' }}>
              {isLoading ? (<><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Creating account...</>) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
