const mongoose = require('mongoose')

const endpointSchema = new mongoose.Schema({
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] },
  path: String,
  summary: String,
  description: String,
  
  // CHANGED: Switched to Mixed array to gracefully accept any variation of OpenAPI parameters (including structures with example, schema, etc.)
  parameters: [mongoose.Schema.Types.Mixed],
  
  requestBody: mongoose.Schema.Types.Mixed,
  responses: mongoose.Schema.Types.Mixed,
  tags: [String],
}, { _id: false })

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true },
    documentationUrl: { type: String, required: true },
    useCase: { type: String, default: '' },
    language: { type: String, enum: ['javascript', 'python', 'java'], default: 'javascript' },
    status: { type: String, enum: ['pending', 'analyzing', 'complete', 'failed'], default: 'pending' },

    // Analysis results
    apiName: String,
    baseUrl: String,
    version: String,
    description: String,
    authType: { type: String, default: 'unknown' },
    authDetails: mongoose.Schema.Types.Mixed,
    endpoints: [endpointSchema],
    totalEndpoints: { type: Number, default: 0 },
    summary: String,

    // Generated code
    generatedFiles: [{ filename: String, content: String, language: String }],
    zipPath: String,

    errorMessage: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)