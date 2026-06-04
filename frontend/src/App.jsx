/**
 * App.jsx — Root component with routing and auth protection.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BrowsePage from './pages/BrowsePage'
import BookDetailsPage from './pages/BookDetailsPage'
import ChatPage from './pages/ChatPage'
import PostBookPage from './pages/PostBookPage'
import ConfirmationPage from './pages/ConfirmationPage'
import ProfilePage from './pages/ProfilePage'
import MyListingsPage from './pages/MyListingsPage'
import FavouritesPage from './pages/FavouritesPage'

/** Loading spinner shown while auth state is being restored */
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <svg className="spin" width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-primary)" strokeWidth="2">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Loading UniBooks...
        </p>
      </div>
    </div>
  )
}

/** Protects routes that require authentication */
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

/** Redirects authenticated users away from login/register */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes — wrapped in AppLayout (sidebar + bottom nav) */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<BrowsePage />} />
        <Route path="books/:id" element={<BookDetailsPage />} />
        <Route path="chat/:bookId/:userId" element={<ChatPage />} />
        <Route path="post" element={<PostBookPage />} />
        <Route path="confirmation" element={<ConfirmationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="my-listings" element={<MyListingsPage />} />
        <Route path="favourites" element={<FavouritesPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
