import { verifyToken as jwtVerifyToken } from './jwt'
import { extractTokenFromHeaders } from './security-config'

export interface AuthUser {
  id: string
  email: string
  name?: string
  emailVerified: boolean
}

// 重新导出 verifyToken 以保持向后兼容
export { verifyToken } from './jwt'

// Client code should use /api/auth/me; the session token is HttpOnly.
export function getAuthUser(): AuthUser | null {
  return null
}

// 后端版本 - 从请求头读取并验证JWT token
export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
  try {
    const token = extractTokenFromHeaders(request.headers)
    if (!token) return null

    const payload = await jwtVerifyToken(token)
    if (!payload) return null
    
    // 将 JWTPayload 转换为 AuthUser
    return {
      id: payload.userId,
      email: payload.email,
      emailVerified: true // 假设已验证，实际应该从数据库查询
    }
  } catch (error) {
    console.error('验证用户身份失败:', error)
    return null
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    // Remove legacy client-side session artifacts from older releases.
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export function requireAuth(): AuthUser {
  const user = getAuthUser()
  if (!user) {
    throw new Error('用户未登录')
  }
  return user
}
