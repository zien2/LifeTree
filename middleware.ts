import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractTokenFromHeaders } from '@/lib/security-config'
import { matchesConfiguredPath } from '@/lib/path-security'

// 需要身份验证的路径
const protectedPaths = [
  '/dashboard',
  '/api/plans',
  '/api/notifications',
  '/api/daily-snapshots',
  '/api/cron',
  '/api/test-plans',
  '/api/hello',
  '/api/tree-snapshots',
  '/api/dashboard-tree-snapshot',
  '/api/ai-analysis',
  // 未来功能路径（预配置）
  '/api/analytics',
  '/api/user',
  '/api/settings',
  '/api/export',
  '/api/import',
  '/api/backup',
  '/api/ai'
]

// 公开路径（不需要身份验证）
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/logout',
  '/api/auth/me'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 旧版把快照放在 public/；永久禁用其直链，统一改走带用户校验的 API。
  if (matchesConfiguredPath(pathname, '/tree-snapshots')) {
    return NextResponse.json(
      { success: false, message: 'Legacy snapshot URL is disabled' },
      { status: 410 }
    )
  }

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => matchesConfiguredPath(pathname, path))

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return NextResponse.next()
  }

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => matchesConfiguredPath(pathname, path))

  // 如果是受保护的路径
  if (isProtectedPath) {
    // Edge 中间件只做会话存在性检查；每个 API 路由在 Node 运行时验证 JWT。
    if (pathname.startsWith('/api/')) {
      const token = extractTokenFromHeaders(request.headers)
      
      if (!token) {
        // API请求没有token，返回401错误
        return NextResponse.json(
          { success: false, message: '未提供认证令牌' },
          { status: 401 }
        )
      }

      return NextResponse.next()
    }

    // 对于页面路径，暂时不检查token，让前端处理
    // 这样可以避免中间件和前端认证逻辑冲突
    return NextResponse.next()
  }

  // 其他情况继续请求
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
