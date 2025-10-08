# 📧 邮箱验证功能文档

## ✅ 功能概述

LifeTree 现已支持真实的邮箱收发验证功能：
- ✅ 用户注册时自动发送验证邮件
- ✅ 邮箱验证链接（24小时有效期）
- ✅ 重新发送验证邮件
- ✅ 验证状态追踪
- ✅ 美观的HTML邮件模板

---

## 🗄️ 数据库变更

### 新增字段

在 `users` 表中新增以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `emailVerified` | Boolean | 邮箱是否已验证（默认false） |
| `verificationToken` | String | 验证令牌（唯一） |
| `tokenExpiresAt` | DateTime | 令牌过期时间（24小时后） |

### 迁移命令

```bash
# 已自动执行
npx prisma db push
```

---

## 📡 API 接口

### 1. 注册用户（自动发送验证邮件）

**接口**: `POST /api/auth/register`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "张三"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "xxx",
      "email": "user@example.com",
      "name": "张三",
      "emailVerified": false,
      "createdAt": "2024-10-07T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "emailVerificationSent": true,
    "emailPreviewUrl": "https://ethereal.email/..." // 仅开发模式
  },
  "message": "注册成功，请查收验证邮件"
}
```

---

### 2. 验证邮箱

**接口**: `GET /api/auth/verify-email?token=xxx`

**说明**: 用户点击邮件中的验证链接后自动调用

**成功**: 重定向到 `/login?verified=success`  
**已验证**: 重定向到 `/login?verified=already`  
**失败**: 返回错误信息

---

### 3. 重新发送验证邮件

**接口**: `POST /api/auth/resend-verification`

**请求参数**:
```json
{
  "email": "user@example.com"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "message": "验证邮件已发送，请查收",
    "previewUrl": "https://ethereal.email/..." // 仅开发模式
  },
  "message": "验证邮件已发送"
}
```

---

## 📮 SMTP 配置

### 配置方法

在项目根目录的 `.env` 文件中添加以下配置：

```bash
# 应用基础URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# SMTP配置
SMTP_HOST="smtp.gmail.com"      # SMTP服务器地址
SMTP_PORT="587"                  # SMTP端口
SMTP_SECURE="false"              # 是否使用SSL
SMTP_USER="your-email@gmail.com" # 邮箱地址
SMTP_PASSWORD="your-app-password" # 应用专用密码
```

### 常见邮箱配置

#### 1. Gmail

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # 应用专用密码
```

**获取应用专用密码**:
1. 访问 https://myaccount.google.com/apppasswords
2. 启用两步验证
3. 生成应用专用密码
4. 使用生成的16位密码

#### 2. QQ邮箱

```bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-qq-number@qq.com"
SMTP_PASSWORD="xxxxxxxxxxx"  # 授权码（不是QQ密码）
```

**获取授权码**:
1. 登录 QQ 邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启 SMTP 服务
4. 生成授权码

#### 3. 163邮箱

```bash
SMTP_HOST="smtp.163.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-email@163.com"
SMTP_PASSWORD="xxxxxxxxxxx"  # 授权码
```

---

## 🧪 测试模式

### 开发环境（未配置SMTP）

如果未配置 SMTP 信息，系统会自动使用 **Ethereal Email** 测试模式：

- ✅ 不需要真实邮箱配置
- ✅ 邮件不会真实发送
- ✅ 返回预览链接（console和API响应中）
- ✅ 可以在浏览器中预览邮件

**示例输出**:
```bash
⚠️  未配置SMTP，使用Ethereal测试账号（邮件不会真实发送）
✅ 验证邮件已发送: <xxxxx@ethereal.email>
📧 邮件预览链接: https://ethereal.email/message/xxxxx
```

### 生产环境

建议配置真实SMTP服务器，确保邮件可靠送达。

---

## 📧 邮件模板

### 验证邮件内容

- **主题**: 验证您的 LifeTree 邮箱
- **发件人**: LifeTree <noreply@lifetree.com>
- **内容**: 
  - 欢迎消息
  - 验证按钮（紫色渐变）
  - 备用链接（复制粘贴）
  - 过期提示（24小时）
  - 品牌元素（🌳 logo）

### HTML模板特性

- ✅ 响应式设计（适配手机/电脑）
- ✅ 渐变紫色品牌色
- ✅ 清晰的CTA按钮
- ✅ 纯文本备用版本
- ✅ 专业的排版布局

---

## 🔄 用户流程

### 注册流程

```
1. 用户填写注册表单
   ↓
2. 提交到 POST /api/auth/register
   ↓
3. 后端处理：
   - 创建用户（emailVerified=false）
   - 生成验证令牌
   - 发送验证邮件
   - 返回 JWT Token
   ↓
4. 前端保存Token并跳转到仪表板
   ↓
5. 用户查收邮件
   ↓
6. 点击验证链接
   ↓
7. 自动调用 GET /api/auth/verify-email?token=xxx
   ↓
8. 验证成功，重定向到登录页
   ↓
9. 显示成功消息："邮箱验证成功！现在可以登录了"
```

### 重新发送流程

```
1. 用户点击"重新发送验证邮件"
   ↓
2. 调用 POST /api/auth/resend-verification
   ↓
3. 生成新令牌并发送邮件
   ↓
4. 显示成功提示
```

---

## 🎨 前端集成

### 注册页面

```typescript
// 注册成功后显示提示
if (response.data.success) {
  message.success('注册成功！请查收验证邮件')
  
  // 开发模式：显示邮件预览链接
  if (response.data.data.emailPreviewUrl) {
    console.log('📧 邮件预览:', response.data.data.emailPreviewUrl)
  }
  
  setTimeout(() => {
    router.push('/dashboard')
  }, 2000)
}
```

### 登录页面

```typescript
// 检查验证状态
useEffect(() => {
  const verified = searchParams.get('verified')
  if (verified === 'success') {
    message.success('邮箱验证成功！现在可以登录了')
  } else if (verified === 'already') {
    message.info('该邮箱已经验证过了')
  }
}, [searchParams])
```

---

## 🔒 安全性

### 令牌安全

- ✅ 使用 crypto.randomBytes(32) 生成64字符十六进制令牌
- ✅ 令牌在数据库中唯一索引
- ✅ 24小时自动过期
- ✅ 验证后立即清除令牌

### 防止滥用

- ✅ 重新发送邮件时不透露邮箱是否存在
- ✅ 验证失败不提供详细信息
- ✅ 过期令牌自动失效

---

## 🧪 测试指南

### 1. 测试注册并发送邮件

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "测试用户"
  }'
```

**预期响应**:
- `emailVerificationSent: true`
- 开发模式下有 `emailPreviewUrl`
- 控制台输出邮件预览链接

### 2. 测试邮件验证

在浏览器中访问：
```
http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN
```

**预期结果**:
- 重定向到 `/login?verified=success`
- 登录页显示成功消息

### 3. 测试重复验证

再次访问相同的验证链接：

**预期结果**:
- 重定向到 `/login?verified=already`
- 显示"该邮箱已经验证过了"

### 4. 测试重新发送

```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 📝 待办事项（可选增强）

- [ ] 在仪表板显示邮箱验证状态
- [ ] 未验证用户限制某些功能
- [ ] 定期清理过期令牌
- [ ] 邮件发送队列（高并发场景）
- [ ] 邮件发送失败重试机制
- [ ] 多语言邮件模板
- [ ] 邮件打开追踪

---

## 🎯 快速开始

### 最快测试方式（无需配置SMTP）

1. **注册新用户**
   ```
   访问: http://localhost:3000/register
   注册任意邮箱（不需要是真实邮箱）
   ```

2. **查看邮件预览**
   ```
   打开浏览器控制台
   找到 📧 邮件预览链接
   点击链接查看邮件
   ```

3. **复制验证链接**
   ```
   在邮件预览页面点击"验证邮箱"按钮
   或复制验证链接
   ```

4. **完成验证**
   ```
   在浏览器中打开验证链接
   自动跳转到登录页
   看到"邮箱验证成功！"提示
   ```

### 生产环境配置

1. 配置真实SMTP（参考上方SMTP配置章节）
2. 设置 `NEXT_PUBLIC_BASE_URL` 为生产域名
3. 重启应用
4. 用户将收到真实邮件

---

**创建时间**: 2024-10-07  
**最后更新**: 2024-10-07  
**维护者**: LifeTree 开发团队

