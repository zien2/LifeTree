# 📧 邮箱验证快速配置指南

## 🚀 快速开始（测试模式）

### 无需配置，直接使用！

LifeTree 的邮箱验证功能**默认使用测试模式**，您无需配置任何SMTP服务器即可测试：

1. **注册新用户**
2. **查看控制台**（浏览器F12）
3. **找到邮件预览链接**
4. **点击链接查看邮件**

### 测试步骤

```bash
# 1. 确保开发服务器运行
npm run dev

# 2. 注册新用户
访问: http://localhost:3000/register
邮箱: test@example.com（任意邮箱）
密码: Test123456
```

**在控制台中查看**:
```
⚠️  未配置SMTP，使用Ethereal测试账号（邮件不会真实发送）
✅ 验证邮件已发送: <xxxxx@ethereal.email>
📧 邮件预览链接: https://ethereal.email/message/xxxxx
```

点击链接即可在浏览器中预览邮件！

---

## 📮 生产环境配置

### 方案一：Gmail（推荐）

#### 步骤1：启用两步验证
1. 访问 https://myaccount.google.com/security
2. 点击"两步验证"
3. 按提示完成设置

#### 步骤2：生成应用专用密码
1. 访问 https://myaccount.google.com/apppasswords
2. 选择"应用" → "邮件"
3. 选择"设备" → "其他（自定义名称）"
4. 输入名称：LifeTree
5. 点击"生成"
6. 复制16位密码（格式：xxxx xxxx xxxx xxxx）

#### 步骤3：配置 .env

在项目根目录创建 `.env` 文件（如果不存在），添加：

```bash
# 应用基础URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Gmail SMTP配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"          # 你的Gmail地址
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"       # 步骤2生成的密码
```

#### 步骤4：重启服务器

```bash
# 按 Ctrl+C 停止开发服务器
# 重新启动
npm run dev
```

---

### 方案二：QQ邮箱

#### 步骤1：开启SMTP服务
1. 登录 https://mail.qq.com
2. 点击"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"SMTP服务"
5. 发送短信验证
6. 获取**授权码**（16位，保存好）

#### 步骤2：配置 .env

```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# QQ邮箱SMTP配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="123456789@qq.com"              # 你的QQ邮箱
SMTP_PASSWORD="abcdefghijklmnop"          # 授权码（不是QQ密码）
```

---

### 方案三：163邮箱

#### 步骤1：开启SMTP服务
1. 登录 https://mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启"SMTP服务"
4. 设置客户端授权码

#### 步骤2：配置 .env

```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 163邮箱SMTP配置
SMTP_HOST="smtp.163.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="yourname@163.com"
SMTP_PASSWORD="your_auth_code"
```

---

## 🧪 测试验证

### 1. 通过界面测试

```bash
1. 访问 http://localhost:3000/register
2. 注册新账号
3. 查看控制台输出
4. 点击邮件预览链接
5. 在邮件中点击"验证邮箱"按钮
6. 应该跳转到登录页并显示成功消息
```

### 2. 通过API测试

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "测试用户"
  }'

# 查看响应中的 emailPreviewUrl
# 在浏览器中打开该URL
# 复制验证链接并访问
```

---

## ❓ 常见问题

### Q: 收不到邮件？

**A: 检查以下几点**
1. SMTP配置是否正确
2. 邮箱和密码/授权码是否正确
3. 邮件是否在垃圾箱
4. 防火墙是否阻止SMTP端口

### Q: Gmail 报错 "Invalid login"？

**A:** 
- 确认已启用两步验证
- 使用应用专用密码，不是Gmail密码
- 密码复制时不要包含空格

### Q: QQ邮箱报错 "530 Error"？

**A:**
- 使用授权码，不是QQ密码
- 确认SMTP服务已开启
- 授权码格式是16位字母

### Q: 测试模式下邮件链接打不开？

**A:**
- Ethereal邮件有效期有限
- 刷新注册流程获取新链接
- 或配置真实SMTP

### Q: 如何在生产环境部署？

**A:**
```bash
# 设置环境变量
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@your-domain.com"
SMTP_PASSWORD="your-app-password"
```

---

## 📊 配置对比

| 邮箱服务 | 难度 | 费用 | 推荐度 | 备注 |
|---------|-----|------|--------|-----|
| **测试模式** | ⭐ | 免费 | ⭐⭐⭐⭐⭐ | 开发测试首选 |
| **Gmail** | ⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ | 稳定可靠 |
| **QQ邮箱** | ⭐⭐ | 免费 | ⭐⭐⭐⭐ | 国内用户友好 |
| **163邮箱** | ⭐⭐ | 免费 | ⭐⭐⭐ | 配置稍复杂 |
| **SendGrid** | ⭐⭐⭐ | 部分免费 | ⭐⭐⭐⭐⭐ | 企业级方案 |
| **AWS SES** | ⭐⭐⭐⭐ | 按量付费 | ⭐⭐⭐⭐ | 大规模发送 |

---

## 🎯 推荐方案

### 开发/测试环境
```bash
# 不需要任何配置！
# 直接使用测试模式
# 在控制台查看邮件预览链接
```

### 个人项目/小型应用
```bash
# Gmail 应用专用密码
# 免费、稳定、易配置
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-specific-password"
```

### 生产环境/企业应用
```bash
# SendGrid（每月100封免费）
# AWS SES（每月62,000封免费）
# 或自建邮件服务器
```

---

## 🔧 故障排查

### 检查配置

```bash
# 查看环境变量是否加载
node -e "console.log(process.env.SMTP_HOST)"

# 如果输出 undefined，说明 .env 未加载
# 确保 .env 文件在项目根目录
# 重启开发服务器
```

### 测试SMTP连接

```bash
# 创建测试脚本 test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP连接失败:', error);
  } else {
    console.log('✅ SMTP连接成功！');
  }
});

# 运行测试
node test-smtp.js
```

---

**更新时间**: 2024-10-07  
**需要帮助?** 查看 `docs/EMAIL_VERIFICATION.md` 了解更多详情

