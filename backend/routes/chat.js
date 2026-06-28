const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { sendMessage, listSessions, getSession, deleteSession } = require('../controllers/chatController')

router.post('/', auth, sendMessage)
router.get('/sessions', auth, listSessions)
router.get('/sessions/:id', auth, getSession)
router.delete('/sessions/:id', auth, deleteSession)

module.exports = router
