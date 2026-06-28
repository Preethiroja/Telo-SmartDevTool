const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const TIMEOUT = 15000;

/**
 * Fetch raw content from a URL via standard HTTP requests.
 * Returns { content, contentType, finalUrl }
 */
async function fetchUrl(url) {
  const res = await axios.get(url, {
    timeout: TIMEOUT,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/html, application/xhtml+xml, */*',
    },
    maxRedirects: 5,
  });
  return {
    content: res.data,
    contentType: res.headers['content-type'] || '',
    finalUrl: res.config.url || url,
    status: res.status,
  };
}

/**
 * Detect if content is an OpenAPI / Swagger spec (JSON or YAML object).
 */
function isOpenApiSpec(content) {
  if (typeof content !== 'object' || !content) return false;
  return !!(
    content.swagger ||
    content.openapi ||
    (content.info && (content.paths || content.components))
  );
}

/**
 * Try common OpenAPI spec URL variations from a base URL.
 */
async function trySwaggerUrls(baseUrl) {
  const url = new URL(baseUrl);
  const candidates = [
    baseUrl,
    `${url.origin}/swagger.json`,
    `${url.origin}/openapi.json`,
    `${url.origin}/api-docs`,
    `${url.origin}/api/swagger.json`,
    `${url.origin}/v2/swagger.json`,
    `${url.origin}/v3/openapi.json`,
    `${url.origin}/docs/swagger.json`,
    `${url.origin}/api/openapi.json`,
  ];

  for (const candidate of candidates) {
    try {
      const { content, contentType } = await fetchUrl(candidate);
      if (isOpenApiSpec(content)) {
        return { spec: content, specUrl: candidate };
      }
      if (typeof content === 'string' && contentType.includes('json')) {
        const parsed = JSON.parse(content);
        if (isOpenApiSpec(parsed)) return { spec: parsed, specUrl: candidate };
      }
    } catch {
      // Try next candidate
    }
  }
  return null;
}

/**
 * Extract documentation from an HTML page via Cheerio.
 */
function extractFromHtml(html, sourceUrl) {
  const $ = cheerio.load(html);

  // Clean up structural clutter before gathering text strings
  $('script, style, nav, footer, link, .sidebar, .navigation, iframe').remove();

  const title = $('h1').first().text().trim() ||
    $('title').text().replace(/[|\-–].*$/, '').trim() ||
    'API Documentation';

  const description = $('meta[name="description"]').attr('content') ||
    $('p').first().text().trim().slice(0, 300) ||
    '';

  const baseUrlMatches = html.match(/https?:\/\/[a-zA-Z0-9.-]+(?:\/v[0-9]+)?(?=\s|"|'|`)/g) || [];
  const origin = new URL(sourceUrl).origin;
  const baseUrl = baseUrlMatches.find(u => u !== sourceUrl && u.startsWith('http')) || origin;

  const endpoints = [];
  const methodRegex = /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b\s+(\/[\w/{}.:-]*)/gi;

  $('code, pre').each((_, el) => {
    const text = $(el).text();
    let match;
    while ((match = methodRegex.exec(text)) !== null) {
      endpoints.push({ method: match[1].toUpperCase(), path: match[2], summary: '' });
    }
  });

  const cleanBodyText = $.text().replace(/\s+/g, ' ');

  if (endpoints.length === 0) {
    let match;
    while ((match = methodRegex.exec(cleanBodyText)) !== null) {
      endpoints.push({ method: match[1].toUpperCase(), path: match[2], summary: '' });
    }
  }

  const checkText = (cleanBodyText + html).toLowerCase();
  let authType = 'unknown';
  if (checkText.includes('bearer') || checkText.includes('authorization: bearer')) authType = 'Bearer Token';
  else if (checkText.includes('api-key') || checkText.includes('x-api-key') || checkText.includes('apikey')) authType = 'API Key';
  else if (checkText.includes('oauth2') || checkText.includes('oauth 2')) authType = 'OAuth2';
  else if (checkText.includes('basic auth') || checkText.includes('authorization: basic')) authType = 'Basic Auth';

  const seen = new Set();
  const uniqueEndpoints = endpoints.filter(ep => {
    const key = `${ep.method}:${ep.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 100);

  return {
    title,
    description,
    baseUrl,
    authType,
    endpoints: uniqueEndpoints,
    rawText: cleanBodyText.slice(0, 12000), // Richer contextual window slice for Gemini
  };
}

/**
 * Headless fallback browser runner designed to handle SPA frameworks (Stripe, React, etc.)
 */
async function scrapeDynamicHtml(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 900 });

    // Navigate and await full lazy-loaded DOM trees
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    const fullyHydratedHtml = await page.content();
    
    await browser.close();
    return fullyHydratedHtml;
  } catch (err) {
    if (browser) await browser.close();
    console.warn("⚠️ Puppeteer extraction pipeline encountered an issue:", err.message);
    return null;
  }
}

/**
 * Main scraper module entry orchestrator point.
 */
async function scrapeDocumentation(url) {
  let fetchResult;
  let networkFailed = false;

  try {
    fetchResult = await fetchUrl(url);
  } catch (err) {
    console.warn(`🌐 Initial Axios call failed (${err.message}). Defaulting to Headless Browser...`);
    networkFailed = true;
  }

  // 1. Check if direct response is already a structured specification object
  if (!networkFailed && isOpenApiSpec(fetchResult.content)) {
    return { type: 'openapi', spec: fetchResult.content, sourceUrl: url };
  }

  // 2. Try parsing JSON raw payload securely
  if (!networkFailed && fetchResult.contentType.includes('application/json')) {
    let parsedJson = fetchResult.content;
    if (typeof parsedJson === 'string') {
      try {
        parsedJson = JSON.parse(parsedJson);
      } catch (jsonErr) {
        throw new Error(`The target server returned invalid or truncated JSON content: ${jsonErr.message}`);
      }
    }
    
    if (isOpenApiSpec(parsedJson)) {
      return { type: 'openapi', spec: parsedJson, sourceUrl: url };
    } else {
      throw new Error('Provided URL returns a standard REST data schema layout, not a valid Swagger UI or OpenAPI documentation specification file.');
    }
  }

  // 3. Try discoverable common target OpenAPI endpoint directories 
  if (!networkFailed) {
    const swaggerResult = await trySwaggerUrls(url);
    if (swaggerResult) {
      return { type: 'openapi', spec: swaggerResult.spec, sourceUrl: swaggerResult.specUrl };
    }
  }

  // 4. HTML processing layer
  let rawHtml = !networkFailed ? fetchResult.content : null;

  // Safeguard: Convert objects into string layouts safely before checking HTML tags
  if (rawHtml && typeof rawHtml === 'object') {
    rawHtml = JSON.stringify(rawHtml);
  }

  // Verification step: If axios returned empty layouts or got blocked, boot up Puppeteer
  if (
    networkFailed ||
    typeof rawHtml !== 'string' ||
    rawHtml.length < 2000 ||
    rawHtml.includes('Cloudflare') ||
    rawHtml.includes('captcha')
  ) {
    // Drop execution immediately if it's a known non-HTML target endpoint to save machine resources
    if (url.endsWith('.json') || url.endsWith('.yaml')) {
      throw new Error('Failed to retrieve spec from direct asset link. Target file is missing or server dropped the stream payload.');
    }

    console.log("🤖 Initializing dynamic rendering extraction for:", url);
    const dynamicHtml = await scrapeDynamicHtml(url);
    if (dynamicHtml) {
      rawHtml = dynamicHtml;
    }
  }

  // Ensure rawHtml is a true HTML structure string layout before running Cheerio DOM hooks
  if (typeof rawHtml === 'string') {
    const trimmedHtml = rawHtml.trim();
    if (trimmedHtml.includes('<html') || trimmedHtml.includes('<!DOCTYPE') || trimmedHtml.includes('<body') || trimmedHtml.startsWith('<')) {
      const htmlData = extractFromHtml(rawHtml, url);
      return { type: 'html', htmlData, sourceUrl: url };
    }
  }

  throw new Error('Could not parse documentation. Ensure the URL points to an API reference page, Swagger UI, or OpenAPI JSON spec.');
}

module.exports = { scrapeDocumentation, fetchUrl, isOpenApiSpec };