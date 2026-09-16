const AUTH_COOKIE_NAME = 'lifetree_token'

function getRequiredEnv(name, env = process.env) {
  const value = env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function extractTokenFromHeaders(headers) {
  const authorization = headers.get('authorization')
  if (authorization) {
    const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i)
    if (bearerMatch && bearerMatch[1] !== 'null') {
      return bearerMatch[1]
    }
  }

  const cookieHeader = headers.get('cookie') || ''
  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`)
  )
  return cookieMatch && cookieMatch[1] ? decodeURIComponent(cookieMatch[1]) : null
}

function buildAuthCookie(token, maxAgeSeconds = 604800, secure = process.env.NODE_ENV === 'production') {
  const secureFlag = secure ? '; Secure' : ''
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax${secureFlag}`
}

function buildClearAuthCookie(secure = process.env.NODE_ENV === 'production') {
  const secureFlag = secure ? '; Secure' : ''
  return `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secureFlag}`
}

module.exports = {
  AUTH_COOKIE_NAME,
  getRequiredEnv,
  extractTokenFromHeaders,
  buildAuthCookie,
  buildClearAuthCookie,
}
