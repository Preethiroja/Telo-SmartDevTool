import React from 'react'
import { motion } from 'framer-motion'
import { RiConstructionLine } from 'react-icons/ri'

function ComingSoon({ title, desc }) {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-lg">
          <RiConstructionLine size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        <div className="mt-6 inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-100">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Coming in next phase
        </div>
      </motion.div>
    </div>
  )
}

export function ResultsPage() {
  return <ComingSoon title="Results" desc="API analysis results will display here after you analyze documentation from the dashboard." />
}

export function GeneratorPage() {
  return <ComingSoon title="Code Generator" desc="Generate Java, Python, and JavaScript clients from your analyzed API documentation." />
}

export function ChatPage() {
  return <ComingSoon title="AI Chat Assistant" desc="Ask natural language questions about any analyzed API and get instant, context-aware answers." />
}

export function HistoryPage() {
  return <ComingSoon title="Project History" desc="All your past API analyses and generated code files will be stored and accessible here." />
}

export function ProfilePage() {
  return <ComingSoon title="Profile Settings" desc="Manage your account details, company information, and developer preferences." />
}

export function SettingsPage() {
  return <ComingSoon title="App Settings" desc="Configure theme, language preferences, notifications, and API integrations." />
}
