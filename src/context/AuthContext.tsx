import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

type User = { id: string; email: string } | null

type AuthContextValue = {
  user: User
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'progression_auth_token'
const USER_KEY = 'progression_auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const navigate = useNavigate()

  useEffect(() => {
    api.setToken(token)
  }, [token])

  const saveAuth = (nextToken: string, nextUser: User) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    api.setToken(null)
  }

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    // Expect { token, user }
    saveAuth(res.token, res.user)
    navigate('/dashboard')
  }

  const register = async (email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password })
    saveAuth(res.token, res.user)
    navigate('/dashboard')
  }

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
