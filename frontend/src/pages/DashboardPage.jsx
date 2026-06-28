import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiFolderLine, RiFileTextLine, RiDownloadLine, RiTimeLine,
  RiArrowRightLine, RiGlobalLine, RiCodeLine, RiFlashlightLine,
  RiAddLine, RiHistoryLine, RiCheckLine
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'
import api from '../utils/api'

const languages = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨', desc: 'ES2022, Node.js' },
  { id: 'python', label: 'Python', icon: '🐍', desc: 'Python 3.10+' },
  { id: 'java', label: 'Java', icon: '☕', desc: 'Java 17, Spring' },
]

const EXAMPLE_URLS = [
  { label: 'Petstore (Swagger)', url: 'https://petstore.swagger.io/v2/swagger.json' },
  { label: 'HTTPBin', url: 'https://httpbin.org/spec.json' },
  { label: 'GitHub API', url: 'https://api.github.com' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stats } = useStats()

  const [form, setForm] = useState({ url: '', useCase: '', language: 'javascript' })
  const [loading, setLoading] = useState(false)
  const [urlError, setUrlError] = useState('')

  const statCards = [
    { label: 'Total projects', value: stats.totalProjects, icon: RiFolderLine, color: 'bg-teal-50 text-teal-600' },
    { label: 'APIs analyzed', value: stats.apisAnalyzed, icon: RiFileTextLine, color: 'bg-blue-50 text-blue-600' },
    { label: 'Generated files', value: stats.generatedFiles, icon: RiDownloadLine, color: 'bg-violet-50 text-violet-600' },
    {
      label: 'Last activity',
      value: stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Never',
      icon: RiTimeLine,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!form.url.trim()) { setUrlError('Please enter an API documentation URL'); return }
    try { new URL(form.url) } catch { setUrlError('Enter a valid URL (include https://)'); return }
    setUrlError('')
    setLoading(true)
    try {
      const res = await api.post('/analyze', form)
      toast.success('Analysis started!')
      navigate(`/results/${res.data.projectId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-900 mb-1">
          {greeting()}, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-gray-500 text-sm">Paste an API docs URL to get production-ready code instantly.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-bold font-poppins text-gray-900 mb-0.5">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Analyze Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 lg:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <RiFlashlightLine size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold font-poppins text-gray-900">Analyze API documentation</h2>
            <p className="text-xs text-gray-500">Supports Swagger, OpenAPI, and HTML reference pages</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API documentation URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <RiGlobalLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="url"
                value={form.url}
                onChange={e => { setForm({ ...form, url: e.target.value }); setUrlError('') }}
                placeholder="https://api.example.com/docs or /swagger.json"
                className={`input-field pl-10 ${urlError ? 'border-red-300 focus:ring-red-100' : ''}`}
              />
            </div>
            {urlError && <p className="text-xs text-red-500 mt-1.5">{urlError}</p>}
            <div className="flex gap-2 mt-2 flex-wrap">
              {EXAMPLE_URLS.map(ex => (
                <button key={ex.url} type="button"
                  onClick={() => setForm({ ...form, url: ex.url })}
                  className="text-xs text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all border border-teal-100">
                  Try: {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Use case <span className="text-gray-400 font-normal">(optional — improves code quality)</span>
            </label>
            <textarea
              value={form.useCase}
              onChange={e => setForm({ ...form, useCase: e.target.value })}
              placeholder="e.g. I need to create users, process payments, and handle webhooks..."
              rows={3} className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target language</label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map(lang => (
                <button key={lang.id} type="button" onClick={() => setForm({ ...form, language: lang.id })}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    form.language === lang.id
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50'
                  }`}>
                  <span className="text-lg">{lang.icon}</span>
                  <div className="text-left">
                    <div>{lang.label}</div>
                    <div className="text-xs text-gray-400 font-normal">{lang.desc}</div>
                  </div>
                  {form.language === lang.id && <RiCheckLine size={16} className="ml-auto text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.99 } : {}}
            className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20">
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting for analysis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RiFlashlightLine /> Analyze & generate <RiArrowRightLine />
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: RiHistoryLine, color: 'bg-violet-50 text-violet-600', title: 'Project history', desc: 'View past analyses', to: '/history' },
          { icon: RiCodeLine, color: 'bg-teal-50 text-teal-600', title: 'Code generator', desc: 'Regenerate from saved projects', to: '/generator' },
        ].map((item, i) => (
          <motion.button key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => navigate(item.to)} className="glass-card p-5 text-left hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
              <RiArrowRightLine className="text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
