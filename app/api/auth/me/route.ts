import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/response'

/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 从请求头中提取 Token
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return unauthorizedResponse('未提供认证信息')
    }

    // 2. 验证 Token
    const payload = verifyToken(token)

    if (!payload) {
      return unauthorizedResponse('认证信息无效或已过期')
    }

    // 3. 查找用户
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return unauthorizedResponse('用户不存在')
    }

    // 4. 获取用户统计数据
    const [totalPlans, completedPlans] = await Promise.all([
      prisma.plan.count({ where: { userId: user.id } }),
      prisma.plan.count({
        where: { userId: user.id, status: 'COMPLETED' },
      }),
    ])

    const completionRate =
      totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0

    // 5. 返回用户信息和统计
    return successResponse({
      user: {
        ...user,
        stats: {
          totalPlans,
          completedPlans,
          completionRate,
        },
      },
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return serverErrorResponse('获取用户信息失败')
  }
}

