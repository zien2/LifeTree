# 📡 LifeTree API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **Base URL**: `https://your-domain.com/api` (生产环境)
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 认证说明

除了登录和注册接口外，所有 API 都需要在请求头中携带 JWT Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容） |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 认证接口

### 1.1 用户注册

**接口**: `POST /api/auth/register`

**请求参数**:
```json
{
  "email": "user@example.com",     // 必填，邮箱格式
  "password": "Password123!",       // 必填，8-20位，包含大小写字母和数字
  "name": "张三"                    // 可选，用户昵称
}
```

**成功响应** (201):
```json
{
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "张三",
    "createdAt": "2024-10-07T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400  // Token 有效期（秒）
}
```

**错误响应**:
```json
// 邮箱已存在 (400)
{
  "error": "该邮箱已被注册",
  "code": "EMAIL_EXISTS"
}

// 密码强度不足 (400)
{
  "error": "密码必须包含大小写字母和数字",
  "code": "WEAK_PASSWORD"
}
```

---

### 1.2 用户登录

**接口**: `POST /api/auth/login`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**成功响应** (200):
```json
{
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "张三"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**错误响应**:
```json
// 邮箱或密码错误 (401)
{
  "error": "邮箱或密码错误",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 1.3 获取当前用户信息

**接口**: `GET /api/auth/me`

**请求头**:
```http
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "张三",
    "createdAt": "2024-10-07T10:00:00.000Z",
    "stats": {
      "totalPlans": 50,
      "completedPlans": 42,
      "completionRate": 84
    }
  }
}
```

---

## 2. 计划管理接口

### 2.1 获取计划列表

**接口**: `GET /api/plans`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选：PENDING/COMPLETED/OVERDUE |
| priority | string | 否 | 优先级筛选：HIGH/MEDIUM/LOW |
| startDate | string | 否 | 开始日期：YYYY-MM-DD |
| endDate | string | 否 | 结束日期：YYYY-MM-DD |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**请求示例**:
```http
GET /api/plans?status=PENDING&priority=HIGH&page=1&limit=10
```

**成功响应** (200):
```json
{
  "plans": [
    {
      "id": "plan_xxx",
      "title": "完成项目报告",
      "description": "需要包含数据分析部分",
      "priority": "HIGH",
      "status": "PENDING",
      "dueDate": "2024-10-08T00:00:00.000Z",
      "completedAt": null,
      "createdAt": "2024-10-07T10:00:00.000Z",
      "updatedAt": "2024-10-07T10:00:00.000Z",
      "user": {
        "id": "user_xxx",
        "name": "张三"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 2.2 创建计划

**接口**: `POST /api/plans`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "title": "学习 React Hooks",          // 必填，1-255字符
  "description": "深入学习 useState 和 useEffect",  // 可选
  "priority": "MEDIUM",                  // 必填：HIGH/MEDIUM/LOW
  "dueDate": "2024-10-10T00:00:00.000Z" // 可选，截止日期
}
```

**成功响应** (201):
```json
{
  "plan": {
    "id": "plan_new123",
    "title": "学习 React Hooks",
    "description": "深入学习 useState 和 useEffect",
    "priority": "MEDIUM",
    "status": "PENDING",
    "dueDate": "2024-10-10T00:00:00.000Z",
    "createdAt": "2024-10-07T15:00:00.000Z",
    "userId": "user_xxx"
  },
  "leaf": {
    "id": "leaf_new123",
    "color": "yellow",
    "status": "GROWING",
    "positionX": 150.5,
    "positionY": 200.8
  },
  "aiAnalysis": {
    "id": "ai_new123",
    "type": "DAILY",
    "score": 4,
    "content": "这是一个很好的学习计划。React Hooks 是现代 React 开发的核心技能，建议配合实际项目练习，效果会更好。"
  }
}
```

---

### 2.3 获取计划详情

**接口**: `GET /api/plans/:id`

**请求头**:
```http
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "plan": {
    "id": "plan_xxx",
    "title": "完成项目报告",
    "description": "需要包含数据分析部分",
    "priority": "HIGH",
    "status": "PENDING",
    "dueDate": "2024-10-08T00:00:00.000Z",
    "completedAt": null,
    "createdAt": "2024-10-07T10:00:00.000Z",
    "leaves": [
      {
        "id": "leaf_xxx",
        "color": "red",
        "status": "FLOATING"
      }
    ],
    "aiAnalysis": {
      "score": 5,
      "content": "..."
    }
  }
}
```

**错误响应**:
```json
// 计划不存在 (404)
{
  "error": "计划不存在",
  "code": "PLAN_NOT_FOUND"
}

// 无权访问 (403)
{
  "error": "无权访问此计划",
  "code": "FORBIDDEN"
}
```

---

### 2.4 更新计划

**接口**: `PATCH /api/plans/:id`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数** (所有字段都是可选的):
```json
{
  "title": "新标题",
  "description": "新描述",
  "priority": "HIGH",
  "status": "COMPLETED",
  "dueDate": "2024-10-15T00:00:00.000Z"
}
```

**成功响应** (200):
```json
{
  "plan": {
    "id": "plan_xxx",
    "title": "新标题",
    "status": "COMPLETED",
    "completedAt": "2024-10-07T16:00:00.000Z",
    // ... 其他字段
  },
  "tree": {
    "health": 102,  // 完成计划后 +2
    "level": 1
  },
  "leaf": {
    "color": "green",  // 完成后变绿
    "status": "FLOATING"
  }
}
```

---

### 2.5 删除计划

**接口**: `DELETE /api/plans/:id`

**请求头**:
```http
Authorization: Bearer {token}
```

**成功响应** (204):
```
No Content
```

---

## 3. 生命树接口

### 3.1 获取用户的生命树列表

**接口**: `GET /api/trees`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 树类型：DEFAULT/ANNUAL/CUSTOM |
| includeLeaves | boolean | 否 | 是否包含叶子数据，默认 true |

**成功响应** (200):
```json
{
  "trees": [
    {
      "id": "tree_xxx",
      "name": "2024年成长树",
      "type": "ANNUAL",
      "health": 95,
      "level": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-10-07T16:00:00.000Z",
      "leaves": [
        {
          "id": "leaf_xxx",
          "color": "green",
          "status": "FLOATING",
          "positionX": 100.5,
          "positionY": 200.3,
          "rotation": 0,
          "opacity": 1.0,
          "plan": {
            "id": "plan_xxx",
            "title": "完成项目报告",
            "priority": "HIGH",
            "status": "COMPLETED"
          }
        }
      ],
      "stats": {
        "totalLeaves": 50,
        "greenLeaves": 42,
        "brownLeaves": 3,
        "floatingLeaves": 5
      }
    }
  ]
}
```

---

### 3.2 创建新树

**接口**: `POST /api/trees`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "学习计划树",      // 必填
  "type": "CUSTOM"           // 必填：DEFAULT/ANNUAL/CUSTOM
}
```

**成功响应** (201):
```json
{
  "tree": {
    "id": "tree_new123",
    "name": "学习计划树",
    "type": "CUSTOM",
    "health": 100,
    "level": 1,
    "createdAt": "2024-10-07T16:00:00.000Z"
  }
}
```

---

## 4. AI 分析接口

### 4.1 获取分析报告列表

**接口**: `GET /api/ai/analyses`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 分析类型：DAILY/WEEKLY/MONTHLY/CUSTOM |
| period | string | 否 | 周期：如 2024-W42 或 2024-10 |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

**成功响应** (200):
```json
{
  "analyses": [
    {
      "id": "ai_xxx",
      "type": "WEEKLY",
      "content": "本周完成率85%，较上周提升10%。高优先级任务完成情况良好...",
      "score": null,
      "period": "2024-W42",
      "createdAt": "2024-10-07T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

### 4.2 获取最新周期报告

**接口**: `GET /api/ai/reports/latest`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | WEEKLY 或 MONTHLY |

**成功响应** (200):
```json
{
  "report": {
    "id": "ai_xxx",
    "type": "WEEKLY",
    "period": "2024-W42",
    "content": "# 本周成长报告\n\n## 完成情况\n- 总计划数：20\n- 已完成：17\n- 完成率：85%\n\n...",
    "stats": {
      "totalPlans": 20,
      "completed": 17,
      "overdue": 2,
      "pending": 1,
      "completionRate": 85,
      "improvement": 10
    },
    "createdAt": "2024-10-07T00:00:00.000Z"
  }
}
```

---

### 4.3 主动提问（AI 问答）

**接口**: `POST /api/ai/ask`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "question": "如何提高我的计划完成率？"  // 必填，1-500字符
}
```

**成功响应** (200):
```json
{
  "analysis": {
    "id": "ai_custom123",
    "type": "CUSTOM",
    "content": "根据你的历史数据分析，我有以下建议：\n\n1. **减少并发任务数量**\n你目前同时进行的高优先级任务平均有5个，建议控制在3个以内...",
    "suggestions": [
      "减少高优先级任务数量至3个以内",
      "合理设置截止时间，避免过于紧迫",
      "优先完成小任务，积累成就感"
    ],
    "createdAt": "2024-10-07T16:30:00.000Z"
  }
}
```

---

## 5. 通知接口

### 5.1 获取通知列表

**接口**: `GET /api/notifications`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isRead | boolean | 否 | 筛选已读/未读 |
| type | string | 否 | 类型：ANALYSIS/REMINDER/SYSTEM |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

**成功响应** (200):
```json
{
  "notifications": [
    {
      "id": "notif_xxx",
      "title": "本周分析报告已生成",
      "content": "您的本周完成率为85%，点击查看详细分析",
      "type": "ANALYSIS",
      "isRead": false,
      "createdAt": "2024-10-07T08:00:00.000Z",
      "relatedId": "ai_xxx"  // 关联的分析报告ID
    },
    {
      "id": "notif_yyy",
      "title": "重要计划逾期提醒",
      "content": "您有3个高优先级计划已逾期",
      "type": "REMINDER",
      "isRead": false,
      "createdAt": "2024-10-07T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10
  },
  "unreadCount": 5
}
```

---

### 5.2 标记通知已读

**接口**: `PATCH /api/notifications/:id`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "isRead": true
}
```

**成功响应** (200):
```json
{
  "notification": {
    "id": "notif_xxx",
    "isRead": true,
    "updatedAt": "2024-10-07T16:00:00.000Z"
  }
}
```

---

### 5.3 批量标记已读

**接口**: `POST /api/notifications/mark-all-read`

**请求头**:
```http
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "message": "所有通知已标记为已读",
  "count": 5
}
```

---

### 5.4 删除通知

**接口**: `DELETE /api/notifications/:id`

**请求头**:
```http
Authorization: Bearer {token}
```

**成功响应** (204):
```
No Content
```

---

## 6. 统计分析接口

### 6.1 获取用户统计数据

**接口**: `GET /api/stats`

**请求头**:
```http
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | 统计周期：day/week/month/year，默认 week |

**成功响应** (200):
```json
{
  "stats": {
    "overview": {
      "totalPlans": 100,
      "completedPlans": 85,
      "overduePlans": 5,
      "pendingPlans": 10,
      "completionRate": 85
    },
    "byPriority": {
      "HIGH": {
        "total": 30,
        "completed": 28,
        "rate": 93.3
      },
      "MEDIUM": {
        "total": 50,
        "completed": 42,
        "rate": 84
      },
      "LOW": {
        "total": 20,
        "completed": 15,
        "rate": 75
      }
    },
    "trend": [
      {
        "date": "2024-10-01",
        "completed": 5,
        "total": 6,
        "rate": 83.3
      },
      {
        "date": "2024-10-02",
        "completed": 4,
        "total": 5,
        "rate": 80
      }
      // ... 更多日期
    ],
    "tree": {
      "health": 95,
      "level": 3,
      "totalLeaves": 100,
      "greenLeaves": 85
    }
  }
}
```

---

## 错误码对照表

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| EMAIL_EXISTS | 400 | 邮箱已存在 |
| WEAK_PASSWORD | 400 | 密码强度不足 |
| INVALID_CREDENTIALS | 401 | 邮箱或密码错误 |
| TOKEN_EXPIRED | 401 | Token 已过期 |
| TOKEN_INVALID | 401 | Token 无效 |
| FORBIDDEN | 403 | 无权访问资源 |
| PLAN_NOT_FOUND | 404 | 计划不存在 |
| TREE_NOT_FOUND | 404 | 生命树不存在 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| SERVER_ERROR | 500 | 服务器内部错误 |
| AI_SERVICE_ERROR | 500 | AI 服务调用失败 |
| DATABASE_ERROR | 500 | 数据库操作失败 |

---

## 请求限流

为防止滥用，API 设置了请求频率限制：

- **普通接口**: 每分钟 60 次
- **AI 接口**: 每分钟 10 次
- **认证接口**: 每分钟 5 次

超过限制会返回 429 状态码：

```json
{
  "error": "请求过于频繁，请稍后再试",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60  // 秒
}
```

---

## 版本控制

API 版本通过 URL 路径指定（未来支持）：

```
/api/v1/plans
/api/v2/plans
```

当前版本：**v1** (默认)

---

## 测试环境

**测试账号**:
- 邮箱: `demo@lifetree.com`
- 密码: `Demo123!`

**Base URL**: `https://api-test.lifetree.com`

---

## 更新日志

### v1.0.0 (2024-10-07)
- 初始版本发布
- 完整的 CRUD 接口
- AI 分析接口
- 实时通知接口

---

**文档版本**: v1.0.0  
**最后更新**: 2024年10月7日  
**维护者**: LifeTree API Team

