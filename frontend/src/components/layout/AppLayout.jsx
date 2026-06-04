/**
 * AppLayout.jsx — Main app shell with sidebar (desktop) and bottom nav (mobile).
 * All protected pages render inside the <Outlet />.
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
        className="main-content-area"
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />

      <style>{`
        @media (max-width: 768px) {
          .main-content-area {
            margin-left: 0 !important;
            padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </div>
  )
}
