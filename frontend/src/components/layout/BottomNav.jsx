/**
 * BottomNav.jsx — Mobile bottom navigation bar (visible on screens ≤ 768px).
 */

import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/', label: 'Browse', end: true,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  },
  {
    to: '/post', label: 'Post',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  },
  {
    to: '/favourites', label: 'Saved',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav-mobile" style={{
      display: 'none',
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'var(--bottom-nav-height)',
      background: 'var(--color-surface)',
      borderTop: '1.5px solid var(--color-border)',
      zIndex: 200,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    }}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '3px', flex: 1, height: '100%',
            fontSize: '10px', fontWeight: 600,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
            position: 'relative',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span style={{
                  position: 'absolute', top: '6px',
                  width: '4px', height: '4px',
                  borderRadius: '9999px',
                  background: 'var(--color-accent)',
                }} />
              )}
              {item.icon}
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
