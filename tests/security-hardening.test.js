const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const repoRoot = path.resolve(__dirname, '..')
const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')

const collectTextFiles = (directory, relativeDirectory = '') => {
  const skipped = new Set(['.git', '.next', 'node_modules', 'tests'])
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name) || entry.name === 'package-lock.json') continue
    const absolutePath = path.join(directory, entry.name)
    const relativePath = path.join(relativeDirectory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectTextFiles(absolutePath, relativePath))
      continue
    }

    const content = fs.readFileSync(absolutePath)
    if (!content.includes(0)) files.push([relativePath, content.toString('utf8')])
  }

  return files
}

test('production code does not contain hard-coded secret fallbacks', () => {
  const files = [
    'app/api/ai-analysis/route.ts',
    'scripts/test-ai-api.js',
    'lib/jwt.ts',
    'app/api/cron/daily-snapshot/route.ts',
    'scripts/daily-snapshot.js',
  ]

  for (const file of files) {
    const source = read(file)
    assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{20,}/, file)
    assert.doesNotMatch(source, /process\.env\.JWT_SECRET\s*\|\|/, file)
    assert.doesNotMatch(source, /process\.env\.CRON_SECRET_TOKEN\s*\|\|/, file)
    assert.doesNotMatch(source, /lifetree-cron-2024/, file)
  }
})

test('Docker Compose requires runtime secrets instead of committing credentials', () => {
  const compose = read('docker-compose.yml')
  assert.match(compose, /\$\{MYSQL_ROOT_PASSWORD:\?/)
  assert.match(compose, /\$\{MYSQL_PASSWORD:\?/)
  assert.match(compose, /\$\{JWT_SECRET:\?/)
  assert.match(compose, /\$\{CRON_SECRET_TOKEN:\?/)
  assert.match(compose, /\$\{AI_API_KEY:-\}/)
  assert.match(compose, /\$\{SMTP_PASSWORD:-\}/)
  assert.doesNotMatch(compose, /SMTP_PASS=/)
  assert.doesNotMatch(compose, /MYSQL_ROOT_PASSWORD:\s+(?!\$\{)[^\n]+/)
  assert.doesNotMatch(compose, /MYSQL_PASSWORD:\s+(?!\$\{)[^\n]+/)
})

test('login no longer writes bearer tokens to browser storage', () => {
  const loginPage = read('app/(auth)/login/page.tsx')
  assert.doesNotMatch(loginPage, /localStorage\.setItem\(['"]token['"]\s*,/)
  assert.doesNotMatch(loginPage, /document\.cookie\s*=.*token=/)
})

test('filesystem snapshot APIs are protected by the shared auth middleware', () => {
  const middleware = read('middleware.ts')
  const route = read('app/api/tree-snapshots/route.ts')
  assert.match(middleware, /['"]\/api\/tree-snapshots['"]/)
  assert.match(route, /getAuthUserFromRequest|extractTokenFromHeaders/)
})

test('snapshot image parsing rejects arbitrary or oversized payloads', () => {
  const { decodeSnapshotImage } = require('../lib/snapshot-security')

  assert.deepEqual(
    decodeSnapshotImage('data:image/png;base64,aGVsbG8=', 16),
    Buffer.from('hello')
  )
  assert.throws(
    () => decodeSnapshotImage('data:text/plain;base64,aGVsbG8=', 16),
    /PNG or JPEG data URL/
  )
  assert.throws(
    () => decodeSnapshotImage('data:image/png;base64,aGVsbG8=', 3),
    /too large/
  )
})

test('security scanner accepts the shared request authentication helper', () => {
  const { checkAPISecurity } = require('../scripts/security-check')
  assert.deepEqual(
    checkAPISecurity(path.join(repoRoot, 'app/api/tree-snapshots/route.ts')),
    []
  )
})

test('AI chat validation rejects oversized or unsupported messages', () => {
  const { validateChatContext } = require('../lib/ai-security')

  assert.deepEqual(
    validateChatContext([
      { role: 'user', content: 'Help me plan today' },
      { role: 'assistant', content: 'Start with one priority' },
    ]),
    [
      { role: 'user', content: 'Help me plan today' },
      { role: 'assistant', content: 'Start with one priority' },
    ]
  )
  assert.throws(
    () => validateChatContext([{ role: 'system', content: 'x' }]),
    /system messages are not accepted/
  )
  assert.throws(
    () => validateChatContext(Array.from({ length: 21 }, () => ({ role: 'user', content: 'x' }))),
    /too many messages/
  )
  assert.throws(
    () => validateChatContext([{ role: 'user', content: 'x'.repeat(4001) }]),
    /too long/
  )
})

test('plan API errors do not return stack traces', () => {
  const route = read('app/api/plans/[id]/route.ts')
  assert.doesNotMatch(route, /stack\s*:/)
})

test('Edge middleware does not import the Node-only JWT implementation', () => {
  const middleware = read('middleware.ts')
  assert.doesNotMatch(middleware, /from ['"]@\/lib\/jwt['"]/)
  assert.doesNotMatch(middleware, /verifyToken\s*\(/)
})

test('public root path does not accidentally match every route', () => {
  const { matchesConfiguredPath } = require('../lib/path-security')

  assert.equal(matchesConfiguredPath('/', '/'), true)
  assert.equal(matchesConfiguredPath('/dashboard', '/'), false)
  assert.equal(matchesConfiguredPath('/api/auth/login', '/api/auth/login'), true)
  assert.equal(matchesConfiguredPath('/api/auth/login/extra', '/api/auth/login'), true)
  assert.equal(matchesConfiguredPath('/api/auth/login-evil', '/api/auth/login'), false)
})

test('middleware protects the actual AI analysis route', () => {
  assert.match(read('middleware.ts'), /['"]\/api\/ai-analysis['"]/)
})

test('snapshot images are stored privately and served through authenticated API routes', () => {
  const snapshotRoute = read('app/api/tree-snapshots/route.ts')
  const dashboardSnapshotRoute = read('app/api/dashboard-tree-snapshot/route.ts')
  const imageRoute = read('app/api/tree-snapshots/[userId]/[year]/[month]/[filename]/route.ts')
  const cronScript = read('scripts/dashboard-tree-snapshot.js')

  assert.doesNotMatch(snapshotRoute, /process\.cwd\(\),\s*['"]public['"]/)
  assert.doesNotMatch(dashboardSnapshotRoute, /process\.cwd\(\),\s*['"]public['"]/)
  assert.match(snapshotRoute, /\/api\/tree-snapshots\//)
  assert.match(dashboardSnapshotRoute, /\/api\/tree-snapshots\//)
  assert.match(imageRoute, /getAuthUserFromRequest/)
  assert.match(imageRoute, /params\.userId/)
  assert.match(cronScript, /TREE_SNAPSHOT_TOKEN/)
  assert.doesNotMatch(cronScript, /public['"],\s*['"]tree-snapshots/)
})

test('legacy public snapshot URLs are disabled', () => {
  const middleware = read('middleware.ts')
  assert.match(middleware, /['"]\/tree-snapshots['"]/)
  assert.match(middleware, /status:\s*410/)
  assert.equal(fs.existsSync(path.join(repoRoot, 'public/tree-snapshots')), false)
})

test('client code does not read bearer tokens from browser storage', () => {
  const files = [
    'lib/planUtils.ts',
    'app/dashboard/layout.tsx',
    'app/dashboard/page.tsx',
    'app/dashboard/plans/page.tsx',
    'app/dashboard/analytics/page.tsx',
    'app/dashboard/tree/page.tsx',
  ]

  for (const file of files) {
    assert.doesNotMatch(read(file), /localStorage\.getItem\(['"]token['"]\)/, file)
  }
})

test('AI client sends only user and assistant chat roles', () => {
  const analyticsPage = read('app/dashboard/analytics/page.tsx')
  assert.doesNotMatch(analyticsPage, /role:\s*['"]system['"]/)
})

test('repository does not ship fixed database or test-account passwords', () => {
  for (const [file, source] of collectTextFiles(repoRoot)) {
    assert.doesNotMatch(source, /Hzy0520\.|Test123456|Admin123456|Demo123(?:456|!)/, file)
  }

  const seed = read('prisma/seed.ts')
  assert.match(seed, /ALLOW_DESTRUCTIVE_SEED/)
  assert.match(seed, /SEED_USER_PASSWORD/)
})

test('email transport has no built-in SMTP account and fails closed in production', () => {
  const email = read('lib/email.ts')
  assert.doesNotMatch(email, /test@ethereal\.email|pass:\s*['"]test['"]/)
  assert.match(email, /nodemailer\.createTestAccount\(\)/)
  assert.match(email, /NODE_ENV\s*===\s*['"]production['"]/)
})

test('request-dependent GET APIs explicitly disable static generation', () => {
  const routes = [
    'app/api/auth/me/route.ts',
    'app/api/auth/verify-email/route.ts',
    'app/api/hello/route.ts',
    'app/api/test-plans/route.ts',
  ]

  for (const route of routes) {
    assert.match(read(route), /export const dynamic\s*=\s*['"]force-dynamic['"]/, route)
  }
})
