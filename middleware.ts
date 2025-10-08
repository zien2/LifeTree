import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// 需要身份验证的路径
const protectedPaths = [
  '/dashboard',
  '/api/plans',
  '/api/notifications',
  '/api/daily-snapshots',
  '/api/cron',
  '/api/test-plans',
  '/api/hello',
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
  '/api/auth/me'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  )

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return NextResponse.next()
  }

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  // 如果是受保护的路径
  if (isProtectedPath) {
    // 对于API路径，只检查Authorization头，不重定向
    if (pathname.startsWith('/api/')) {
      const token = request.headers.get('authorization')?.split(' ')[1]
      
      if (!token) {
        // API请求没有token，返回401错误
        return NextResponse.json(
          { success: false, message: '未提供认证令牌' },
          { status: 401 }
        )
      }

      try {
        // 验证token
        const payload = verifyToken(token)
        if (!payload) {
          // token无效，返回401错误
          return NextResponse.json(
            { success: false, message: '无效的认证令牌' },
            { status: 401 }
          )
        }

        // token有效，继续请求
        return NextResponse.next()
      } catch (error) {
        // token验证失败，返回401错误
        return NextResponse.json(
          { success: false, message: '认证失败' },
          { status: 401 }
        )
      }
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
