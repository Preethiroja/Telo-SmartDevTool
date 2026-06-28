import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from 'react-icons/ri'

export default function VideoModal({ isOpen, onClose, videoUrl }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
        >
          {/* Modal Content Box */}
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()} // Prevents modal closure when clicking video player
            className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Close Button Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
            >
              <RiCloseLine size={20} />
            </button>

            {/* Responsive 16:9 Player Frame Container */}
            <div className="relative pt-[56.25%] w-full bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={videoUrl}
                title="Telo Platform Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}