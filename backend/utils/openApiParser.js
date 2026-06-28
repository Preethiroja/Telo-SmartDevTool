/**
 * Parse an OpenAPI 2.x (Swagger) or 3.x spec into Telo's normalized format.
 */
function parseOpenApiSpec(spec) {
  const isV3 = !!(spec.openapi && spec.openapi.startsWith('3'))
  const isSwagger = !!spec.swagger

  const info = spec.info || {}
  const apiName = info.title || 'API'
  const version = info.version || '1.0.0'
  const description = info.description || ''

  // Base URL
  let baseUrl = ''
  if (isV3 && spec.servers && spec.servers.length > 0) {
    baseUrl = spec.servers[0].url || ''
  } else if (isSwagger) {
    const scheme = (spec.schemes || ['https'])[0]
    const host = spec.host || ''
    const basePath = spec.basePath || ''
    if (host) baseUrl = `${scheme}://${host}${basePath}`
  }

  // Auth / Security
  const authType = detectAuth(spec, isV3)

  // Endpoints
  const endpoints = []
  const paths = spec.paths || {}

  for (const [path, pathItem] of Object.entries(paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    for (const method of methods) {
      const operation = pathItem[method]
      if (!operation) continue

      const parameters = buildParameters(operation.parameters || [], pathItem.parameters || [], spec, isV3)
      const requestBody = isV3 ? buildRequestBody(operation.requestBody, spec) : buildSwaggerBody(operation.parameters || [], spec)
      const responses = buildResponses(operation.responses || {})

      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: operation.summary || '',
        description: operation.description || '',
        operationId: operation.operationId || '',
        tags: operation.tags || [],
        parameters,
        requestBody,
        responses,
      })
    }
  }

  // Group endpoints by tag
  const tags = [...new Set(endpoints.flatMap(e => e.tags).filter(Boolean))]

  return {
    apiName,
    version,
    description,
    baseUrl,
    authType,
    authDetails: extractAuthDetails(spec, isV3),
    endpoints,
    totalEndpoints: endpoints.length,
    tags,
    specVersion: isV3 ? `OpenAPI ${spec.openapi}` : `Swagger ${spec.swagger}`,
  }
}

function detectAuth(spec, isV3) {
  const secDefs = isV3
    ? (spec.components?.securitySchemes || {})
    : (spec.securityDefinitions || {})

  const schemes = Object.values(secDefs)
  if (schemes.length === 0) {
    // Check global security
    const globalSec = spec.security
    if (globalSec && globalSec.length > 0) return 'Authentication Required'
    return 'None'
  }

  for (const scheme of schemes) {
    const type = (scheme.type || '').toLowerCase()
    const schemeName = (scheme.scheme || '').toLowerCase()

    if (type === 'http' && schemeName === 'bearer') return 'Bearer Token (JWT)'
    if (type === 'http' && schemeName === 'basic') return 'Basic Auth'
    if (type === 'apikey') return `API Key (${scheme.in}: ${scheme.name || 'key'})`
    if (type === 'oauth2') return 'OAuth2'
    if (type === 'openidconnect') return 'OpenID Connect'
  }

  return 'Custom Auth'
}

function extractAuthDetails(spec, isV3) {
  const secDefs = isV3
    ? (spec.components?.securitySchemes || {})
    : (spec.securityDefinitions || {})

  return Object.entries(secDefs).map(([name, scheme]) => ({
    name,
    type: scheme.type,
    scheme: scheme.scheme,
    in: scheme.in,
    paramName: scheme.name,
    description: scheme.description || '',
  }))
}

function buildParameters(opParams, pathParams, spec, isV3) {
  const merged = [...(pathParams || []), ...(opParams || [])]
  return merged
    .filter(p => p && !p.$ref) // skip unresolved refs for now
    .map(p => ({
      name: p.name || '',
      in: p.in || 'query',
      required: !!p.required,
      type: isV3 ? (p.schema?.type || 'string') : (p.type || 'string'),
      description: p.description || '',
      example: p.example || p.schema?.example || '',
    }))
}

function buildRequestBody(requestBody, spec) {
  if (!requestBody) return null
  const content = requestBody.content || {}
  const jsonContent = content['application/json'] || Object.values(content)[0]
  if (!jsonContent) return null
  return {
    required: !!requestBody.required,
    description: requestBody.description || '',
    schema: jsonContent.schema || {},
    example: jsonContent.example || jsonContent.schema?.example || null,
  }
}

function buildSwaggerBody(parameters, spec) {
  const bodyParam = parameters.find(p => p.in === 'body')
  if (!bodyParam) return null
  return {
    required: !!bodyParam.required,
    description: bodyParam.description || '',
    schema: bodyParam.schema || {},
    example: null,
  }
}

function buildResponses(responses) {
  return Object.entries(responses).map(([code, resp]) => ({
    statusCode: code,
    description: resp.description || '',
  }))
}

module.exports = { parseOpenApiSpec }
