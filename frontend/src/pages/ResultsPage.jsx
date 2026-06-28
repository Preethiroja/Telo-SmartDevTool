import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiFlashlightLine, RiCodeLine, RiMessage3Line, RiArrowRightLine,
  RiGlobalLine, RiShieldCheckLine, RiListCheck2, RiInformationLine,
  RiCheckLine, RiErrorWarningLine, RiLoader4Line, RiExternalLinkLine,
  RiFilterLine, RiSearchLine, RiArrowLeftLine
} from 'react-icons/ri'
import { useProject } from '../hooks/useProject'
import toast from 'react-hot-toast'

const METHOD_COLORS = {
  GET: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200',
  PATCH: 'bg-orange-100 text-orange-700 border-orange-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  HEAD: 'bg-gray-100 text-gray-700 border-gray-200',
  OPTIONS: 'bg-purple-100 text-purple-700 border-purple-200',
}

function MethodBadge({ method }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border font-mono ${METHOD_COLORS[method] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {method}
    </span>
  )
}

function AnalyzingState({ url }) {
  const steps = [
    'Fetching documentation...',
    'Detecting format (Swagger / OpenAPI / HTML)...',
    'Extracting endpoints and parameters...',
    'Identifying authentication method...',
    'Generating AI summary...',
    'Saving results...',
  ]
  const [step, setStep] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg">
        <RiLoader4Line size={28} className="text-white animate-spin" />
      </div>
      <h2 className="text-xl font-bold font-poppins text-gray-900 mb-2">Analyzing documentation</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-sm truncate">{url}</p>
      <div className="w-full max-w-xs space-y-2 text-left">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-25'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? 'bg-teal-500' : i === step ? 'bg-teal-200' : 'bg-gray-200'}`}>
              {i < step ? <RiCheckLine size={12} className="text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>
            <span className={i <= step ? 'text-gray-700' : 'text-gray-400'}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { project, loading, error } = useProject(id)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  if (loading || !project) return <div className="p-8"><AnalyzingState url="Loading..." /></div>
  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <RiErrorWarningLine size={40} className="text-red-400 mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-red-600 mb-6">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">← Back to dashboard</button>
    </div>
  )
  if (project.status === 'analyzing') return <div className="p-8"><AnalyzingState url={project.documentationUrl} /></div>
  if (project.status === 'failed') return (
    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <RiErrorWarningLine size={40} className="text-red-400 mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Analysis failed</h2>
      <p className="text-sm text-red-600 mb-2">{project.errorMessage}</p>
      <p className="text-xs text-gray-500 mb-6">Make sure the URL points to a Swagger spec or API reference page.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary"><RiArrowLeftLine /> Try another URL</button>
    </div>
  )

  const methods = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const filtered = (project.endpoints || []).filter(ep => {
    const matchMethod = filter === 'ALL' || ep.method === filter
    const matchSearch = !search || ep.path.toLowerCase().includes(search.toLowerCase()) || (ep.summary || '').toLowerCase().includes(search.toLowerCase())
    return matchMethod && matchSearch
  })

  const methodCounts = (project.endpoints || []).reduce((acc, ep) => {
    acc[ep.method] = (acc[ep.method] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 gap-4">
        <div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <RiArrowLeftLine size={16} /> Dashboard
          </button>
          <h1 className="text-2xl font-bold font-poppins text-gray-900">{project.apiName || 'API Analysis'}</h1>
          <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1">
            <RiExternalLinkLine size={12} /> {project.documentationUrl}
          </a>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => navigate(`/generator/${id}`)} className="btn-primary text-sm py-2">
            <RiCodeLine size={15} /> Generate code
          </button>
          <button onClick={() => navigate(`/chat?projectId=${id}`)} className="btn-secondary text-sm py-2">
            <RiMessage3Line size={15} /> Ask AI
          </button>
        </div>
      </motion.div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Base URL', value: project.baseUrl || 'Unknown', icon: RiGlobalLine, color: 'text-teal-600' },
          { label: 'Version', value: project.version || '—', icon: RiInformationLine, color: 'text-blue-600' },
          { label: 'Auth method', value: project.authType || 'None detected', icon: RiShieldCheckLine, color: 'text-violet-600' },
          { label: 'Total endpoints', value: project.totalEndpoints || project.endpoints?.length || 0, icon: RiListCheck2, color: 'text-amber-600' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-4">
            <div className={`text-xs font-medium mb-1 ${card.color} flex items-center gap-1`}>
              <card.icon size={13} /> {card.label}
            </div>
            <div className="text-sm font-semibold text-gray-900 truncate">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Summary */}
      {project.summary && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card-dark p-5 mb-6">
          <div className="flex items-center gap-2 mb-3 text-teal-700 font-semibold text-sm">
            <RiFlashlightLine size={16} /> AI Summary
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{project.summary}</p>
        </motion.div>
      )}

      {/* Endpoints table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between mb-4">
            <h2 className="font-semibold font-poppins text-gray-900">
              Endpoints <span className="text-gray-400 font-normal text-sm">({filtered.length} shown)</span>
            </h2>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search endpoints..."
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none w-52" />
            </div>
          </div>

          {/* Method filter pills */}
          <div className="flex gap-2 flex-wrap">
            {methods.map(m => (
              <button key={m} onClick={() => setFilter(m)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${filter === m ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                {m} {m !== 'ALL' && methodCounts[m] ? `(${methodCounts[m]})` : m === 'ALL' ? `(${project.endpoints?.length || 0})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No endpoints match your filter</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Path</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Summary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell w-28">Tags</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((ep, i) => (
                  <React.Fragment key={i}>
                    <tr
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      className={`border-b border-gray-50 hover:bg-teal-50/40 cursor-pointer transition-colors ${expandedRow === i ? 'bg-teal-50/60' : ''}`}>
                      <td className="px-5 py-3"><MethodBadge method={ep.method} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800 max-w-xs truncate">{ep.path}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">{ep.summary || ep.description || '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {(ep.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">{t}</span>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{expandedRow === i ? '▲' : '▼'}</td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === i && (
                        <tr>
                          <td colSpan={5} className="px-5 pb-4 bg-teal-50/40">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="pt-3 grid md:grid-cols-2 gap-4">
                              {ep.description && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-500 mb-1">Description</div>
                                  <p className="text-sm text-gray-700">{ep.description}</p>
                                </div>
                              )}
                              {ep.parameters?.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-500 mb-2">Parameters</div>
                                  <div className="space-y-1">
                                    {ep.parameters.map((p, pi) => (
                                      <div key={pi} className="flex items-center gap-2 text-xs">
                                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{p.name}</span>
                                        <span className="text-gray-400 italic">{p.in}</span>
                                        {p.required && <span className="text-red-500 font-semibold">*</span>}
                                        <span className="text-gray-500">{p.type}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {ep.responses?.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-500 mb-2">Responses</div>
                                  <div className="flex gap-2 flex-wrap">
                                    {ep.responses.map((r, ri) => (
                                      <span key={ri} className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${r.statusCode?.startsWith('2') ? 'bg-emerald-100 text-emerald-700' : r.statusCode?.startsWith('4') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {r.statusCode} {r.description && `— ${r.description.slice(0, 40)}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Bottom actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mt-6">
        <button onClick={() => navigate(`/generator/${id}`)} className="btn-primary flex-1 justify-center py-3">
          <RiCodeLine /> Generate {project.language || 'JavaScript'} client
        </button>
        <button onClick={() => navigate(`/chat?projectId=${id}`)} className="btn-secondary flex-1 justify-center py-3">
          <RiMessage3Line /> Chat with AI about this API
        </button>
      </motion.div>
    </div>
  )
}
