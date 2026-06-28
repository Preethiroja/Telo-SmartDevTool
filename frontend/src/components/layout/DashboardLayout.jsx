import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine, RiHistoryLine, RiFolderLine, RiUserLine,
  RiSettings3Line, RiLogoutBoxLine, RiMenuFoldLine, RiMenuUnfoldLine,
  RiMessage3Line, RiCodeLine
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import TeloLogo from '../ui/TeloLogo'

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/history', icon: RiHistoryLine, label: 'History' },
  { to: '/generator', icon: RiCodeLine, label: 'Generator' },
  { to: '/chat', icon: RiMessage3Line, label: 'AI Chat' },
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
  { to: '/settings', icon: RiSettings3Line, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center justify-between px-4 py-5 border-b border-gray-100 ${collapsed && !mobile ? 'justify-center px-3' : ''}`}>
        {(!collapsed || mobile) && <TeloLogo size={28} textSize="text-lg" />}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
          >
            {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                collapsed && !mobile ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={19}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-700'}`}
                />
                {(!collapsed || mobile) && (
                  <span className="truncate">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-gray-100 p-3 ${collapsed && !mobile ? 'items-center flex flex-col gap-2' : ''}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        {(collapsed && !mobile) && (
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold mb-2 mx-auto">
            {initials}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ${
            collapsed && !mobile ? 'justify-center' : ''
          }`}
        >
          <RiLogoutBoxLine size={17} />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-white border-r border-gray-100 flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-xl"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <RiMenuUnfoldLine size={20} />
          </button>
          <TeloLogo size={26} textSize="text-lg" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
