import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResultsPage from './pages/ResultsPage'
import GeneratorPage from './pages/GeneratorPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

const TOAST_OPTS = {
  duration: 4000,
  style: {
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
  error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" gutter={8} toastOptions={TOAST_OPTS} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — all inside dashboard layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/generator/:id" element={<GeneratorPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
