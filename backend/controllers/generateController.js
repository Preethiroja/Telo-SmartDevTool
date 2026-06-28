const Project = require('../models/Project')
const { generateClientCode } = require('../utils/gemini')
const { generateZip } = require('../utils/zipGenerator')

// POST /api/generate/:projectId
exports.generateCode = async (req, res) => {
  const { language } = req.body
  const { projectId } = req.params

  try {
    const project = await Project.findOne({ _id: projectId, userId: req.userId })
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    if (project.status !== 'complete') {
      return res.status(400).json({ message: 'Project analysis must be complete before generating code.' })
    }

    const lang = language || project.language || 'javascript'

    // Generate code via Gemini
    const files = await generateClientCode(
      {
        apiName: project.apiName,
        baseUrl: project.baseUrl,
        version: project.version,
        authType: project.authType,
        endpoints: project.endpoints,
        totalEndpoints: project.totalEndpoints,
        documentationUrl: project.documentationUrl,
        language: lang,
      },
      lang,
      project.useCase
    )

    // Save generated files to project
    await Project.findByIdAndUpdate(projectId, {
      generatedFiles: files,
      language: lang,
    })

    res.json({ files, language: lang, projectId })
  } catch (err) {
    console.error('Code generation error:', err)
    res.status(500).json({ message: err.message || 'Code generation failed.' })
  }
}

// GET /api/generate/:projectId/download  — stream ZIP
exports.downloadZip = async (req, res) => {
  const { projectId } = req.params

  try {
    const project = await Project.findOne({ _id: projectId, userId: req.userId })
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    if (!project.generatedFiles || project.generatedFiles.length === 0) {
      return res.status(400).json({ message: 'No generated files found. Please generate code first.' })
    }

    const zipBuffer = await generateZip(project.generatedFiles, {
      apiName: project.apiName,
      baseUrl: project.baseUrl,
      version: project.version,
      authType: project.authType,
      totalEndpoints: project.totalEndpoints,
      language: project.language,
      documentationUrl: project.documentationUrl,
    })

    const safeName = (project.apiName || 'api-client')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}-client.zip"`,
      'Content-Length': zipBuffer.length,
    })
    res.send(zipBuffer)
  } catch (err) {
    console.error('ZIP download error:', err)
    res.status(500).json({ message: 'Failed to generate ZIP file.' })
  }
}

// GET /api/generate/:projectId/files  — get already-generated files
exports.getGeneratedFiles = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.userId })
      .select('generatedFiles language apiName status')
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    res.json({ files: project.generatedFiles || [], language: project.language, apiName: project.apiName })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files.' })
  }
}
