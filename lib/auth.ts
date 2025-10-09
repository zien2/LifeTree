import { verifyToken as jwtVerifyToken } from './jwt'

export interface AuthUser {
  id: string
  email: string
  name?: string
  emailVerified: boolean
}

// 重新导出 verifyToken 以保持向后兼容
export { verifyToken } from './jwt'

// 前端版本 - 从localStorage读取用户信息
export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      return null
    }
    
    // 前端不验证JWT token，只检查是否存在
    // JWT验证应该在后端进行
    
    // 解析用户信息
    const user = JSON.parse(userStr)
    return user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 后端版本 - 从请求头读取并验证JWT token
export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
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

export function logout(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  // 清除cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function requireAuth(): AuthUser {
  const user = getAuthUser()
  if (!user) {
    throw new Error('用户未登录')
  }
  return user
}