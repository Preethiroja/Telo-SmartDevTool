const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  startAnalysis,
  getProject,
  listProjects,
  deleteProject,
  getStats,
} = require('../controllers/analyzeController')

router.get('/stats', auth, getStats)
router.post('/', auth, startAnalysis)
router.get('/', auth, listProjects)
router.get('/:id', auth, getProject)
router.delete('/:id', auth, deleteProject)

module.exports = router
