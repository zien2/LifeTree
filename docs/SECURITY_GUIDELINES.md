# LifeTree 安全开发规范

## 🔒 核心安全原则

### 1. 身份验证要求
- **所有用户相关功能必须要求登录**
- **所有API端点必须验证JWT token**
- **所有受保护路由必须通过中间件检查**

### 2. 路由保护规范

#### 受保护的路径（需要登录）
```
/dashboard/*          - 所有仪表板页面
/api/plans/*          - 计划管理API
/api/notifications/*  - 通知系统API
/api/analytics/*      - 数据分析API
/api/user/*           - 用户相关API
/api/settings/*       - 设置相关API
/api/export/*         - 数据导出API
/api/import/*         - 数据导入API
/api/backup/*         - 备份相关API
/api/ai/*             - AI分析API
```

#### 公开路径（无需登录）
```
/                     - 首页
/login                - 登录页
/register             - 注册页
/verify-email         - 邮箱验证页
/forgot-password      - 忘记密码页
/reset-password       - 重置密码页
/api/auth/*           - 认证相关API
/api/public/*         - 公开API（如果有）
```

## 🛡️ 开发安全检查清单

### 新增页面时
- [ ] 页面路径是否在受保护列表中？
- [ ] 是否添加了客户端身份验证检查？
- [ ] 是否在中间件中注册了保护路径？
- [ ] 页面是否处理未登录状态？

### 新增API时
- [ ] API路径是否在受保护列表中？
- [ ] 是否验证了JWT token？
- [ ] 是否检查了用户权限？
- [ ] 是否验证了输入参数？
- [ ] 是否处理了错误情况？

### 新增功能时
- [ ] 功能是否要求用户登录？
- [ ] 数据是否按用户隔离？
- [ ] 是否有权限控制？
- [ ] 是否记录操作日志？

## 🔧 安全开发模板

### 1. 受保护页面模板
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

export default function ProtectedPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getAuthUser()
    if (!user) {
      router.push('/login')
      return
    }
    // 页面逻辑...
  }, [router])

  // 页面内容...
}
```

### 2. 受保护API模板
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. 验证token
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供认证令牌' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // 2. 执行业务逻辑
    // 确保数据按用户隔离
    const data = await prisma.someModel.findMany({
      where: { userId: payload.userId }
    })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
```

### 3. 中间件配置更新
```typescript
// middleware.ts
const protectedPaths = [
  '/dashboard',
  '/api/plans',
  '/api/notifications',
  '/api/analytics',
  '/api/user',
  '/api/settings',
  '/api/export',
  '/api/import',
  '/api/backup',
  '/api/ai',
  // 新增路径必须添加到这里
]
```

## 🚨 常见安全错误

### ❌ 错误做法
```typescript
// 1. 忘记验证token
export async function GET() {
  const data = await prisma.plan.findMany() // 危险！
  return NextResponse.json({ data })
}

// 2. 忘记用户隔离
export async function GET(request: NextRequest) {
  const payload = verifyToken(token)
  const data = await prisma.plan.findMany() // 危险！会返回所有用户数据
  return NextResponse.json({ data })
}

// 3. 客户端不检查登录状态
export default function Page() {
  // 直接渲染页面，没有检查登录状态
  return <div>页面内容</div>
}
```

### ✅ 正确做法
```typescript
// 1. 完整验证流程
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  
  const data = await prisma.plan.findMany({
    where: { userId: payload.userId } // 按用户隔离
  })
  return NextResponse.json({ data })
}

// 2. 客户端安全检查
export default function Page() {
  const router = useRouter()
  
  useEffect(() => {
    const user = getAuthUser()
    if (!user) {
      router.push('/login')
      return
    }
  }, [router])
  
  return <div>页面内容</div>
}
```

## 📋 部署前安全检查

- [ ] 所有受保护路径都已测试
- [ ] 所有API都验证了token
- [ ] 所有数据都按用户隔离
- [ ] 没有硬编码的敏感信息
- [ ] 错误信息不泄露敏感数据
- [ ] 日志不记录敏感信息
- [ ] 环境变量正确配置
- [ ] HTTPS已启用（生产环境）

## 🔄 持续安全维护

1. **定期审查**：每月检查受保护路径列表
2. **依赖更新**：及时更新安全相关的依赖包
3. **日志监控**：监控异常登录和访问模式
4. **权限审计**：定期检查用户权限设置
5. **数据备份**：确保数据安全备份

---

**记住：安全不是一次性的工作，而是持续的过程！**
