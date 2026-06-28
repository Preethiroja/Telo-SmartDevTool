const Project = require('../models/Project');
const { scrapeDocumentation } = require('../utils/scraper');
const { parseOpenApiSpec } = require('../utils/openApiParser');

// Safe explicit import binding strategy to bypass module reference bugs
const geminiUtils = require('../utils/gemini');
const generateApiSummary = geminiUtils.generateApiSummary;
const extractEndpointsWithAi = geminiUtils.extractEndpointsWithAi;

// POST /api/analyze
exports.startAnalysis = async (req, res) => {
  const { url, useCase, language } = req.body;

  if (!url) return res.status(400).json({ message: 'Documentation URL is required.' });

  try { 
    new URL(url); 
  } catch {
    return res.status(400).json({ message: 'Please provide a valid URL including https://' });
  }

  // Create project record immediately so frontend has an ID to poll
  const project = await Project.create({
    userId: req.userId,
    documentationUrl: url,
    useCase: useCase || '',
    language: language || 'javascript',
    status: 'analyzing',
    name: `Analysis ${new Date().toLocaleDateString()}`,
  });

  // Run analysis async — respond immediately with project ID
  res.status(202).json({ projectId: project._id, status: 'analyzing' });

  // Background processing
  runAnalysis(project._id, url, useCase).catch(err => {
    console.error('Background analysis error:', err);
  });
};

async function runAnalysis(projectId, url, useCase) {
  try {
    // 1. Scrape the targeted URL structure
    const scraped = await scrapeDocumentation(url);

    // Safeguard check: If scraper returns absolutely nothing or drops out
    if (!scraped) {
      throw new Error("Could not parse documentation. Target server returned an empty payload.");
    }

    let parsedData;
    if (scraped.type === 'openapi') {
      // 2a. Parse OpenAPI spec standard file structures
      parsedData = parseOpenApiSpec(scraped.spec);
    } else {
      // 2b. Structural Check for HTML scraping
      // Ensures your background loop catches single-page apps or cloudflare wrappers gracefully
      if (!scraped.htmlData || !scraped.htmlData.rawText || scraped.htmlData.rawText.trim().length < 50) {
        throw new Error(
          "Could not parse documentation. Ensure the URL points to an open API reference page, Swagger UI, or OpenAPI JSON spec."
        );
      }

      // Use AI to extract endpoints from verified text content
      const aiExtracted = await extractEndpointsWithAi(
        scraped.htmlData.rawText,
        scraped.sourceUrl
      );
      
      parsedData = {
        apiName: scraped.htmlData.title || 'Extracted API Documentation',
        baseUrl: aiExtracted.baseUrl || scraped.htmlData.baseUrl || url,
        version: '1.0',
        description: scraped.htmlData.description || 'N/A',
        authType: aiExtracted.authType || scraped.htmlData.authType || 'Unknown Authentication',
        authDetails: [],
        endpoints: aiExtracted.endpoints || [],
        totalEndpoints: (aiExtracted.endpoints || []).length,
        tags: [],
        specVersion: 'HTML',
      };
    }

    // Double-check we have endpoints extracted before requesting the model summary
    if (!parsedData || !parsedData.endpoints || parsedData.endpoints.length === 0) {
      throw new Error(
        "Could not parse documentation. No valid endpoints or interactive methods were detected on this page."
      );
    }

    // 3. Generate AI summary
    const summary = await generateApiSummary(parsedData);

    // 4. Save results to Database
    await Project.findByIdAndUpdate(projectId, {
      status: 'complete',
      apiName: parsedData.apiName,
      baseUrl: parsedData.baseUrl,
      version: parsedData.version,
      description: parsedData.description,
      authType: parsedData.authType,
      authDetails: parsedData.authDetails,
      endpoints: parsedData.endpoints.slice(0, 200),
      totalEndpoints: parsedData.totalEndpoints,
      summary,
      name: parsedData.apiName || 'API Project',
    });
  } catch (err) {
    // Gracefully catch background rejections and attach the clear reason to your model document
    await Project.findByIdAndUpdate(projectId, {
      status: 'failed',
      errorMessage: err.message,
    });
  }
}

// GET /api/analyze/:id  — poll for status / get results
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project.' });
  }
};

// GET /api/analyze — list all user projects
exports.listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId })
      .select('-endpoints -generatedFiles')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ projects, total: projects.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
};

// DELETE /api/analyze/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project.' });
  }
};

// GET /api/analyze/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [total, complete, lastProject] = await Promise.all([
      Project.countDocuments({ userId: req.userId }),
      Project.countDocuments({ userId: req.userId, status: 'complete' }),
      Project.findOne({ userId: req.userId }).sort({ createdAt: -1 }).select('createdAt'),
    ]);

    const filesGenerated = await Project.aggregate([
      { $match: { userId: req.userId } },
      { $project: { count: { $size: { $ifNull: ['$generatedFiles', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    res.json({
      totalProjects: total,
      apisAnalyzed: complete,
      generatedFiles: filesGenerated[0]?.total || 0,
      lastActivity: lastProject ? lastProject.createdAt : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};