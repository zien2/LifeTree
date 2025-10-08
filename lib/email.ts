/**
 * 邮件发送工具函数
 * 支持发送验证邮件、通知邮件等
 */

import nodemailer from 'nodemailer'
import crypto from 'crypto'

// 邮件配置接口
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 获取邮件配置
function getEmailConfig(): EmailConfig {
  // 从环境变量读取SMTP配置
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  }
}

// 创建邮件传输器
function createTransporter() {
  const config = getEmailConfig()
  
  // 如果未配置SMTP，返回测试账号（用于开发）
  if (!config.auth.user || !config.auth.pass) {
    console.warn('⚠️  未配置SMTP，使用Ethereal测试账号（邮件不会真实发送）')
    // 在实际使用中，应该使用 nodemailer.createTestAccount() 创建测试账号
    // 这里先返回一个模拟的传输器
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test',
      },
    })
  }

  return nodemailer.createTransport(config)
}

/**
 * 生成邮箱验证令牌
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 生成验证链接过期时间（24小时后）
 */
export function getTokenExpiryDate(): Date {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 24) // 24小时有效期
  return expiryDate
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  try {
    const transporter = createTransporter()

    // 构建验证链接
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

    // 邮件HTML内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证您的邮箱 - LifeTree</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- 头部 -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🌳 LifeTree</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">生命树计划管理</p>
            </td>
          </tr>
          
          <!-- 内容 -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">欢迎，${name || '用户'}！</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                感谢您注册 LifeTree！为了确保您的账号安全，请点击下方按钮验证您的邮箱地址。
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 14px 40px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  验证邮箱
                </a>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                <strong>注意：</strong>此验证链接将在 24 小时后过期。<br>
                如果您没有注册 LifeTree 账号，请忽略此邮件。
              </p>
            </td>
          </tr>
          
          <!-- 底部 -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 LifeTree. 保留所有权利。<br>
                这是一封自动发送的邮件，请勿直接回复。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // 纯文本版本（备用）
    const textContent = `
欢迎，${name || '用户'}！

感谢您注册 LifeTree！请访问以下链接验证您的邮箱地址：

${verificationUrl}

注意：此验证链接将在 24 小时后过期。
如果您没有注册 LifeTree 账号，请忽略此邮件。

© 2024 LifeTree
    `

    // 发送邮件
    const info = await transporter.sendMail({
      from: `"LifeTree" <${process.env.SMTP_USER || 'noreply@lifetree.com'}>`,
      to,
      subject: '验证您的 LifeTree 邮箱',
      text: textContent,
      html: htmlContent,
    })

    console.log('✅ 验证邮件已发送:', info.messageId)

    // 如果是Ethereal测试账号，返回预览URL
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log('📧 邮件预览链接:', previewUrl)
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    }
  } catch (error) {
    console.error('❌ 发送验证邮件失败:', error)
    return { success: false }
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const transporter = createTransporter()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>重置密码 - LifeTree</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🌳 LifeTree</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">重置密码请求</h2>
              <p style="color: #666666; line-height: 1.6;">
                您好，${name || '用户'}！<br><br>
                我们收到了重置您账号密码的请求。点击下方按钮设置新密码：
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 14px 40px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px;">
                  重置密码
                </a>
              </div>
              <p style="color: #999999; font-size: 14px;">
                链接: <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              <p style="color: #999999; font-size: 12px;">
                此链接将在 1 小时后过期。<br>
                如果您没有请求重置密码，请忽略此邮件。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const info = await transporter.sendMail({
      from: `"LifeTree" <${process.env.SMTP_USER || 'noreply@lifetree.com'}>`,
      to,
      subject: '重置您的 LifeTree 密码',
      html: htmlContent,
    })

    console.log('✅ 密码重置邮件已发送:', info.messageId)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('❌ 发送密码重置邮件失败:', error)
    return { success: false }
  }
}

