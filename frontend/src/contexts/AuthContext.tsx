// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { cookieUtils } from '../utils/cookies'
import type { AuthContextType, UserType, Company, Employee } from '../types'
const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Company | Employee | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for userType cookie (this is readable by JS)
    const type = cookieUtils.get('userType') as UserType | null
    const userData = localStorage.getItem('userData') // Still use localStorage for user data

    if (type && userData) {
      setUserType(type)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = (type: UserType, userData: Company | Employee) => {
    cookieUtils.set('userType', type, { expires: 30 }) // 30 days
    localStorage.setItem('userData', JSON.stringify(userData))
    setUserType(type)
    setUser(userData)
  }

  const logout = () => {
    // Cookies will be cleared by backend
    cookieUtils.remove('userType')
    localStorage.removeItem('userData')
    setUserType(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}