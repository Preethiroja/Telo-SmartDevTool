import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('telo_token')

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const loadUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    setAuthHeader(token)
    try {
      const res = await axios.get(`${API_BASE}/auth/me`)
      setUser(res.data.user)
    } catch {
      localStorage.removeItem('telo_token')
      setAuthHeader(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password })
    const { token, user } = res.data
    localStorage.setItem('telo_token', token)
    setAuthHeader(token)
    setUser(user)
    toast.success('Welcome back to Telo!', {
      icon: '👋',
      style: { fontFamily: 'Inter, sans-serif' },
    })
    return user
  }

  const register = async (fullName, email, password) => {
    await axios.post(`${API_BASE}/auth/register`, { fullName, email, password })
    toast.success('Account created successfully. Please login.', {
      icon: '✅',
      style: { fontFamily: 'Inter, sans-serif' },
    })
  }

  const logout = () => {
    localStorage.removeItem('telo_token')
    setAuthHeader(null)
    setUser(null)
    toast.success('Logged out successfully', {
      icon: '👋',
      style: { fontFamily: 'Inter, sans-serif' },
    })
  }

  const isAuthenticated = () => !!getToken()

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
