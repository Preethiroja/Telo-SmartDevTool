import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiHistoryLine, RiArrowRightLine, RiDeleteBinLine, RiSearchLine,
  RiCodeLine, RiMessage3Line, RiCheckLine, RiLoader4Line,
  RiErrorWarningLine, RiTimeLine, RiFileTextLine, RiAddLine
} from 'react-icons/ri'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  complete: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700', icon: RiCheckLine },
  analyzing: { label: 'Analyzing', color: 'bg-blue-100 text-blue-700', icon: RiLoader4Line },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: RiErrorWarningLine },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: RiTimeLine },
}

const LANG_ICONS = { javascript: '🟨', python: '🐍', java: '☕' }

export default function HistoryPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get('/analyze')
      .then(r => setProjects(r.data.projects || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await api.delete(`/analyze/${id}`)
      setProjects(prev => prev.filter(p => p._id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = projects.filter(p =>
    !search ||
    (p.apiName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.documentationUrl || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <RiLoader4Line size={28} className="animate-spin text-teal-500" />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-gray-900">Project history</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} projects total</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2">
          <RiAddLine size={15} /> New analysis
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by API name or URL..."
          className="input-field pl-10 max-w-md" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            {search ? <RiSearchLine size={24} className="text-gray-400" /> : <RiHistoryLine size={24} className="text-gray-400" />}
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">{search ? 'No projects match your search' : 'No projects yet'}</h3>
          <p className="text-sm text-gray-400 mb-6">
            {search ? 'Try a different search term' : 'Analyze your first API documentation to get started'}
          </p>
          {!search && (
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
              <RiAddLine /> Analyze an API
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((p, i) => {
              const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => p.status === 'complete' && navigate(`/results/${p._id}`)}
                  className={`glass-card p-5 flex items-center gap-4 group transition-all ${p.status === 'complete' ? 'cursor-pointer hover:shadow-md hover:border-teal-100' : ''}`}>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                    {LANG_ICONS[p.language] || '📄'}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {p.apiName || 'Analyzing...'}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                        <StatusIcon size={11} className={p.status === 'analyzing' ? 'animate-spin' : ''} />
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-2">{p.documentationUrl}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {p.totalEndpoints > 0 && <span className="flex items-center gap-1"><RiFileTextLine size={12} />{p.totalEndpoints} endpoints</span>}
                      {p.authType && p.authType !== 'unknown' && <span className="flex items-center gap-1">🔒 {p.authType}</span>}
                      <span className="flex items-center gap-1"><RiTimeLine size={12} />{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.status === 'complete' && (
                      <>
                        <button onClick={e => { e.stopPropagation(); navigate(`/generator/${p._id}`) }}
                          className="p-2 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-all" title="Generate code">
                          <RiCodeLine size={16} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate(`/chat?projectId=${p._id}`) }}
                          className="p-2 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-all" title="Chat about this API">
                          <RiMessage3Line size={16} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate(`/results/${p._id}`) }}
                          className="p-2 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-all group-hover:text-teal-500">
                          <RiArrowRightLine size={16} />
                        </button>
                      </>
                    )}
                    <button onClick={e => handleDelete(p._id, e)}
                      disabled={deleting === p._id}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all ml-1">
                      {deleting === p._id ? <RiLoader4Line size={16} className="animate-spin" /> : <RiDeleteBinLine size={16} />}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
