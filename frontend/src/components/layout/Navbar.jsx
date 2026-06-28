import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import TeloLogo from '../ui/TeloLogo'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleGetStarted = () => {
    const token = localStorage.getItem('telo_token')
    if (token) {
      navigate('/dashboard')
    } else {
      navigate('/register')
    }
  }

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#workflow' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <TeloLogo size={32} textSize="text-xl" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-all duration-200"
            >
              Sign in
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStarted}
              className="btn-primary text-sm py-2 px-5"
            >
              Get started
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="section-padding py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-gray-100" />
              <Link
                to="/login"
                className="px-4 py-3 text-sm font-semibold text-teal-700 rounded-lg hover:bg-teal-50 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <button
                onClick={() => { handleGetStarted(); setMenuOpen(false) }}
                className="btn-primary text-sm w-full justify-center"
              >
                Get started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
