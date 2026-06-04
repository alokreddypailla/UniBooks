/**
 * AuthContext.jsx — Global authentication state management.
 *
 * Provides:
 *   - user: the currently logged-in user object (or null)
 *   - token: the JWT token string (or null)
 *   - isLoading: true while checking auth on app load
 *   - login(token, user): store credentials and update state
 *   - logout(): clear credentials and redirect to /login
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('unibooks_token')
    const storedUser = localStorage.getItem('unibooks_user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        // Verify token is still valid by fetching /auth/me
        authService.getMe()
          .then((res) => {
            setUser(res.data)
            localStorage.setItem('unibooks_user', JSON.stringify(res.data))
          })
          .catch(() => {
            // Token expired — clear everything
            localStorage.removeItem('unibooks_token')
            localStorage.removeItem('unibooks_user')
            setToken(null)
            setUser(null)
          })
          .finally(() => setIsLoading(false))
      } catch {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  /** Call after successful login or register */
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('unibooks_token', newToken)
    localStorage.setItem('unibooks_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  /** Clear session and redirect to login */
  const logout = useCallback(() => {
    localStorage.removeItem('unibooks_token')
    localStorage.removeItem('unibooks_user')
    setToken(null)
    setUser(null)
  }, [])

  /** Update user data in state and localStorage (e.g. after profile edit) */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('unibooks_user', JSON.stringify(updatedUser))
  }, [])

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Custom hook for consuming AuthContext */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
