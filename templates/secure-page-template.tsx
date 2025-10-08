'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser, type AuthUser } from '@/lib/auth'
import { message } from 'antd'

/**
 * 安全的页面组件模板
 * 使用此模板创建新的受保护页面
 */

export default function SecurePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 检查用户是否已登录
    const authUser = getAuthUser()
    
    if (!authUser) {
      // 用户未登录，重定向到登录页
      message.warning('请先登录')
      router.push('/login')
      return
    }
    
    setUser(authUser)
    setLoading(false)
    
    // 页面初始化逻辑
    initializePage()
  }, [router])

  const initializePage = async () => {
    try {
      // 页面初始化逻辑
      // 例如：获取数据、设置状态等
      console.log('页面初始化完成')
    } catch (error) {
      console.error('页面初始化失败:', error)
      message.error('页面加载失败')
    }
  }

  // 显示加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>加载中...</div>
      </div>
    )
  }

  // 如果用户未登录，不渲染内容（会被重定向）
  if (!user) {
    return null
  }

  return (
    <div>
      {/* 页面内容 */}
      <h1>受保护的页面</h1>
      <p>欢迎，{user.name || user.email}！</p>
      
      {/* 你的页面内容... */}
    </div>
  )
}

/**
 * 使用说明：
 * 
 * 1. 复制此模板到你的页面文件
 * 2. 修改组件名称和页面内容
 * 3. 在 initializePage 函数中添加页面初始化逻辑
 * 4. 确保页面路径在 middleware.ts 的受保护路径列表中
 * 
 * 安全特性：
 * - 自动检查用户登录状态
 * - 未登录用户自动重定向到登录页
 * - 显示加载状态
 * - 错误处理
 */
