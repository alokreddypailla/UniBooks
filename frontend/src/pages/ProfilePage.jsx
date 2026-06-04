/**
 * ProfilePage.jsx — User profile with edit, password change, and stats.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { getInitials, getErrorMessage } from '../utils/helpers'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'password'

  // Edit profile state
  const [editForm, setEditForm] = useState({ full_name: '', university: '' })
  const [editErrors, setEditErrors] = useState({})
  const [editSuccess, setEditSuccess] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Password change state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const res = await profileService.getProfile()
        setProfile(res.data)
        setEditForm({ full_name: res.data.full_name || '', university: res.data.university || '' })
      } catch (err) {
        console.error('Profile fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleEditChange = (e) => {
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setEditErrors((p) => ({ ...p, [e.target.name]: '' }))
    setEditSuccess('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!editForm.full_name.trim() || editForm.full_name.trim().length < 2) errs.full_name = 'Name must be at least 2 characters'
    if (!editForm.university.trim()) errs.university = 'University is required'
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return }

    setEditLoading(true)
    try {
      const res = await profileService.updateProfile(editForm)
      setProfile((p) => ({ ...p, ...res.data }))
      updateUser({ ...user, ...res.data })
      setEditSuccess('Profile updated successfully!')
    } catch (err) {
      setEditErrors({ api: getErrorMessage(err) })
    } finally {
      setEditLoading(false)
    }
  }

  const handlePwChange = (e) => {
    setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setPwErrors((p) => ({ ...p, [e.target.name]: '' }))
    setPwSuccess('')
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current_password) errs.current_password = 'Current password is required'
    if (!pwForm.new_password || pwForm.new_password.length < 8) errs.new_password = 'New password must be at least 8 characters'
    if (pwForm.new_password !== pwForm.confirm_password) errs.confirm_password = 'Passwords do not match'
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return }

    setPwLoading(true)
    try {
      await profileService.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      setPwSuccess('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwErrors({ api: getErrorMessage(err) })
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <svg className="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  )

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 24px' }}>My Profile</h1>

      {/* Profile Header Card */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #243660)', borderRadius: '16px', padding: '28px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {getInitials(profile?.full_name || user?.full_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || user?.full_name}</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email || user?.email}</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{profile?.university || user?.university}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Listings', value: profile?.total_listings ?? 0, icon: '📚' },
          { label: 'Favourites', value: profile?.total_favourites ?? 0, icon: '❤️' },
          { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).getFullYear() : '—', icon: '🎓' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)', margin: '6px 0 2px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-2)', borderRadius: '10px', padding: '4px', marginBottom: '20px', border: '1.5px solid var(--color-border)' }}>
        {[{ id: 'info', label: 'Edit Profile' }, { id: 'password', label: 'Change Password' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s ease', background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent', color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)', boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Edit Profile Tab */}
      {activeTab === 'info' && (
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '24px' }} className="animate-fade-in">
          {editErrors.api && <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--color-error)', marginBottom: '16px' }}>{editErrors.api}</div>}
          {editSuccess && <div style={{ background: 'var(--color-success-bg)', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#15803d', fontWeight: 600, marginBottom: '16px' }}>✓ {editSuccess}</div>}

          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="full_name" className={`form-input${editErrors.full_name ? ' error' : ''}`} value={editForm.full_name} onChange={handleEditChange} />
              {editErrors.full_name && <span className="form-error">{editErrors.full_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">University</label>
              <input type="text" name="university" className={`form-input${editErrors.university ? ' error' : ''}`} value={editForm.university} onChange={handleEditChange} />
              {editErrors.university && <span className="form-error">{editErrors.university}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={profile?.email || user?.email || ''} disabled style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Email cannot be changed</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={editLoading}>
              {editLoading ? <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '14px', padding: '24px' }} className="animate-fade-in">
          {pwErrors.api && <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--color-error)', marginBottom: '16px' }}>{pwErrors.api}</div>}
          {pwSuccess && <div style={{ background: 'var(--color-success-bg)', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#15803d', fontWeight: 600, marginBottom: '16px' }}>✓ {pwSuccess}</div>}

          <form onSubmit={handlePwSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" name="current_password" className={`form-input${pwErrors.current_password ? ' error' : ''}`} value={pwForm.current_password} onChange={handlePwChange} placeholder="Enter current password" />
              {pwErrors.current_password && <span className="form-error">{pwErrors.current_password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" name="new_password" className={`form-input${pwErrors.new_password ? ' error' : ''}`} value={pwForm.new_password} onChange={handlePwChange} placeholder="Min. 8 characters" />
              {pwErrors.new_password && <span className="form-error">{pwErrors.new_password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" name="confirm_password" className={`form-input${pwErrors.confirm_password ? ' error' : ''}`} value={pwForm.confirm_password} onChange={handlePwChange} placeholder="Repeat new password" />
              {pwErrors.confirm_password && <span className="form-error">{pwErrors.confirm_password}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Changing...</> : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => navigate('/my-listings')}>My Listings</button>
        <button className="btn btn-outline" onClick={() => navigate('/favourites')}>Favourites</button>
        <button className="btn btn-danger" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </div>
  )
}
