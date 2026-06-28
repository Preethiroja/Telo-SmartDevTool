require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://telo.vercel.app',
  'https://telo-app.vercel.app',
]
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS denied'))),
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/analyze', require('./routes/analyze'))
app.use('/api/generate', require('./routes/generate'))
app.use('/api/chat', require('./routes/chat'))

app.get('/api/health', (req, res) => res.json({
  status: 'ok', service: 'telo-api', version: '1.0.0',
  timestamp: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}))

app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` }))
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    console.log('⚠️  Running without DB — auth will not work')
  }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 TELO API → http://localhost:${PORT}`)
    console.log(`📡 Env: ${process.env.NODE_ENV || 'development'}`)
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`)
  })
})
