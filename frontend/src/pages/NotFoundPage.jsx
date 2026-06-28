import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowLeftLine, RiCodeLine } from 'react-icons/ri'
import TeloLogo from '../components/ui/TeloLogo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center bg-mesh">
      <Link to="/" className="mb-10">
        <TeloLogo size={36} textSize="text-2xl" />
      </Link>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="font-mono text-8xl font-bold gradient-text mb-4">404</div>
        <div className="text-lg font-semibold font-poppins text-gray-800 mb-2">Page not found</div>
        <p className="text-gray-400 text-sm mb-8 max-w-sm">
          This endpoint doesn't exist. Maybe the URL changed, or the route was never implemented.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/" className="btn-secondary">
            <RiArrowLeftLine />
            Back to home
          </Link>
          <Link to="/dashboard" className="btn-primary">
            <RiCodeLine />
            Go to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
