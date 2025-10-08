/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证用户名
 */
export function validateUsername(name: string): {
  valid: boolean
  message?: string
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '用户名不能为空' }
  }

  if (name.length < 2) {
    return { valid: false, message: '用户名至少需要2个字符' }
  }

  if (name.length > 50) {
    return { valid: false, message: '用户名不能超过50个字符' }
  }

  return { valid: true }
}

/**
 * 清理和验证输入数据
 */
export function sanitizeInput(input: string): string {
  return input.trim()
}

