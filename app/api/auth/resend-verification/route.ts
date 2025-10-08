/**
 * 重新发送验证邮件 API
 * POST /api/auth/resend-verification
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/response'
import {
  sendVerificationEmail,
  generateVerificationToken,
  getTokenExpiryDate,
} from '@/lib/email'

// 请求参数验证
const resendSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json()

    // 验证参数
    const validation = resendSchema.safeParse(body)
    if (!validation.success) {
      return ApiResponse.error(
        validation.error.errors[0].message,
        400,
        'VALIDATION_ERROR'
      )
    }

    const { email } = validation.data

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    if (!user) {
      // 出于安全考虑，不透露邮箱是否存在
      return ApiResponse.success(
        { message: '如果该邮箱已注册，验证邮件将发送到您的邮箱' },
        '操作成功'
      )
    }

    // 检查是否已验证
    if (user.emailVerified) {
      return ApiResponse.error('该邮箱已完成验证', 400, 'ALREADY_VERIFIED')
    }

    // 生成新的验证令牌
    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getTokenExpiryDate()

    // 更新用户
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiresAt,
      },
    })

    // 发送验证邮件
    const emailResult = await sendVerificationEmail(
      user.email,
      user.name || '用户',
      verificationToken
    )

    if (!emailResult.success) {
      return ApiResponse.error('发送验证邮件失败，请稍后重试', 500)
    }

    console.log(`📧 已重新发送验证邮件到: ${user.email}`)

    // 如果是开发环境且有预览URL，返回给前端
    const responseData: any = {
      message: '验证邮件已发送，请查收',
    }

    if (process.env.NODE_ENV === 'development' && emailResult.previewUrl) {
      responseData.previewUrl = emailResult.previewUrl
    }

    return ApiResponse.success(responseData, '验证邮件已发送')
  } catch (error) {
    console.error('重新发送验证邮件失败:', error)
    return ApiResponse.error('操作失败，请稍后重试', 500)
  }
}

