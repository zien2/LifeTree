import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 加密密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 验证密码强度
 * - 至少8个字符
 * - 包含大小写字母和数字
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8个字符' }
  }

  if (password.length > 50) {
    return { valid: false, message: '密码不能超过50个字符' }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      message: '密码必须包含大小写字母和数字',
    }
  }

  return { valid: true }
}

