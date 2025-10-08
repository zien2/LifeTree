# 📡 LifeTree API 开发进度文档

**更新时间**: 2024-10-07  
**当前版本**: v0.1.0

---

## 📊 总体进度

| 模块 | API进度 | 页面进度 | 状态 |
|------|---------|----------|------|
| 用户认证 | 3/3 ✅ | 3/3 ✅ | ✅ 已完成 |
| 计划管理 | 0/5 ⏳ | 0/1 ⏳ | 未开始 |
| 生命树 | 0/2 ⏳ | 0/1 ⏳ | 未开始 |
| AI分析 | 0/3 ⏳ | 0/1 ⏳ | 未开始 |
| 通知系统 | 0/3 ⏳ | 0/1 ⏳ | 未开始 |
| 数据统计 | 0/1 ⏳ | 0/1 ⏳ | 未开始 |

---

## 🔐 1. 用户认证模块

### 1.1 用户注册

**状态**: ✅ 已完成  
**API**: `POST /api/auth/register`  
**页面**: `/register` ✅ 已完成

#### 请求参数
```json
{
  "email": "user@example.com",      // 必填，邮箱格式
  "password": "Password123",         // 必填，8+字符，含大小写+数字
  "name": "张三"                     // 可选，用户昵称
}
```

#### 成功响应 (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmgg6f4c10000pu74yom7xf5o",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-10-07T06:26:09.458Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  },
  "message": "注册成功"
}
```

#### 错误响应
```json
// 邮箱已存在 (409)
{
  "success": false,
  "error": "该邮箱已被注册",
  "code": "EMAIL_EXISTS"
}

// 密码强度不足 (400)
{
  "success": false,
  "error": "密码必须包含大小写字母和数字",
  "code": "WEAK_PASSWORD"
}
```

#### 测试命令
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@lifetree.com","password":"Test123456","name":"测试用户"}'
```

---

### 1.2 用户登录

**状态**: ✅ 已完成  
**API**: `POST /api/auth/login`  
**页面**: `/login` ✅ 已完成

#### 请求参数
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmgg6f4c10000pu74yom7xf5o",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-10-07T06:26:09.458Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  },
  "message": "登录成功"
}
```

#### 错误响应
```json
// 邮箱或密码错误 (401)
{
  "success": false,
  "error": "邮箱或密码错误",
  "code": "INVALID_CREDENTIALS"
}
```

#### 测试命令
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@lifetree.com","password":"Test123456"}'
```

---

### 1.3 获取当前用户

**状态**: ✅ 已完成  
**API**: `GET /api/auth/me`  
**页面**: 全局使用

#### 请求头
```
Authorization: Bearer {token}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmgg6f4c10000pu74yom7xf5o",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-10-07T06:26:09.458Z",
      "updatedAt": "2024-10-07T06:26:09.458Z",
      "stats": {
        "totalPlans": 0,
        "completedPlans": 0,
        "completionRate": 0
      }
    }
  },
  "message": "操作成功"
}
```

#### 错误响应
```json
// 未授权 (401)
{
  "success": false,
  "error": "未提供认证信息",
  "code": "UNAUTHORIZED"
}
```

#### 测试命令
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 2. 计划管理模块

### 2.1 获取计划列表

**状态**: ⏳ 待开发  
**API**: `GET /api/plans`  
**页面**: `/dashboard/plans`

#### 请求头
```
Authorization: Bearer {token}
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | PENDING/COMPLETED/OVERDUE |
| priority | string | 否 | HIGH/MEDIUM/LOW |
| startDate | string | 否 | YYYY-MM-DD |
| endDate | string | 否 | YYYY-MM-DD |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan_xxx",
        "title": "完成项目报告",
        "description": "需要包含数据分析",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": "2024-10-08T00:00:00.000Z",
        "completedAt": null,
        "createdAt": "2024-10-07T10:00:00.000Z",
        "updatedAt": "2024-10-07T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 2.2 创建计划

**状态**: ⏳ 待开发  
**API**: `POST /api/plans`  
**页面**: `/dashboard/plans`（创建对话框）

#### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### 请求参数
```json
{
  "title": "学习 React Hooks",        // 必填，1-255字符
  "description": "深入学习 useState",  // 可选
  "priority": "MEDIUM",                // 必填：HIGH/MEDIUM/LOW
  "dueDate": "2024-10-10T00:00:00.000Z" // 可选
}
```

#### 成功响应 (201)
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_new123",
      "title": "学习 React Hooks",
      "priority": "MEDIUM",
      "status": "PENDING",
      "dueDate": "2024-10-10T00:00:00.000Z",
      "createdAt": "2024-10-07T15:00:00.000Z"
    },
    "leaf": {
      "id": "leaf_new123",
      "color": "yellow",
      "status": "GROWING"
    },
    "aiAnalysis": {
      "score": 4,
      "content": "这是一个很好的学习计划..."
    }
  },
  "message": "计划创建成功"
}
```

---

### 2.3 更新计划

**状态**: ⏳ 待开发  
**API**: `PATCH /api/plans/:id`  
**页面**: `/dashboard/plans`（编辑对话框）

#### 请求参数
```json
{
  "title": "新标题",              // 可选
  "description": "新描述",        // 可选
  "priority": "HIGH",            // 可选
  "status": "COMPLETED",         // 可选
  "dueDate": "2024-10-15T00:00:00.000Z" // 可选
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_xxx",
      "status": "COMPLETED",
      "completedAt": "2024-10-07T16:00:00.000Z"
    },
    "tree": {
      "health": 102,
      "level": 1
    },
    "leaf": {
      "color": "green",
      "status": "FLOATING"
    }
  },
  "message": "计划更新成功"
}
```

---

### 2.4 删除计划

**状态**: ⏳ 待开发  
**API**: `DELETE /api/plans/:id`  
**页面**: `/dashboard/plans`

#### 成功响应 (204)
```
No Content
```

---

### 2.5 获取计划详情

**状态**: ⏳ 待开发  
**API**: `GET /api/plans/:id`  
**页面**: `/dashboard/plans/:id`

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_xxx",
      "title": "完成项目报告",
      "description": "需要包含数据分析",
      "priority": "HIGH",
      "status": "PENDING",
      "leaves": [
        {
          "id": "leaf_xxx",
          "color": "red",
          "status": "FLOATING"
        }
      ]
    }
  }
}
```

---

## 🌲 3. 生命树模块

### 3.1 获取生命树列表

**状态**: ⏳ 待开发  
**API**: `GET /api/trees`  
**页面**: `/dashboard/tree`

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | DEFAULT/ANNUAL/CUSTOM |
| includeLeaves | boolean | 否 | 是否包含叶子，默认true |

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "trees": [
      {
        "id": "tree_xxx",
        "name": "2024年成长树",
        "type": "ANNUAL",
        "health": 95,
        "level": 3,
        "leaves": [
          {
            "id": "leaf_xxx",
            "color": "green",
            "status": "FLOATING",
            "positionX": 100.5,
            "positionY": 200.3,
            "plan": {
              "id": "plan_xxx",
              "title": "完成项目报告"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 3.2 创建新树

**状态**: ⏳ 待开发  
**API**: `POST /api/trees`  
**页面**: `/dashboard/tree`

#### 请求参数
```json
{
  "name": "学习计划树",
  "type": "CUSTOM"
}
```

#### 成功响应 (201)
```json
{
  "success": true,
  "data": {
    "tree": {
      "id": "tree_new123",
      "name": "学习计划树",
      "type": "CUSTOM",
      "health": 100,
      "level": 1
    }
  },
  "message": "生命树创建成功"
}
```

---

## 🤖 4. AI分析模块

### 4.1 获取分析报告列表

**状态**: ⏳ 待开发  
**API**: `GET /api/ai/analyses`  
**页面**: `/dashboard/analytics`

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | DAILY/WEEKLY/MONTHLY/CUSTOM |
| period | string | 否 | 如 2024-W42 或 2024-10 |

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "ai_xxx",
        "type": "WEEKLY",
        "content": "本周完成率85%...",
        "period": "2024-W42",
        "createdAt": "2024-10-07T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.2 获取最新周期报告

**状态**: ⏳ 待开发  
**API**: `GET /api/ai/reports/latest?type=WEEKLY`  
**页面**: `/dashboard/analytics`

---

### 4.3 AI问答

**状态**: ⏳ 待开发  
**API**: `POST /api/ai/ask`  
**页面**: `/dashboard/analytics`

#### 请求参数
```json
{
  "question": "如何提高我的计划完成率？"
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "analysis": {
      "content": "根据你的历史数据分析...",
      "suggestions": [
        "减少高优先级任务数量",
        "合理设置截止时间"
      ]
    }
  }
}
```

---

## 🔔 5. 通知系统模块

### 5.1 获取通知列表

**状态**: ⏳ 待开发  
**API**: `GET /api/notifications`  
**页面**: 全局通知中心

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isRead | boolean | 否 | 筛选已读/未读 |
| type | string | 否 | ANALYSIS/REMINDER/SYSTEM |

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_xxx",
        "title": "本周分析报告已生成",
        "content": "您的本周完成率为85%",
        "type": "ANALYSIS",
        "isRead": false,
        "createdAt": "2024-10-07T08:00:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### 5.2 标记通知已读

**状态**: ⏳ 待开发  
**API**: `PATCH /api/notifications/:id`

#### 请求参数
```json
{
  "isRead": true
}
```

---

### 5.3 批量标记已读

**状态**: ⏳ 待开发  
**API**: `POST /api/notifications/mark-all-read`

---

## 📊 6. 数据统计模块

### 6.1 获取用户统计

**状态**: ⏳ 待开发  
**API**: `GET /api/stats?period=week`  
**页面**: `/dashboard`

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | day/week/month/year |

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "stats": {
      "overview": {
        "totalPlans": 100,
        "completedPlans": 85,
        "completionRate": 85
      },
      "byPriority": {
        "HIGH": { "total": 30, "completed": 28 },
        "MEDIUM": { "total": 50, "completed": 42 },
        "LOW": { "total": 20, "completed": 15 }
      },
      "trend": [
        {
          "date": "2024-10-01",
          "completed": 5,
          "total": 6
        }
      ]
    }
  }
}
```

---

## 📄 页面路由规划

| 路由 | 页面名称 | 状态 | 需要认证 |
|------|----------|------|----------|
| `/` | 首页 | ✅ 已完成 | ❌ |
| `/login` | 登录页 | ✅ 已完成 | ❌ |
| `/register` | 注册页 | ✅ 已完成 | ❌ |
| `/dashboard` | 仪表板 | ✅ 已完成 | ✅ |
| `/dashboard/plans` | 计划管理 | ⏳ 待开发 | ✅ |
| `/dashboard/tree` | 生命树 | ⏳ 待开发 | ✅ |
| `/dashboard/analytics` | 数据分析 | ⏳ 待开发 | ✅ |
| `/dashboard/settings` | 设置 | ⏳ 待开发 | ✅ |

---

## 🔧 技术实现细节

### 认证流程

```
1. 用户输入邮箱密码 → 前端验证
2. 发送 POST /api/auth/login
3. 后端验证 → 生成 JWT Token
4. 前端存储 Token (localStorage)
5. 后续请求携带 Authorization: Bearer {token}
6. 后端中间件验证 Token
```

### Token 存储方案

```typescript
// 存储 Token
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))

// 读取 Token
const token = localStorage.getItem('token')

// 清除 Token（登出）
localStorage.removeItem('token')
localStorage.removeItem('user')
```

### API 请求封装

```typescript
// lib/api.ts
const API_BASE_URL = '/api'

async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  return response.json()
}
```

---

## 📝 开发检查清单

### 用户认证 ✅
- [x] 注册 API
- [x] 登录 API
- [x] 获取当前用户 API
- [x] JWT Token 生成
- [x] 密码加密
- [x] 登录页面
- [x] 注册页面
- [x] 仪表板页面
- [x] 认证状态管理

### 计划管理 ⏳
- [ ] 获取计划列表 API
- [ ] 创建计划 API
- [ ] 更新计划 API
- [ ] 删除计划 API
- [ ] 计划管理页面
- [ ] 计划创建表单
- [ ] 计划筛选功能

### 生命树 ⏳
- [ ] 获取树列表 API
- [ ] 创建树 API
- [ ] 树可视化组件
- [ ] 叶子动画效果
- [ ] 树页面

### AI分析 ⏳
- [ ] 分析列表 API
- [ ] 周期报告 API
- [ ] AI问答 API
- [ ] OpenAI集成
- [ ] 分析页面

### 通知系统 ⏳
- [ ] 通知列表 API
- [ ] 标记已读 API
- [ ] 通知组件
- [ ] 通知提醒

### 数据统计 ⏳
- [ ] 统计数据 API
- [ ] 图表组件
- [ ] 仪表板页面

---

**最后更新**: 2024-10-07  
**维护者**: LifeTree 开发团队

