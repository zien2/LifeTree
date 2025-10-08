# 🌳 LifeTree - 生命树计划管理系统

<div align="center">

![LifeTree Logo](https://img.shields.io/badge/LifeTree-生命树-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**让成长看得见 · Make Growth Visible**

一款聚焦"计划管理+成长可视化"的工具型应用，通过生命树的形式将抽象的自我提升过程变得直观可感知。

[功能特性](#功能特性) • [技术架构](#技术架构) • [快速开始](#快速开始) • [开发文档](#开发文档) • [演示](#演示)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [系统架构](#系统架构)
- [数据库设计](#数据库设计)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [部署说明](#部署说明)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 📝 项目简介

### 背景与目标

LifeTree（生命树）是一款创新的计划管理工具，旨在通过视觉化的方式帮助用户：
- 📋 **高效管理**每日计划，支持三级优先级
- 🌲 **直观呈现**执行状态，通过生命树动画反馈
- 🤖 **AI智能分析**计划的成长性，提供优化建议
- 📊 **周期报告**生成完成率与趋势分析
- 🎯 **增强动机**通过视觉反馈提升执行力

### 核心理念

> "每一个完成的计划，都是生命树上一片翠绿的叶子"

我们相信，当抽象的目标通过可视化变得具体时，人们会更有动力去完成它们。LifeTree 将计划执行情况转化为生命树的生长状态：
- ✅ **完成计划** → 叶子变绿，树木茁壮成长
- ⏳ **未完成计划** → 叶子轻轻飘动，提醒你关注
- ⚠️ **逾期计划** → 叶子枯萎飘落，警示你改进

### 适用人群

- 📚 **学生党** - 管理学习计划，跟踪复习进度
- 💼 **职场人** - 管理工作任务，提升执行效率
- 🏃 **健身爱好者** - 记录运动计划，坚持健康生活
- 🎯 **自我提升者** - 追踪成长目标，可视化个人进步

---

## ✨ 功能特性

### 🔐 1. 用户认证系统
- 邮箱注册/登录
- JWT Token 身份验证
- 密码加密存储（bcrypt）
- 用户信息管理

### 📋 2. 计划管理模块
- **创建计划**：标题、描述、优先级、截止日期
- **三级优先级**：
  - 🔴 HIGH（高）- 紧急重要任务
  - 🟡 MEDIUM（中）- 常规任务
  - 🔵 LOW（低）- 灵活调整任务
- **状态管理**：
  - ⏳ PENDING（未完成）
  - ✅ COMPLETED（已完成）
  - ⚠️ OVERDUE（逾期）
- **智能排序**：按优先级 → 截止时间自动排序
- **批量操作**：批量完成、删除、修改优先级

### 🌲 3. 生命树可视化
- **实时动画效果**：
  - 🌱 GROWING - 计划创建时，叶子从无到有生长
  - 🍃 FLOATING - 未完成计划，叶子轻微飘动
  - 🍂 FALLING - 逾期计划，叶子飘落枯萎
  - 💚 COMPLETED - 完成计划，叶子变绿静止
- **树的属性**：
  - 健康度（0-100）：根据完成/逾期情况动态计算
  - 等级系统：每完成10个计划升1级
  - 多树支持：默认树、年度树、自定义主题树
- **动画技术**：使用 Framer Motion 实现流畅动画

### 🤖 4. AI 成长分析
- **每日成长性分析**：
  - 创建计划时自动触发
  - 1-5星成长性评分
  - 具体理由和改进建议
- **周期分析报告**：
  - 每周一凌晨自动生成周报
  - 每月1日凌晨自动生成月报
  - 统计完成率、优先级分布、趋势变化
- **主动问答**：
  - 用户可主动提问（如"如何优化健身计划持续性"）
  - AI 结合历史数据给出个性化建议
- **数据可视化**：图表展示趋势和对比

### 🔔 5. 系统通知
- **通知类型**：
  - 📊 ANALYSIS - 周期分析报告生成
  - ⏰ REMINDER - 重要计划逾期提醒
  - 📢 SYSTEM - 系统公告和功能更新
- **状态管理**：已读/未读标记
- **实时推送**：重要事件即时通知

### 📊 6. 数据统计
- 今日/本周/本月完成率
- 优先级分布饼图
- 完成趋势折线图
- 逾期率分析
- 成长性评分变化曲线

---

## 🛠 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.2.x | React 全栈框架，支持 SSR/SSG |
| **React** | 18.3.x | 用户界面构建 |
| **TypeScript** | 5.4.x | 类型安全的 JavaScript |
| **Ant Design** | 5.17.x | UI 组件库，提供表单、布局等 |
| **Framer Motion** | 11.2.x | 动画库，实现生命树动画效果 |
| **Axios** | 1.7.x | HTTP 请求库 |
| **Day.js** | 1.11.x | 日期处理库 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js API Routes** | 14.2.x | 后端 API 接口 |
| **Prisma** | 5.14.x | 数据库 ORM，类型安全的数据库操作 |
| **MySQL** | 8.x | 关系型数据库 |
| **JWT** | 9.0.x | 用户身份认证 |
| **bcryptjs** | 2.4.x | 密码加密 |
| **OpenAI API** | 4.47.x | AI 分析功能 |

### 开发工具

- **Node.js**: 20.x
- **npm**: 包管理器
- **Docker**: MySQL 数据库容器化
- **Git**: 版本控制
- **ESLint**: 代码规范检查

---

## 🏗 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      前端层 (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  页面组件 │  │ UI组件库 │  │ 状态管理 │  │ 动画引擎 ││
│  │  (Pages) │  │(AntD UI) │  │(Context) │  │(Framer) ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼───────────────────────────────────┐
│                  API 路由层 (Next.js API)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ 用户认证 │  │ 计划管理 │  │ AI分析   │  │ 通知系统 ││
│  │   API    │  │   API    │  │   API    │  │   API   ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────┬───────────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────────────┐
│                    数据持久层 (MySQL)                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │users │ │plans │ │trees │ │leaves│ │ai_   │ │noti- ││
│  │      │ │      │ │      │ │      │ │analy │ │fica- ││
│  │      │ │      │ │      │ │      │ │ses   │ │tions ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   外部服务层                             │
│           ┌──────────────────────────┐                  │
│           │   OpenAI API (GPT-3.5)   │                  │
│           │   AI 分析与建议生成       │                  │
│           └──────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### 数据流转

#### 1. 用户创建计划
```
用户输入 → 前端验证 → API /plans (POST) → 
→ 创建 Plan 记录 → 触发 AI 分析 → 创建 Leaf 记录 → 
→ 更新 Tree 健康度 → 返回结果 → 前端刷新显示
```

#### 2. 用户完成计划
```
用户点击完成 → API /plans/:id (PATCH) → 
→ 更新 Plan.status = COMPLETED → 更新 Leaf.color = green → 
→ Tree.health += 2 → 检查是否升级 → 返回结果 → 
→ 前端播放完成动画
```

#### 3. 系统逾期检查（定时任务）
```
每日凌晨 → 查询逾期计划 → 批量更新 Plan.status = OVERDUE → 
→ 批量更新 Leaf (color=brown, status=FALLING) → 
→ 批量更新 Tree.health -= 5 → 创建 Notification → 
→ 用户登录时看到通知
```

---

## 🗄 数据库设计

### ER 关系图

```
┌─────────┐
│  User   │───────┐
│  用户   │       │
└─────────┘       │
     │            │
     │ 1:N        │ 1:N
     │            │
┌────▼─────┐  ┌──▼──────┐
│  Plan    │  │  Tree   │
│  计划    │  │  树     │
└──────────┘  └─────────┘
     │             │
     │ 1:N         │ 1:N
     │             │
     └──────┬──────┘
            │
       ┌────▼─────┐
       │  Leaf    │
       │  叶子    │
       └──────────┘

┌─────────┐        ┌─────────────┐        ┌──────────────┐
│  User   │────────│ AIAnalysis  │        │ Notification │
│  用户   │  1:N   │ AI分析      │        │   通知       │
└─────────┘        └─────────────┘        └──────────────┘
```

### 数据表概览

| 表名 | 中文名 | 字段数 | 主要功能 |
|------|--------|--------|----------|
| `users` | 用户表 | 6 | 存储用户信息和认证凭据 |
| `plans` | 计划表 | 10 | 存储用户的每日计划 |
| `trees` | 生命树表 | 8 | 存储生命树状态（健康度、等级） |
| `leaves` | 叶子表 | 11 | 存储叶子的位置、颜色、动画状态 |
| `ai_analyses` | AI分析表 | 7 | 存储AI生成的分析报告 |
| `notifications` | 通知表 | 7 | 存储系统通知消息 |

> 详细的数据库设计文档请查看：[docs/DATABASE.md](./docs/DATABASE.md)

---

## ✨ 最新更新

### 邮箱验证功能（2024-10-07）

- ✅ 用户注册时自动发送验证邮件
- ✅ 精美的HTML邮件模板
- ✅ 24小时有效期验证链接
- ✅ 支持重新发送验证邮件
- ✅ 开发模式下邮件预览（无需配置SMTP）
- ✅ 生产环境支持Gmail/QQ/163等邮箱

**查看详细文档**：
- 📧 [邮箱验证功能说明](./docs/EMAIL_VERIFICATION.md)
- ⚙️ [邮箱配置指南](./docs/EMAIL_SETUP_GUIDE.md)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker Desktop（用于运行 MySQL）
- Git

### 1. 克隆项目

```bash
git clone https://github.com/your-username/lifetree.git
cd lifetree
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="mysql://root:your_password@localhost:3306/life-db"

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET="your-super-secret-jwt-key"

# OpenAI API Key（可选，用于AI分析功能）
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 4. 启动 MySQL 数据库

使用 Docker 启动 MySQL：

```bash
docker run -d \
  --name mysql-lifetree \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=life-db \
  -p 3306:3306 \
  mysql:8
```

### 5. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 推送数据库模式
npm run prisma:push

# （可选）添加表和字段注释
docker exec -i mysql-lifetree mysql -u root -pyour_password life-db --default-character-set=utf8mb4 < prisma/add-comments.sql
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 7. 其他有用的命令

```bash
# 打开 Prisma Studio（可视化数据库管理）
npm run prisma:studio

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

---

## 📁 项目结构

```
lifetree/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证相关 API
│   │   │   ├── register/         # 用户注册
│   │   │   ├── login/            # 用户登录
│   │   │   └── logout/           # 用户登出
│   │   ├── plans/                # 计划管理 API
│   │   │   ├── route.ts          # 获取计划列表、创建计划
│   │   │   └── [id]/             # 计划详情、更新、删除
│   │   ├── trees/                # 生命树 API
│   │   ├── leaves/               # 叶子 API
│   │   ├── ai/                   # AI 分析 API
│   │   └── notifications/        # 通知 API
│   ├── (auth)/                   # 认证相关页面
│   │   ├── login/                # 登录页
│   │   └── register/             # 注册页
│   ├── dashboard/                # 仪表板（需登录）
│   │   ├── page.tsx              # 仪表板首页
│   │   ├── plans/                # 计划管理页面
│   │   ├── tree/                 # 生命树可视化页面
│   │   ├── analytics/            # 数据分析页面
│   │   └── settings/             # 设置页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式
│
├── components/                   # React 组件
│   ├── common/                   # 通用组件
│   │   ├── Header.tsx            # 头部导航
│   │   ├── Footer.tsx            # 页脚
│   │   ├── Loading.tsx           # 加载指示器
│   │   └── ErrorBoundary.tsx    # 错误边界
│   ├── auth/                     # 认证组件
│   │   ├── LoginForm.tsx         # 登录表单
│   │   └── RegisterForm.tsx      # 注册表单
│   ├── plan/                     # 计划相关组件
│   │   ├── PlanList.tsx          # 计划列表
│   │   ├── PlanCard.tsx          # 计划卡片
│   │   ├── CreatePlanModal.tsx   # 创建计划弹窗
│   │   └── PlanFilter.tsx        # 计划筛选器
│   ├── tree/                     # 生命树组件
│   │   ├── TreeCanvas.tsx        # 树画布（主要动画组件）
│   │   ├── Leaf.tsx              # 单个叶子组件
│   │   ├── TreeStats.tsx         # 树统计信息
│   │   └── animations/           # 动画配置
│   ├── analytics/                # 分析组件
│   │   ├── CompletionChart.tsx   # 完成率图表
│   │   ├── TrendChart.tsx        # 趋势图表
│   │   └── AIInsights.tsx        # AI洞察卡片
│   └── notification/             # 通知组件
│       ├── NotificationList.tsx  # 通知列表
│       └── NotificationBadge.tsx # 通知角标
│
├── lib/                          # 工具库和配置
│   ├── prisma.ts                 # Prisma 客户端
│   ├── auth.ts                   # 认证工具函数
│   ├── jwt.ts                    # JWT 工具
│   ├── openai.ts                 # OpenAI 客户端
│   ├── constants.ts              # 常量定义
│   └── utils.ts                  # 通用工具函数
│
├── prisma/                       # Prisma 配置
│   ├── schema.prisma             # 数据库模式定义
│   └── add-comments.sql          # 数据库注释脚本
│
├── docs/                         # 项目文档
│   ├── DATABASE.md               # 数据库设计文档
│   ├── DATABASE_COMMENTS.md      # 数据库注释说明
│   ├── API.md                    # API 接口文档
│   └── DEPLOYMENT.md             # 部署文档
│
├── public/                       # 静态资源
│   ├── images/                   # 图片资源
│   └── icons/                    # 图标资源
│
├── .env                          # 环境变量（不提交到 Git）
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略配置
├── next.config.js                # Next.js 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖
└── README.md                     # 项目文档（本文件）
```

---

## 👨‍💻 开发指南

### 开发规范

#### 1. 代码风格

- 使用 TypeScript 编写所有代码
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks

#### 2. 命名规范

```typescript
// 组件：PascalCase
const PlanCard: React.FC = () => {}

// 函数：camelCase
const fetchUserPlans = async () => {}

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = '/api'

// 接口/类型：PascalCase
interface UserProfile {}
type PlanStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE'
```

#### 3. 文件组织

- 一个文件一个组件
- 相关组件放在同一目录下
- 使用 `index.ts` 统一导出

#### 4. Git 提交规范

```bash
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具配置

# 示例
git commit -m "feat: 添加计划优先级排序功能"
git commit -m "fix: 修复生命树动画卡顿问题"
```

### 本地开发流程

#### 1. 创建新功能分支

```bash
git checkout -b feature/your-feature-name
```

#### 2. 开发功能

```bash
# 启动开发服务器
npm run dev

# 监听数据库变化
npm run prisma:studio
```

#### 3. 测试

```bash
# 运行 ESLint 检查
npm run lint

# 类型检查
npx tsc --noEmit
```

#### 4. 提交代码

```bash
git add .
git commit -m "feat: 你的功能描述"
git push origin feature/your-feature-name
```

### 常见开发任务

#### 添加新的 API 接口

1. 在 `app/api/` 下创建新的路由文件
2. 实现 GET/POST/PATCH/DELETE 方法
3. 使用 Prisma 进行数据库操作
4. 添加错误处理和验证

```typescript
// app/api/plans/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const plans = await prisma.plan.findMany()
    return NextResponse.json({ plans })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
```

#### 修改数据库模式

1. 编辑 `prisma/schema.prisma`
2. 生成 Prisma 客户端
3. 推送到数据库

```bash
# 修改 schema.prisma 后
npm run prisma:generate
npm run prisma:push
```

#### 添加新的 React 组件

```typescript
// components/plan/PlanCard.tsx
'use client'

import { Card } from 'antd'
import { motion } from 'framer-motion'

interface PlanCardProps {
  plan: Plan
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card title={plan.title}>
        {plan.description}
      </Card>
    </motion.div>
  )
}
```

---

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

### 认证 API

#### 注册用户

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}

Response 200:
{
  "user": {
    "id": "user_xxx",
    "email": "user@example.com",
    "name": "张三"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 计划 API

#### 获取计划列表

```http
GET /api/plans?status=PENDING&priority=HIGH
Authorization: Bearer {token}

Response 200:
{
  "plans": [
    {
      "id": "plan_xxx",
      "title": "完成项目报告",
      "priority": "HIGH",
      "status": "PENDING",
      "dueDate": "2024-10-08T00:00:00.000Z",
      "createdAt": "2024-10-07T10:00:00.000Z"
    }
  ],
  "total": 10
}
```

#### 创建计划

```http
POST /api/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "学习 React Hooks",
  "description": "深入学习 useState 和 useEffect",
  "priority": "MEDIUM",
  "dueDate": "2024-10-10T00:00:00.000Z"
}

Response 201:
{
  "plan": { ... },
  "leaf": { ... },
  "aiAnalysis": {
    "score": 4,
    "content": "这是一个很好的学习计划..."
  }
}
```

#### 更新计划状态

```http
PATCH /api/plans/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED"
}

Response 200:
{
  "plan": { ... },
  "tree": {
    "health": 102,
    "level": 1
  }
}
```

#### 删除计划

```http
DELETE /api/plans/{id}
Authorization: Bearer {token}

Response 204: No Content
```

### 生命树 API

#### 获取用户的生命树

```http
GET /api/trees
Authorization: Bearer {token}

Response 200:
{
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
          "positionX": 100,
          "positionY": 200,
          "plan": { ... }
        }
      ]
    }
  ]
}
```

### AI 分析 API

#### 获取周期报告

```http
GET /api/ai/reports?type=WEEKLY&period=2024-W42
Authorization: Bearer {token}

Response 200:
{
  "analysis": {
    "type": "WEEKLY",
    "period": "2024-W42",
    "content": "本周完成率85%，较上周提升10%...",
    "createdAt": "2024-10-07T00:00:00.000Z"
  }
}
```

#### 主动提问

```http
POST /api/ai/ask
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "如何提高我的计划完成率？"
}

Response 200:
{
  "answer": "根据你的历史数据分析...",
  "suggestions": [
    "建议减少高优先级任务数量",
    "合理设置截止时间"
  ]
}
```

### 通知 API

#### 获取通知列表

```http
GET /api/notifications?isRead=false
Authorization: Bearer {token}

Response 200:
{
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
  "unreadCount": 3
}
```

#### 标记通知已读

```http
PATCH /api/notifications/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "isRead": true
}

Response 200:
{
  "notification": { ... }
}
```

> 完整的 API 文档请查看：[docs/API.md](./docs/API.md)

---

## 🚢 部署说明

### 部署到 Vercel（推荐）

1. **准备数据库**

   使用 PlanetScale 或其他 MySQL 云服务：
   ```bash
   # 创建数据库
   # 获取连接字符串
   ```

2. **推送代码到 GitHub**

   ```bash
   git push origin main
   ```

3. **在 Vercel 上部署**

   - 访问 [vercel.com](https://vercel.com)
   - 导入 GitHub 仓库
   - 配置环境变量：
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `OPENAI_API_KEY`
   - 点击 Deploy

4. **初始化数据库**

   ```bash
   npx prisma db push
   ```

### 部署到 Docker

```bash
# 构建镜像
docker build -t lifetree:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  --name lifetree \
  lifetree:latest
```

### 环境变量清单

```env
# 必需
DATABASE_URL=          # 数据库连接字符串
JWT_SECRET=            # JWT 密钥

# 可选
OPENAI_API_KEY=        # OpenAI API Key（AI功能需要）
NODE_ENV=production    # 生产环境
PORT=3000              # 端口号
```

> 详细的部署文档请查看：[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## ❓ 常见问题

### Q: 数据库连接失败怎么办？

**A:** 检查以下几点：
1. MySQL 是否正常运行：`docker ps | grep mysql`
2. `.env` 文件中的数据库连接字符串是否正确
3. 数据库名是否存在：`SHOW DATABASES;`
4. 密码是否正确

### Q: AI 分析功能不工作？

**A:** 
1. 检查 `OPENAI_API_KEY` 是否配置
2. 确认 OpenAI API 账户有额度
3. 查看 API 日志了解具体错误

### Q: 生命树动画卡顿？

**A:**
1. 减少同时显示的叶子数量（分页加载）
2. 使用 Canvas 替代 SVG（大量叶子时性能更好）
3. 检查是否开启了硬件加速

### Q: 如何备份数据？

**A:**
```bash
# 导出数据库
docker exec mysql-lifetree mysqldump -u root -p life-db > backup.sql

# 恢复数据库
docker exec -i mysql-lifetree mysql -u root -p life-db < backup.sql
```

### Q: 如何重置密码？

**A:** 目前需要通过数据库直接操作：
```sql
-- 更新用户密码（需要先用 bcrypt 加密）
UPDATE users SET password = '$2a$10$...' WHERE email = 'user@example.com';
```

---

## 📝 更新日志

### v1.0.0 (2024-10-07)

#### ✨ 新功能
- 🎉 初始版本发布
- 🔐 用户注册/登录系统
- 📋 计划 CRUD 功能
- 🌲 生命树可视化动画
- 🤖 AI 成长分析（集成 GPT-3.5）
- 🔔 系统通知功能
- 📊 数据统计和趋势分析

#### 📚 文档
- 完整的项目文档
- 数据库设计文档
- API 接口文档
- 部署指南

#### 🛠 技术栈
- Next.js 14 + React 18
- Ant Design 5
- Framer Motion 11
- Prisma + MySQL
- TypeScript

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'feat: Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **提交 Pull Request**

### 贡献类型

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🎨 优化 UI/UX
- ⚡ 性能优化
- ✅ 添加测试

### 代码审查标准

- 代码风格符合 ESLint 规则
- 所有测试通过
- 添加必要的文档和注释
- 提交信息清晰明确

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

```
MIT License

Copyright (c) 2024 LifeTree Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 团队

- **项目负责人**: [@hanzhiyin](https://github.com/hanzhiyin)
- **技术顾问**: AI Assistant

---

## 🌟 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [OpenAI](https://openai.com/) - AI 能力支持

---

## 📞 联系我们

- **项目主页**: [https://github.com/hanzhiyin/lifetree](https://github.com/hanzhiyin/lifetree)
- **问题反馈**: [GitHub Issues](https://github.com/hanzhiyin/lifetree/issues)
- **邮箱**: support@lifetree.com

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by LifeTree Team

[⬆ 回到顶部](#-lifetree---生命树计划管理系统)

</div>
