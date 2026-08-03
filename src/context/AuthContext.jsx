import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null)
      setLoading(false)
      return
    }
    try {
      const data = await api.get('/v1/auth/me')
      setProfile(data)
    } catch {
      clearToken()
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()

    function handleUnauthorized() {
      setProfile(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [loadProfile])

  async function login(email, password) {
    const data = await api.post('/v1/auth/login', { email, password })
    setToken(data.token)
    setProfile(data.profile)
  }

  function logout() {
    clearToken()
    setProfile(null)
  }

  async function changePassword(currentPassword, newPassword) {
    const data = await api.post('/v1/auth/change-password', { currentPassword, newPassword })
    setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ profile, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
