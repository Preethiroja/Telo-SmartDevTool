const axios = require('axios');

// Stable production API configuration paths
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1';
const MODEL = 'models/gemini-2.5-flash';

/**
 * Robust structural parser that extracts and sanitizes JSON blocks 
 * from LLM responses even if wrapped in markdown formatting or text.
 */
function safeJsonParse(rawString, fallbackValue = null) {
  if (!rawString) return fallbackValue;
  
  try {
    return JSON.parse(rawString.trim());
  } catch (initialError) {
    try {
      const startObj = rawString.indexOf('{');
      const startArr = rawString.indexOf('[');
      
      let startIdx = -1;
      let endIdx = -1;

      if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
        startIdx = startObj;
        endIdx = rawString.lastIndexOf('}');
      } else if (startArr !== -1) {
        startIdx = startArr;
        endIdx = rawString.lastIndexOf(']');
      }

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const structuralSegment = rawString.substring(startIdx, endIdx + 1);
        return JSON.parse(structuralSegment);
      }
    } catch (structuralError) {
      console.error("❌ High-level extraction layout fault:", structuralError.message);
    }
    return fallbackValue;
  }
}

/**
 * Core Gemini integration with downstream error classification logic.
 */
async function callGemini(prompt, { maxTokens = 4096, temperature = 0.3 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      topP: 0.8,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  // Inside backend/utils/gemini.js -> callGemini function

try {
  // Increased timeout from 30s to 60s to allow deep code generation to finish
  const res = await axios.post(url, body, { timeout: 60000 }); 
  const candidate = res.data?.candidates?.[0];
  if (!candidate) throw new Error('No response content from model runtime.');
  if (candidate.finishReason === 'SAFETY') throw new Error('Response blocked by safety filters');
  return candidate.content?.parts?.[0]?.text || '';
} catch (err) {
    console.error("Gemini Endpoint Connection Error:", err.response?.data || err.message);

    if (err.response?.status === 429)
      throw new Error("Gemini rate limit exceeded.");

    if (err.response?.status === 400)
      throw new Error("Invalid Gemini structural request composition.");

    if (err.response?.status === 404)
      throw new Error("Gemini model route target mismatch or key context restriction.");

    throw err;
  }
}

/**
 * Generate a human-readable structural summary of target datasets.
 */
async function generateApiSummary(apiData) {
  const endpointSample = (apiData.endpoints || []).slice(0, 20).map(
    e => `${e.method} ${e.path} — ${e.summary || e.description || '(no description)'}`
  ).join('\n');

  const prompt = `You are an expert API technical writer. Analyze this API and write a concise, developer-focused summary.

API Name: ${apiData.apiName}
Base URL: ${apiData.baseUrl}
Version: ${apiData.version}
Authentication: ${apiData.authType}
Total Endpoints: ${apiData.totalEndpoints}
Description: ${apiData.description || 'N/A'}

Sample Endpoints:
${endpointSample || 'No endpoints detected'}

Write a 2-4 paragraph developer-friendly summary covering:
1. What this API does and what problems it solves
2. Key capabilities and most important endpoints
3. Authentication approach and how to get started
4. Any important notes about versioning or usage patterns

Be specific, practical, and direct. Avoid marketing language. Focus on what a developer needs to know to start using this API quickly.`;

  return callGemini(prompt, { maxTokens: 1024, temperature: 0.4 });
}

/**
 * Generate clean production target modules from abstract structural arrays.
 */
async function generateClientCode(apiData, language, useCase) {
  const endpointSample = (apiData.endpoints || []).slice(0, 30).map(e => {
    const params = (e.parameters || []).map(p => `${p.name} (${p.in}, ${p.required ? 'required' : 'optional'})`).join(', ');
    return `${e.method} ${e.path}${e.summary ? ' — ' + e.summary : ''}${params ? '\n   Params: ' + params : ''}`;
  }).join('\n'); // <-- Fixed: added missing closure curly bracket right here

  const authNote = buildAuthNote(apiData.authType, language);

  const langConfig = {
    javascript: {
      label: 'JavaScript (ES2022, Node.js compatible)',
      files: ['ApiConfig.js', 'ApiClient.js', 'services/[Resource]Service.js', 'dto/[Resource]DTO.js'],
      style: 'async/await, axios, JSDoc comments, ES modules syntax',
    },
    python: {
      label: 'Python 3.10+',
      files: ['config.py', 'client.py', 'services/[resource]_service.py', 'models/[resource].py'],
      style: 'dataclasses, httpx async client, type hints, docstrings',
    },
    java: {
      label: 'Java 17 (Spring Boot compatible)',
      files: ['ApiConfig.java', 'ApiClient.java', '[Resource]Service.java', '[Resource]DTO.java'],
      style: 'OkHttp, Gson, Builder pattern, Javadoc, checked exceptions',
    },
  };

  const cfg = langConfig[language] || langConfig.javascript;

  const prompt = `You are a senior software engineer generating a production-ready API client library.

API: ${apiData.apiName}
Base URL: ${apiData.baseUrl}
Version: ${apiData.version}
Auth: ${apiData.authType}
Auth Implementation: ${authNote}
Developer Use Case: ${useCase || 'General API integration'}

Endpoints to implement:
${endpointSample}

Generate a complete, production-ready ${cfg.label} API client library.

REQUIREMENTS:
- Language: ${cfg.label}
- Style: ${cfg.style}
- Include proper error handling with specific error messages
- Include authentication header injection
- Include request/response type definitions
- Add retry logic for rate limits (429) and server errors (5xx)
- Add timeout handling (default 30s)
- Include a README.md explaining how to use the library
- Generate actual working code, not pseudocode

OUTPUT FORMAT — respond with EXACTLY this JSON structure (no markdown, no code fences, pure JSON):
{
  "files": [
    {
      "filename": "ApiConfig.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}",
      "content": "// complete file content here"
    },
    {
      "filename": "ApiClient.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}",
      "content": "// complete file content here"
    },
    {
      "filename": "${apiData.apiName?.replace(/\s+/g, '')}Service.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}",
      "content": "// complete file content here"
    },
    {
      "filename": "README.md",
      "content": "# complete readme here"
    }
  ]
}

Generate thorough, idiomatic, production-quality code. Every file must be complete and functional.`;

  const raw = await callGemini(prompt, { maxTokens: 8192, temperature: 0.2 });
  const parsed = safeJsonParse(raw);

  if (parsed && parsed.files) {
    return parsed.files.map(f => ({ ...f, language }));
  }

  return [{
    filename: `${apiData.apiName?.replace(/\s+/g, '') || 'Api'}Client.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}`,
    content: raw,
    language,
  }];
}

/**
 * Handle user prompt chat sessions against an established contextual target frame.
 */
async function chatWithApi(question, apiContext, chatHistory = []) {
  const endpointList = (apiContext.endpoints || []).slice(0, 40).map(
    e => `${e.method} ${e.path}${e.summary ? ' — ' + e.summary : ''}`
  ).join('\n');

  const historyText = chatHistory.slice(-6).map(
    m => `${m.role === 'user' ? 'Developer' : 'Assistant'}: ${m.content}`
  ).join('\n');

  const prompt = `You are an expert API integration assistant for the ${apiContext.apiName} API.

API Context:
- Name: ${apiContext.apiName}
- Base URL: ${apiContext.baseUrl}
- Version: ${apiContext.version}
- Authentication: ${apiContext.authType}
- Total Endpoints: ${apiContext.totalEndpoints}
- API Summary: ${(apiContext.summary || '').slice(0, 500)}

Available Endpoints:
${endpointList}

Previous conversation:
${historyText || 'None'}

Developer question: ${question}

Answer the question concisely and accurately. When providing code examples, use JavaScript by default unless the developer specifies otherwise. Include the actual endpoint path, method, and authentication headers in code examples. Keep answers focused and practical.`;

  return callGemini(prompt, { maxTokens: 2048, temperature: 0.5 });
}

/**
 * Primary AI analysis router for abstracting document DOM structural text into structured JSON lists.
 */
async function extractEndpointsWithAi(htmlText, sourceUrl) {
  if (!htmlText || htmlText.trim().length < 15) {
    console.warn("⚠️ Documentation source raw text is minimal or restricted.");
    return { baseUrl: sourceUrl, authType: 'None Detected', endpoints: [] };
  }

  const prompt = `You are an expert at reading API documentation and extracting structured endpoint information.

Source URL: ${sourceUrl}
Documentation text (truncated):
${htmlText.slice(0, 6000)}

Extract ALL API endpoints from this documentation. For each endpoint identify:
- HTTP method (GET, POST, PUT, PATCH, DELETE)
- Path (e.g., /users/{id})
- Summary/description (brief)
- Authentication required (yes/no)

Respond with ONLY valid JSON, no markdown structural fences:
{
  "baseUrl": "https://api.example.com",
  "authType": "Bearer Token",
  "endpoints": [
    { "method": "GET", "path": "/users", "summary": "List all users", "authRequired": true }
  ]
}`;

  const raw = await callGemini(prompt, { maxTokens: 4096, temperature: 0.1 });
  const parsed = safeJsonParse(raw);

  if (parsed) {
    return {
      baseUrl: parsed.baseUrl || sourceUrl,
      authType: parsed.authType || 'Unknown Authentication',
      endpoints: Array.isArray(parsed.endpoints) ? parsed.endpoints : []
    };
  }

  return { baseUrl: sourceUrl, authType: 'Unknown', endpoints: [] };
}

function buildAuthNote(authType, language) {
  const lower = (authType || '').toLowerCase();
  if (lower.includes('bearer') || lower.includes('jwt')) {
    return language === 'javascript'
      ? "Set header: Authorization: 'Bearer ' + token"
      : language === 'python'
      ? "headers={'Authorization': f'Bearer {token}'}"
      : 'request.addHeader("Authorization", "Bearer " + token)';
  }
  if (lower.includes('api key')) {
    return 'API Key in header or query parameter';
  }
  if (lower.includes('oauth')) {
    return 'OAuth2 access token in Authorization header';
  }
  return 'Check API documentation for authentication requirements';
}

module.exports = {
  generateApiSummary,
  generateClientCode,
  chatWithApi,
  extractEndpointsWithAi,
  callGemini,
};