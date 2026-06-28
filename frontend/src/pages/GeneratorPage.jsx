import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiCodeLine, RiDownloadLine, RiFileCopyLine, RiCheckLine,
  RiLoader4Line, RiArrowLeftLine, RiFlashlightLine, RiFileCodeLine,
  RiJavascriptLine, RiTerminalLine
} from 'react-icons/ri'
import api from '../utils/api'
import toast from 'react-hot-toast'

const LANG_OPTIONS = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨', ext: 'js' },
  { id: 'python', label: 'Python', icon: '🐍', ext: 'py' },
  { id: 'java', label: 'Java', icon: '☕', ext: 'java' },
]

const LANG_COLORS = {
  javascript: 'text-yellow-600 bg-yellow-50',
  python: 'text-blue-600 bg-blue-50',
  java: 'text-orange-600 bg-orange-50',
}

function CodeBlock({ content, filename }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ext = filename?.split('.').pop() || ''
  const isMarkdown = ext === 'md'

  return (
    <div className="relative h-full">
      <button onClick={copy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-all border border-white/10">
        {copied ? <><RiCheckLine size={13} className="text-teal-400" /> Copied!</> : <><RiFileCopyLine size={13} /> Copy</>}
      </button>
      {isMarkdown ? (
        <div className="bg-white rounded-xl p-6 h-full overflow-auto border border-gray-200">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
        </div>
      ) : (
        <div className="bg-gray-950 rounded-xl h-full overflow-auto border border-gray-800">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-gray-500 font-mono">{filename}</span>
          </div>
          <pre className="p-5 text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
            <code>{content}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default function GeneratorPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [projectList, setProjectList] = useState([])
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [loadingProject, setLoadingProject] = useState(false)

  // Load project list if no ID in URL
  useEffect(() => {
    if (!projectId) {
      api.get('/analyze').then(r => setProjectList(r.data.projects || [])).catch(() => {})
    }
  }, [projectId])

  // Load project + existing files if ID provided
  useEffect(() => {
    if (!projectId) return
    setLoadingProject(true)
    api.get(`/analyze/${projectId}`)
      .then(r => {
        setProject(r.data.project)
        setSelectedLang(r.data.project.language || 'javascript')
      })
      .catch(() => toast.error('Project not found'))
      .finally(() => setLoadingProject(false))

    api.get(`/generate/${projectId}/files`)
      .then(r => { if (r.data.files?.length) setFiles(r.data.files) })
      .catch(() => {})
  }, [projectId])

  const handleGenerate = async () => {
    const pid = projectId || selectedProject
    if (!pid) { toast.error('Select a project first'); return }
    setGenerating(true)
    try {
      const res = await api.post(`/generate/${pid}`, { language: selectedLang })
      setFiles(res.data.files || [])
      setActiveFile(0)
      toast.success(`${res.data.files?.length || 0} files generated!`)
      if (!projectId) navigate(`/generator/${pid}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    const pid = projectId || selectedProject
    if (!pid) return
    setDownloading(true)
    try {
      const res = await api.get(`/generate/${pid}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.apiName?.toLowerCase().replace(/\s+/g, '-') || 'api'}-client.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('ZIP downloaded!')
    } catch (err) {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const currentFile = files[activeFile]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          {projectId && (
            <button onClick={() => navigate(`/results/${projectId}`)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-1.5">
              <RiArrowLeftLine size={16} /> Back to results
            </button>
          )}
          <h1 className="text-2xl font-bold font-poppins text-gray-900">Code Generator</h1>
          {project && <p className="text-sm text-gray-500 mt-0.5">{project.apiName} · {project.totalEndpoints} endpoints</p>}
        </div>
        <div className="flex gap-2">
          {files.length > 0 && (
            <button onClick={handleDownload} disabled={downloading} className="btn-secondary text-sm py-2">
              {downloading ? <RiLoader4Line className="animate-spin" size={15} /> : <RiDownloadLine size={15} />}
              Download ZIP
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left panel — controls */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Project picker (if no project in URL) */}
          {!projectId && (
            <div className="glass-card p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select project</label>
              {projectList.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">
                  No analyzed projects yet.{' '}
                  <button onClick={() => navigate('/dashboard')} className="text-teal-600 hover:underline">Analyze one →</button>
                </div>
              ) : (
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                  className="input-field text-sm py-2">
                  <option value="">Choose a project...</option>
                  {projectList.filter(p => p.status === 'complete').map(p => (
                    <option key={p._id} value={p._id}>{p.apiName || p.documentationUrl.slice(0, 40)}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Language selector */}
          <div className="glass-card p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Target language</label>
            <div className="space-y-2">
              {LANG_OPTIONS.map(lang => (
                <button key={lang.id} onClick={() => setSelectedLang(lang.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${selectedLang === lang.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  <span className="text-lg">{lang.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{lang.label}</div>
                    <div className="text-xs text-gray-400 font-normal">.{lang.ext} files</div>
                  </div>
                  {selectedLang === lang.id && <RiCheckLine size={16} className="ml-auto text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <motion.button onClick={handleGenerate} disabled={generating || loadingProject}
            whileHover={!generating ? { scale: 1.01 } : {}} whileTap={!generating ? { scale: 0.99 } : {}}
            className="w-full btn-primary justify-center py-3.5 text-sm disabled:opacity-60 shadow-lg shadow-teal-500/20">
            {generating ? (
              <><RiLoader4Line className="animate-spin" size={16} /> Generating code...</>
            ) : (
              <><RiFlashlightLine size={16} /> {files.length ? 'Regenerate' : 'Generate'} code</>
            )}
          </motion.button>

          {/* File list */}
          {files.length > 0 && (
            <div className="glass-card p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Generated files</div>
              <div className="space-y-1">
                {files.map((f, i) => (
                  <button key={i} onClick={() => setActiveFile(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${activeFile === i ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <RiFileCodeLine size={14} className="flex-shrink-0 text-teal-500" />
                    <span className="truncate font-mono">{f.filename}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right panel — code viewer */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-h-0 min-w-0">
          {generating ? (
            <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                <RiLoader4Line size={26} className="text-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-1">Generating {LANG_OPTIONS.find(l => l.id === selectedLang)?.label} client...</p>
                <p className="text-sm text-gray-500">Gemini AI is writing your production-ready code</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <RiCodeLine size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">No code generated yet</p>
                <p className="text-sm text-gray-400">Select a language and click Generate to create your client library</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[500px] gap-0">
              {/* File tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {files.map((f, i) => (
                  <button key={i} onClick={() => setActiveFile(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-mono whitespace-nowrap transition-all border-b-2 ${activeFile === i ? 'bg-gray-950 text-gray-200 border-teal-500' : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}>
                    <RiFileCodeLine size={12} />
                    {f.filename}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeFile} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }} className="h-full">
                    <CodeBlock content={currentFile?.content || ''} filename={currentFile?.filename} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
