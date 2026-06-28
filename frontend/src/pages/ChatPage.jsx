import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiRobot2Line, RiSendPlaneLine, RiLoader4Line, RiMessage3Line,
  RiAddLine, RiDeleteBinLine, RiHistoryLine, RiCodeLine,
  RiArrowRightLine, RiUserLine
} from 'react-icons/ri'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STARTERS = [
  'How do I authenticate with this API?',
  'Show me a POST request example in JavaScript',
  'What endpoints are available for users?',
  'How do I handle rate limits?',
  'Show me how to paginate results',
  'What are the response formats?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0 mt-0.5">
          <RiRobot2Line size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
        ? 'bg-teal-500 text-white rounded-br-sm'
        : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'}`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className={`text-xs mt-2 ${isUser ? 'text-teal-100' : 'text-gray-400'}`}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <RiUserLine size={15} className="text-teal-600" />
        </div>
      )}
    </motion.div>
  )
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [project, setProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    api.get('/chat/sessions').then(r => setSessions(r.data.sessions || [])).catch(() => {})
    api.get('/analyze').then(r => setProjects(r.data.projects?.filter(p => p.status === 'complete') || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      api.get(`/analyze/${selectedProjectId}`).then(r => setProject(r.data.project)).catch(() => {})
    }
  }, [selectedProjectId])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setSending(true)
    try {
      const res = await api.post('/chat', {
        message: msg,
        projectId: selectedProjectId || null,
        sessionId,
      })
      setSessionId(res.data.sessionId)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, timestamp: new Date() }])
      // Refresh sessions list
      api.get('/chat/sessions').then(r => setSessions(r.data.sessions || [])).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get response')
      setMessages(prev => prev.slice(0, -1)) // remove optimistic user msg
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const loadSession = async (sid) => {
    try {
      const res = await api.get(`/chat/sessions/${sid}`)
      const s = res.data.session
      setSessionId(s._id)
      setMessages(s.messages || [])
      if (s.projectId) setSelectedProjectId(s.projectId)
    } catch {
      toast.error('Failed to load session')
    }
  }

  const newChat = () => {
    setMessages([])
    setSessionId(null)
    setInput('')
  }

  const deleteSession = async (sid, e) => {
    e.stopPropagation()
    await api.delete(`/chat/sessions/${sid}`).catch(() => {})
    setSessions(prev => prev.filter(s => s._id !== sid))
    if (sessionId === sid) newChat()
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — chat history */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r border-gray-100 bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <button onClick={newChat} className="w-full btn-primary text-sm py-2 justify-center">
                <RiAddLine size={15} /> New chat
              </button>
            </div>

            {/* Project context selector */}
            <div className="p-3 border-b border-gray-100">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">API context</label>
              <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none text-gray-700">
                <option value="">General (no API context)</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.apiName || p.documentationUrl?.slice(0, 35)}</option>
                ))}
              </select>
              {project && <p className="text-xs text-teal-600 mt-1 truncate">📌 {project.apiName} · {project.totalEndpoints} endpoints</p>}
            </div>

            {/* Past sessions */}
            <div className="flex-1 overflow-y-auto p-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">History</p>
              {sessions.length === 0 ? (
                <p className="text-xs text-gray-400 px-2 py-4 text-center">No past chats yet</p>
              ) : sessions.map(s => (
                <button key={s._id} onClick={() => loadSession(s._id)}
                  className={`w-full text-left px-2.5 py-2.5 rounded-xl group flex items-start gap-2 transition-all mb-0.5 ${sessionId === s._id ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <RiMessage3Line size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{s.title || 'Chat session'}</div>
                    <div className="text-xs text-gray-400 truncate">{s.lastMessage}</div>
                  </div>
                  <button onClick={(e) => deleteSession(s._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all flex-shrink-0">
                    <RiDeleteBinLine size={12} />
                  </button>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-all">
            <RiHistoryLine size={18} />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">AI Chat Assistant</h2>
            {project && <p className="text-xs text-teal-600">Context: {project.apiName}</p>}
          </div>
          {projectId && (
            <button onClick={() => navigate(`/results/${projectId}`)} className="btn-ghost text-xs py-1.5">
              <RiArrowRightLine size={13} /> View results
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4 shadow-lg">
                <RiRobot2Line size={28} className="text-white" />
              </div>
              <h3 className="font-bold font-poppins text-gray-900 text-lg mb-2">
                {project ? `Ask me about ${project.apiName}` : 'Ask me anything about APIs'}
              </h3>
              <p className="text-gray-500 text-sm mb-8 max-w-sm">
                {project
                  ? `I have full context of ${project.totalEndpoints} endpoints, authentication, and documentation.`
                  : 'Select an analyzed project from the sidebar to get context-aware answers.'}
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    className="text-left text-xs bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 px-4 py-3 rounded-xl text-gray-600 hover:text-teal-700 transition-all shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <Message key={i} msg={msg} />)
          )}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                <RiRobot2Line size={16} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={project ? `Ask about ${project.apiName}...` : 'Ask anything about APIs...'}
              rows={1}
              style={{ resize: 'none', minHeight: 44, maxHeight: 120 }}
              className="flex-1 input-field py-3 text-sm"
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
            <motion.button onClick={() => send()} disabled={sending || !input.trim()}
              whileHover={!sending ? { scale: 1.05 } : {}} whileTap={!sending ? { scale: 0.95 } : {}}
              className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
              {sending ? <RiLoader4Line size={18} className="animate-spin" /> : <RiSendPlaneLine size={18} />}
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
