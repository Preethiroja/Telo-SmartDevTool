import React from 'react'

export default function TeloLogo({ size = 36, showText = true, textSize = 'text-2xl', className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        {/* Hexagon background */}
        <path
          d="M18 2L32.5 10.5V27.5L18 36L3.5 27.5V10.5L18 2Z"
          fill="url(#hexGrad)"
        />
        {/* Circuit dots */}
        <circle cx="9" cy="13" r="1.5" fill="rgba(255,255,255,0.4)" />
        <circle cx="27" cy="23" r="1.5" fill="rgba(255,255,255,0.4)" />
        <circle cx="9" cy="23" r="1.5" fill="rgba(255,255,255,0.3)" />
        {/* Circuit lines */}
        <line x1="9" y1="13" x2="14" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        <line x1="22" y1="23" x2="27" y2="23" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        {/* </> code brackets */}
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="700"
          fontFamily="'Inter', monospace"
          letterSpacing="-1"
        >
          {'</>'}
        </text>
      </svg>
      {showText && (
        <span className={`telo-logo-text ${textSize} gradient-text`}>
          telo
        </span>
      )}
    </div>
  )
}
