const assert = require('node:assert/strict')
const test = require('node:test')

const {
  getRequiredEnv,
  extractTokenFromHeaders,
  buildAuthCookie,
  buildClearAuthCookie,
} = require('../lib/security-config')

test('getRequiredEnv rejects missing and blank secrets', () => {
  assert.throws(
    () => getRequiredEnv('JWT_SECRET', {}),
    /Missing required environment variable: JWT_SECRET/
  )
  assert.throws(
    () => getRequiredEnv('JWT_SECRET', { JWT_SECRET: '   ' }),
    /Missing required environment variable: JWT_SECRET/
  )
})

test('getRequiredEnv returns a non-empty environment value', () => {
  assert.equal(
    getRequiredEnv('JWT_SECRET', { JWT_SECRET: 'test-secret' }),
    'test-secret'
  )
})

test('extractTokenFromHeaders accepts bearer and HttpOnly cookie tokens', () => {
  assert.equal(
    extractTokenFromHeaders(new Headers({ authorization: 'Bearer header-token' })),
    'header-token'
  )
  assert.equal(
    extractTokenFromHeaders(new Headers({ cookie: 'foo=bar; lifetree_token=cookie-token' })),
    'cookie-token'
  )
  assert.equal(extractTokenFromHeaders(new Headers()), null)
})

test('auth cookies are HttpOnly and can be cleared', () => {
  const cookie = buildAuthCookie('signed-token', 3600, true)
  assert.match(cookie, /^lifetree_token=signed-token;/)
  assert.match(cookie, /Max-Age=3600/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  assert.match(cookie, /Secure/)

  const clearCookie = buildClearAuthCookie(true)
  assert.match(clearCookie, /^lifetree_token=;/)
  assert.match(clearCookie, /Max-Age=0/)
  assert.match(clearCookie, /HttpOnly/)
  assert.match(clearCookie, /Secure/)
})
