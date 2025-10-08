#!/usr/bin/env node

/**
 * LifeTree 安全开发检查工具
 * 用于检查新开发的功能是否符合安全规范
 */

const fs = require('fs')
const path = require('path')

// 受保护的路径列表
const PROTECTED_PATHS = [
  '/dashboard',
  '/api/plans',
  '/api/notifications',
  '/api/analytics',
  '/api/user',
  '/api/settings',
  '/api/export',
  '/api/import',
  '/api/backup',
  '/api/ai',
  '/api/daily-snapshots',
  '/api/cron',
  '/api/test-plans',
  '/api/hello'
]

// 公开路径列表
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/api/auth'
]

// 检查API文件是否包含必要的安全验证
function checkAPISecurity(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []

  // 跳过认证相关的API（这些不需要验证token）
  if (filePath.includes('/api/auth/')) {
    return []
  }

  // 跳过cron任务（这些是系统内部调用）
  if (filePath.includes('/api/cron/')) {
    return []
  }

  // 检查是否导入了verifyToken
  if (!content.includes('verifyToken')) {
    issues.push('❌ 缺少JWT token验证')
  }

  // 检查是否验证了token
  if (!content.includes('verifyToken(token)')) {
    issues.push('❌ 没有验证JWT token')
  }

  // 检查是否检查了用户ID
  if (!content.includes('userId') && !content.includes('payload.userId')) {
    issues.push('⚠️  可能缺少用户数据隔离')
  }

  // 检查是否有错误处理
  if (!content.includes('try') || !content.includes('catch')) {
    issues.push('⚠️  缺少错误处理')
  }

  return issues
}

// 检查页面文件是否包含身份验证
function checkPageSecurity(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []

  // 跳过公开页面
  if (filePath.includes('(auth)') || filePath.endsWith('app/page.tsx')) {
    return []
  }

  // 跳过dashboard布局文件（它已经处理了身份验证）
  if (filePath.includes('layout.tsx')) {
    return []
  }

  // 跳过dashboard下的页面（它们通过layout.tsx进行身份验证）
  if (filePath.includes('/dashboard/')) {
    return []
  }

  // 检查是否导入了身份验证工具
  if (!content.includes('getAuthUser') && !content.includes('useAuth')) {
    issues.push('❌ 缺少身份验证检查')
  }

  // 检查是否有useEffect进行身份验证
  if (!content.includes('useEffect') || !content.includes('getAuthUser')) {
    issues.push('❌ 没有在useEffect中检查登录状态')
  }

  return issues
}

// 检查中间件配置
function checkMiddlewareConfig() {
  const middlewarePath = path.join(process.cwd(), 'middleware.ts')
  if (!fs.existsSync(middlewarePath)) {
    return ['❌ 缺少middleware.ts文件']
  }

  const content = fs.readFileSync(middlewarePath, 'utf8')
  const issues = []

  // 检查是否包含受保护路径
  for (const protectedPath of PROTECTED_PATHS) {
    if (!content.includes(protectedPath)) {
      issues.push(`⚠️  中间件中缺少受保护路径: ${protectedPath}`)
    }
  }

  return issues
}

// 扫描项目文件
function scanProject() {
  console.log('🔍 开始安全扫描...\n')

  const issues = []
  const appDir = path.join(process.cwd(), 'app')

  // 检查中间件
  console.log('📋 检查中间件配置...')
  const middlewareIssues = checkMiddlewareConfig()
  if (middlewareIssues.length > 0) {
    issues.push(...middlewareIssues)
    middlewareIssues.forEach(issue => console.log(`  ${issue}`))
  } else {
    console.log('  ✅ 中间件配置正常')
  }

  // 扫描API文件
  console.log('\n🔌 检查API文件...')
  const apiDir = path.join(appDir, 'api')
  if (fs.existsSync(apiDir)) {
    scanDirectory(apiDir, (filePath) => {
      if (filePath.endsWith('route.ts')) {
        const relativePath = path.relative(process.cwd(), filePath)
        const apiIssues = checkAPISecurity(filePath)
        if (apiIssues.length > 0) {
          issues.push(...apiIssues.map(issue => `${relativePath}: ${issue}`))
          console.log(`  📄 ${relativePath}`)
          apiIssues.forEach(issue => console.log(`    ${issue}`))
        } else {
          console.log(`  ✅ ${relativePath}`)
        }
      }
    })
  }

  // 扫描页面文件
  console.log('\n📄 检查页面文件...')
  scanDirectory(appDir, (filePath) => {
    if (filePath.endsWith('page.tsx') && !filePath.includes('(auth)')) {
      const relativePath = path.relative(process.cwd(), filePath)
      const pageIssues = checkPageSecurity(filePath)
      if (pageIssues.length > 0) {
        issues.push(...pageIssues.map(issue => `${relativePath}: ${issue}`))
        console.log(`  📄 ${relativePath}`)
        pageIssues.forEach(issue => console.log(`    ${issue}`))
      } else {
        console.log(`  ✅ ${relativePath}`)
      }
    }
  })

  // 输出总结
  console.log('\n📊 扫描结果:')
  if (issues.length === 0) {
    console.log('🎉 所有检查通过！项目符合安全规范。')
  } else {
    console.log(`⚠️  发现 ${issues.length} 个安全问题:`)
    issues.forEach(issue => console.log(`  ${issue}`))
    console.log('\n💡 请参考 docs/SECURITY_GUIDELINES.md 修复这些问题。')
    process.exit(1)
  }
}

// 递归扫描目录
function scanDirectory(dir, callback) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      scanDirectory(filePath, callback)
    } else {
      callback(filePath)
    }
  }
}

// 主函数
function main() {
  console.log('🛡️  LifeTree 安全开发检查工具\n')
  scanProject()
}

if (require.main === module) {
  main()
}

module.exports = {
  checkAPISecurity,
  checkPageSecurity,
  checkMiddlewareConfig,
  PROTECTED_PATHS,
  PUBLIC_PATHS
}
