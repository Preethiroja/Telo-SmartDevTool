import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  RiCodeLine, RiFileTextLine, RiShieldCheckLine, RiFolderZipLine,
  RiRobot2Line, RiArrowRightLine, RiCheckLine,
  RiFlashlightLine, RiApps2Line, RiDownloadLine, RiMessage3Line,
  RiGlobalLine, RiLockLine, RiTerminalLine
} from 'react-icons/ri'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import VideoModal from '../components/ui/VideoModal' 

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

function Section({ children, className = '', id = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─── Hero terminal animation ─── */
const codeLines = [
  { text: '$ telo analyze https://api.stripe.com/docs', color: '#14b8a6' },
  { text: '✓ Detected 47 endpoints', color: '#a7f3d0' },
  { text: '✓ Auth: Bearer Token (JWT)', color: '#a7f3d0' },
  { text: '✓ Generating JavaScript client...', color: '#fde68a' },
  { text: '', color: '' },
  { text: 'PaymentsService.js   ✓', color: '#d1fae5' },
  { text: 'ChargesService.js    ✓', color: '#d1fae5' },
  { text: 'SubscriptionDTO.js   ✓', color: '#d1fae5' },
  { text: '', color: '' },
  { text: '📦 stripe-client.zip ready for download', color: '#14b8a6' },
]

function TerminalDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative max-w-lg w-full"
    >
      <div className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-3xl" />
      <div className="relative bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-gray-500 font-mono">telo — terminal</span>
        </div>
        {/* Code */}
        <div className="p-5 font-mono text-sm space-y-1.5 min-h-[240px]">
          {codeLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.18, duration: 0.3 }}
              style={{ color: line.color || '#6b7280' }}
            >
              {line.text || '\u00A0'}
            </motion.div>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block w-2 h-4 bg-teal-400 ml-0.5"
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Features ─── */
const features = [
  {
    icon: RiFileTextLine,
    title: 'Documentation analysis',
    desc: 'Paste any URL — Swagger, OpenAPI, or plain HTML docs. Telo scrapes, parses, and understands the full API surface in seconds.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Auth detection',
    desc: 'Automatically identifies Bearer tokens, API keys, OAuth2 flows, and Basic auth — no manual configuration needed.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: RiCodeLine,
    title: 'Code generation',
    desc: 'Generate production-ready clients in Java, Python, or JavaScript with services, DTOs, configs, and error handling built in.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: RiRobot2Line,
    title: 'AI chat assistant',
    desc: 'Ask natural language questions about any API — "how do I paginate results?" or "show me a POST example" — and get precise answers.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: RiFolderZipLine,
    title: 'ZIP download',
    desc: 'Download the complete integration package: service files, DTOs, config, and a README — ready to drop into your project.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: RiApps2Line,
    title: 'Project history',
    desc: 'Every analysis is saved. Revisit past projects, regenerate code in a different language, or share results with your team.',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

/* ─── Steps ─── */
const steps = [
  {
    n: '01',
    title: 'Paste the URL',
    desc: 'Drop in any API documentation URL. Swagger, Postman collections, or plain HTML reference pages all work.',
    icon: RiGlobalLine,
  },
  {
    n: '02',
    title: 'AI analyzes',
    desc: 'Telo extracts all endpoints, parameters, response schemas, and auth requirements automatically.',
    icon: RiFlashlightLine,
  },
  {
    n: '03',
    title: 'Generate code',
    desc: "Choose your language and use case. Get a complete client library tailored to how you'll actually use the API.",
    icon: RiTerminalLine,
  },
  {
    n: '04',
    title: 'Download & ship',
    desc: 'Download the ZIP, drop it in your project, and start calling the API. No manual work required.',
    icon: RiDownloadLine,
  },
]

/* ─── Stats ─── */
const stats = [
  { value: '47+', label: 'Endpoints per doc, on average' },
  { value: '<2m', label: 'From URL to working code' },
  { value: '3', label: 'Languages supported' },
  { value: '100%', label: 'Production-ready output' },
]

/* ─── Main Component ─── */
export default function LandingPage() {
  const navigate = useNavigate()
  const featuresRef = useRef(null)
  
  // Modal toggle state variable
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  // UPDATED: Linked to your newly uploaded demo video stream ID
  const demoVideoUrl = "https://www.youtube.com/embed/_PlPp6_Vq0Y?autoplay=1&rel=0"

  const handleGetStarted = () => {
    const token = localStorage.getItem('telo_token')
    navigate(token ? '/dashboard' : '/register')
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28 bg-mesh">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container-max section-padding relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200 mb-6"
              >
                <RiFlashlightLine size={13} />
                Powered by Gemini AI
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins text-gray-900 leading-tight mb-5"
              >
                Generate API integrations{' '}
                <span className="gradient-text">in seconds</span>{' '}
                using AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
              >
                Paste any API documentation URL and get production-ready code instantly. No manual reading, no boilerplate — just working integrations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetStarted}
                  className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-teal-500/20"
                >
                  Get started free
                  <RiArrowRightLine />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsDemoOpen(true)} 
                  className="btn-secondary text-base px-8 py-3.5"
                >
                  Watch demo
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center gap-6 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {['#14b8a6', '#0f766e', '#2dd4bf', '#5eead4'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: c }}
                    >
                      {['D', 'A', 'R', 'M'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">2,400+</span> developers ship faster with Telo
                </div>
              </motion.div>
            </div>

            {/* Right — Terminal */}
            <div className="flex-shrink-0 w-full max-w-lg">
              <TerminalDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="container-max section-padding py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold font-poppins gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <Section id="features" ref={featuresRef} className="py-24 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-poppins text-gray-900 mt-3 mb-4">
              Everything you need to integrate any API
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From documentation parsing to production-ready code, Telo handles the entire API integration workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 cursor-default group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold font-poppins text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section id="workflow" className="py-24 bg-gray-50/60 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-poppins text-gray-900 mt-3 mb-4">
              From URL to production code
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Four steps. Under two minutes. No manual work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-5">
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <step.icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-teal-400 text-teal-700 text-xs font-bold flex items-center justify-center font-poppins">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold font-poppins text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── AI Feature highlight ── */}
      <Section className="py-24 section-padding">
        <div className="container-max">
          <div className="glass-card-dark p-8 lg:p-14 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">AI assistant</span>
              <h2 className="text-3xl font-bold font-poppins text-gray-900 mt-3 mb-5">
                Ask anything about any API
              </h2>
              <p className="text-gray-500 leading-relaxed mb-7">
                Telo\'s AI assistant uses the analyzed documentation as context, so it understands your exact API — not just generic knowledge. Get code examples, error explanations, and integration advice instantly.
              </p>
              <ul className="space-y-3">
                {[
                  'How do I authenticate with this API?',
                  'Show me a POST /users example in Python',
                  'What happens when I hit rate limits?',
                  'How do I handle pagination?',
                ].map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                      <RiCheckLine size={11} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-600">{q}</span>
                  </motion.div>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="btn-primary mt-8"
              >
                <RiMessage3Line />
                Try the AI chat
              </motion.button>
            </div>

            {/* Mock chat */}
            <div className="flex-shrink-0 w-full max-w-sm">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <RiRobot2Line size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Telo AI</div>
                    <div className="text-xs text-teal-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 min-h-[200px]">
                  {[
                    { role: 'user', text: 'How do I create a new payment?' },
                    { role: 'ai', text: 'Use POST /v1/payments with your Bearer token. Here\'s a JS example:\n\nawait api.post(\'/payments\', {\n  amount: 5000,\n  currency: \'usd\'\n})' },
                    { role: 'user', text: 'What currency codes are supported?' },
                    { role: 'ai', text: 'The API supports 135 currencies. Common ones: usd, eur, gbp, inr, jpy. Full list in the /currencies endpoint.' },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-teal-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-700 rounded-bl-sm font-mono'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <span className="text-xs text-gray-400 flex-1">Ask anything about this API...</span>
                    <RiArrowRightLine size={14} className="text-teal-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <Section className="py-20 section-padding">
        <div className="container-max">
          <div className="gradient-bg rounded-3xl px-8 py-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-white text-4xl font-mono opacity-50">{'<>'}</div>
              <div className="absolute bottom-4 right-8 text-white text-4xl font-mono opacity-50">{'</>'}</div>
              <div className="absolute top-1/2 left-4 text-white text-2xl font-mono opacity-30">{'{ }'}</div>
              <div className="absolute top-1/4 right-12 text-white text-2xl font-mono opacity-30">{'[ ]'}</div>
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold font-poppins text-white mb-4">
                Ready to ship integrations faster?
              </h2>
              <p className="text-teal-100 mb-8 max-w-md mx-auto">
                Join thousands of developers who use Telo to turn API docs into production code in minutes, not days.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetStarted}
                  className="bg-white text-teal-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-teal-50 transition-all shadow-lg"
                >
                  Get started free
                </motion.button>
                <button className="text-teal-100 hover:text-white font-medium text-sm transition-colors flex items-center gap-1">
                  <RiLockLine size={14} />
                  No credit card required
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Footer />

      {/* ── Overlay Modal ── */}
      <VideoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
        videoUrl={demoVideoUrl} 
      />
    </div>
  )
}