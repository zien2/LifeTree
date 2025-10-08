import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/password'
import { validateEmail, sanitizeInput } from '@/lib/validation'
import { signToken } from '@/lib/jwt'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response'
import {
  sendVerificationEmail,
  generateVerificationToken,
  getTokenExpiryDate,
} from '@/lib/email'

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // 1. 验证必填字段
    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空', 'REQUIRED_FIELDS')
    }

    // 2. 清理输入
    const cleanEmail = sanitizeInput(email).toLowerCase()
    const cleanName = name ? sanitizeInput(name) : null

    // 3. 验证邮箱格式
    if (!validateEmail(cleanEmail)) {
      return errorResponse('邮箱格式不正确', 'INVALID_EMAIL')
    }

    // 4. 验证密码强度
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return errorResponse(
        passwordValidation.message || '密码不符合要求',
        'WEAK_PASSWORD'
      )
    }

    // 5. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existingUser) {
      return errorResponse('该邮箱已被注册', 'EMAIL_EXISTS', 409)
    }

    // 6. 加密密码
    const hashedPassword = await hashPassword(password)

    // 7. 生成邮箱验证令牌
    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getTokenExpiryDate()

    // 8. 创建用户
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: cleanName,
        emailVerified: false,
        verificationToken,
        tokenExpiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    // 9. 为新用户创建默认生命树
    await prisma.tree.create({
      data: {
        name: '我的生命树',
        type: 'DEFAULT',
        userId: user.id,
      },
    })

    // 10. 发送验证邮件（不阻塞响应）
    const emailResult = await sendVerificationEmail(
      user.email,
      user.name || '用户',
      verificationToken
    )

    if (!emailResult.success) {
      console.warn('⚠️  验证邮件发送失败，但用户已创建成功')
    }

    // 11. 生成 JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // 12. 返回用户信息和 Token
    const responseData: any = {
      user,
      token,
      expiresIn: 604800, // 7天（秒）
      emailVerificationSent: emailResult.success,
    }

    // 开发环境下返回邮件预览链接
    if (process.env.NODE_ENV === 'development' && emailResult.previewUrl) {
      responseData.emailPreviewUrl = emailResult.previewUrl
      console.log('📧 邮件预览链接:', emailResult.previewUrl)
    }

    return successResponse(
      responseData,
      '注册成功，请查收验证邮件',
      201
    )
  } catch (error) {
    console.error('注册错误:', error)
    return serverErrorResponse('注册失败，请稍后重试')
  }
}

