const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { generateCode, downloadZip, getGeneratedFiles } = require('../controllers/generateController')

router.post('/:projectId', auth, generateCode)
router.get('/:projectId/download', auth, downloadZip)
router.get('/:projectId/files', auth, getGeneratedFiles)

module.exports = router
