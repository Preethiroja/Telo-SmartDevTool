const Project = require('../models/Project')
const ChatSession = require('../models/ChatSession')
const { chatWithApi } = require('../utils/gemini')

// POST /api/chat  — send message, get AI reply
exports.sendMessage = async (req, res) => {
  const { message, projectId, sessionId } = req.body

  if (!message?.trim()) return res.status(400).json({ message: 'Message is required.' })

  try {
    // Load project context if provided
    let apiContext = {}
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, userId: req.userId })
        .select('apiName baseUrl version authType endpoints totalEndpoints summary')
      if (project) {
        apiContext = project.toObject()
      }
    }

    // Load or create chat session
    let session
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.userId })
    }
    if (!session) {
      session = await ChatSession.create({
        userId: req.userId,
        projectId: projectId || null,
        title: message.slice(0, 60),
        messages: [],
      })
    }

    // Add user message
    session.messages.push({ role: 'user', content: message })

    // Get AI response
    const aiReply = await chatWithApi(
      message,
      apiContext,
      session.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
    )

    // Add assistant message
    session.messages.push({ role: 'assistant', content: aiReply })
    await session.save()

    res.json({
      reply: aiReply,
      sessionId: session._id,
      messageCount: session.messages.length,
    })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ message: err.message || 'Chat failed. Please try again.' })
  }
}

// GET /api/chat/sessions  — list user's chat sessions
exports.listSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId })
      .select('title projectId createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20)

    res.json({
      sessions: sessions.map(s => ({
        _id: s._id,
        title: s.title,
        projectId: s.projectId,
        messageCount: s.messages.length,
        lastMessage: s.messages.at(-1)?.content?.slice(0, 80) || '',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat sessions.' })
  }
}

// GET /api/chat/sessions/:id  — get full session with messages
exports.getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.userId })
    if (!session) return res.status(404).json({ message: 'Session not found.' })
    res.json({ session })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session.' })
  }
}

// DELETE /api/chat/sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Session deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete session.' })
  }
}
