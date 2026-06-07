import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: string
  email: string
}

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => void
}

const STORAGE_USER_KEY = 'progression_user'
const STORAGE_USERS_KEY = 'progression_users'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const json = localStorage.getItem(STORAGE_USER_KEY)
      return json ? (JSON.parse(json) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_USER_KEY)
    }
  }, [user])

  const getStoredUsers = (): Array<{ id: string; email: string; password: string }> => {
    try {
      const json = localStorage.getItem(STORAGE_USERS_KEY)
      return json ? (JSON.parse(json) as Array<{ id: string; email: string; password: string }>) : []
    } catch {
      return []
    }
  }

  const saveStoredUsers = (list: Array<{ id: string; email: string; password: string }>) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list))
  }

  const login = async (email: string, password: string) => {
    // simple mock auth: check stored users
    const users = getStoredUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      return Promise.reject(new Error('Invalid email or password'))
    }
    const newUser = { id: found.id, email: found.email }
    setUser(newUser)
    return Promise.resolve(newUser)
  }

  const register = async (email: string, password: string) => {
    const users = getStoredUsers()
    if (users.some((u) => u.email === email)) {
      return Promise.reject(new Error('An account with that email already exists'))
    }
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const newRec = { id, email, password }
    const next = [newRec, ...users]
    saveStoredUsers(next)
    const newUser = { id, email }
    setUser(newUser)
    return Promise.resolve(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
