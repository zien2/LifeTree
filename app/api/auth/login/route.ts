import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { validateEmail, sanitizeInput } from '@/lib/validation'
import { signToken } from '@/lib/jwt'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response'

/**
 * 用户登录 API
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 1. 验证必填字段
    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空', 'REQUIRED_FIELDS')
    }

    // 2. 清理输入
    const cleanEmail = sanitizeInput(email).toLowerCase()

    // 3. 验证邮箱格式
    if (!validateEmail(cleanEmail)) {
      return errorResponse('邮箱格式不正确', 'INVALID_EMAIL')
    }

    // 4. 查找用户
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return errorResponse('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
    }

    // 5. 验证密码
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return errorResponse('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
    }

    // 6. 检查邮箱是否已验证
    if (!user.emailVerified) {
      return errorResponse(
        '请先验证邮箱后再登录。验证邮件已发送到您的邮箱，请查收。',
        'EMAIL_NOT_VERIFIED',
        403
      )
    }

    // 7. 生成 JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // 8. 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return successResponse(
      {
        user: userWithoutPassword,
        token,
        expiresIn: 604800, // 7天（秒）
      },
      '登录成功'
    )
  } catch (error) {
    console.error('登录错误:', error)
    return serverErrorResponse('登录失败，请稍后重试')
  }
}

