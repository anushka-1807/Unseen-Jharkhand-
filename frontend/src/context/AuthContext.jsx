import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null) // { email, role }

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      }
    } catch {}
  }, [])

  const login = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    try {
      localStorage.setItem('auth', JSON.stringify({ token: nextToken, user: nextUser }))
    } catch {}
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    try {
      localStorage.removeItem('auth')
    } catch {}
  }

  const value = useMemo(() => ({ token, user, login, logout, isAuthenticated: !!token }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
