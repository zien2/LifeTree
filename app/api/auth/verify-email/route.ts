/**
 * 邮箱验证 API
 * GET /api/auth/verify-email?token=xxx
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    // 获取验证令牌
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return ApiResponse.error('缺少验证令牌', 400, 'MISSING_TOKEN')
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        tokenExpiresAt: true,
      },
    })

    if (!user) {
      return ApiResponse.error('验证令牌无效', 400, 'INVALID_TOKEN')
    }

    // 检查是否已验证
    if (user.emailVerified) {
      // 重定向到登录页，带成功消息
      return Response.redirect(
        new URL('/login?verified=already', request.url),
        302
      )
    }

    // 检查令牌是否过期
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      return ApiResponse.error('验证链接已过期，请重新发送', 400, 'TOKEN_EXPIRED')
    }

    // 更新用户状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, // 清除令牌
        tokenExpiresAt: null,
      },
    })

    console.log(`✅ 用户邮箱已验证: ${user.email}`)

    // 重定向到登录页，带成功消息
    return Response.redirect(
      new URL('/login?verified=success', request.url),
      302
    )
  } catch (error) {
    console.error('邮箱验证失败:', error)
    return ApiResponse.error('验证失败，请稍后重试', 500)
  }
}

