# 📧 5分钟快速配置邮箱验证

## 🎯 您需要什么邮箱？

请选择您要使用的邮箱类型：

---

## 方案1️⃣：Gmail（最推荐）

### 步骤1：生成应用专用密码

1. 访问：https://myaccount.google.com/apppasswords
2. 如果没有启用两步验证，先启用：https://myaccount.google.com/security
3. 生成应用密码：
   - 选择应用：邮件
   - 选择设备：其他（输入：LifeTree）
   - 点击"生成"
4. 复制生成的16位密码（格式：xxxx xxxx xxxx xxxx）

### 步骤2：配置项目

打开 `.env.local` 文件，修改以下内容：

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="你的邮箱@gmail.com"        # 改成你的Gmail地址
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"   # 改成步骤1生成的密码
```

### 步骤3：重启服务器

```bash
# 按 Ctrl+C 停止开发服务器
# 重新启动
npm run dev
```

### 步骤4：测试

访问：http://localhost:3000/register
注册一个新账号（使用任意邮箱地址）
几秒后检查您的邮箱！

---

## 方案2️⃣：QQ邮箱

### 步骤1：开启SMTP服务

1. 登录 QQ 邮箱：https://mail.qq.com
2. 点击右上角"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"SMTP服务"
5. 根据提示发送短信验证
6. **保存显示的授权码**（16位字母，这不是你的QQ密码！）

### 步骤2：配置项目

打开 `.env.local`，修改：

```bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="你的QQ号@qq.com"          # 改成你的QQ邮箱
SMTP_PASSWORD="abcdefghijklmnop"    # 改成步骤1的授权码
```

### 步骤3：重启并测试

```bash
npm run dev
```

---

## 方案3️⃣：163邮箱

### 步骤1：获取授权码

1. 登录 163 邮箱：https://mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启"SMTP服务"
4. 设置客户端授权码
5. **保存授权码**

### 步骤2：配置

```bash
SMTP_HOST="smtp.163.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="你的邮箱@163.com"
SMTP_PASSWORD="你的授权码"
```

---

## ⚡ 快速测试（不配置SMTP）

如果暂时不想配置，可以使用测试模式：

1. **不修改 `.env.local` 中的SMTP配置**（或注释掉）
2. 注册新用户
3. 打开浏览器控制台（F12）
4. 找到输出：`📧 邮件预览: https://ethereal.email/message/xxxxx`
5. 点击链接查看邮件（不会真实发送）
6. 在预览页面点击"验证邮箱"按钮

---

## 🐛 常见问题

### Q: Gmail报错 "Invalid login"？

**原因**：密码不对或未开启两步验证

**解决**：
1. 确认已启用两步验证
2. 使用应用专用密码，不是Gmail密码
3. 密码复制时不要包含空格
4. 重新生成一个新的应用专用密码

### Q: QQ邮箱报错 "530 Error"？

**原因**：未使用授权码

**解决**：
1. 使用授权码，不是QQ密码
2. 确认已开启SMTP服务
3. 授权码是16位字母

### Q: 看不到邮件？

**解决**：
1. 检查垃圾邮件箱
2. 等待1-2分钟（可能有延迟）
3. 查看服务器控制台是否有错误
4. 尝试重新发送验证邮件

### Q: 修改配置后不生效？

**解决**：
1. 确保修改的是 `.env.local` 文件
2. 保存文件后重启开发服务器（Ctrl+C，然后 npm run dev）
3. 清除浏览器缓存

---

## 📝 配置模板

根据您的邮箱，复制对应配置到 `.env.local`：

### Gmail
```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="你的邮箱@gmail.com"
SMTP_PASSWORD="应用专用密码16位"
```

### QQ邮箱
```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="你的QQ号@qq.com"
SMTP_PASSWORD="授权码16位"
```

### 163邮箱
```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
SMTP_HOST="smtp.163.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="你的邮箱@163.com"
SMTP_PASSWORD="授权码"
```

---

## ✅ 验证配置是否成功

运行测试注册：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "测试用户"
  }'
```

成功的话会看到：
```json
{
  "success": true,
  "data": {
    "emailVerificationSent": true,
    ...
  }
}
```

然后检查您的邮箱！

---

**需要帮助？** 告诉我您使用的是哪个邮箱，我可以提供更详细的指导！

