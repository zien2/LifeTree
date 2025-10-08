# 🚀 生产环境部署配置指南

## 📋 环境变量配置

### 必须修改的环境变量

在部署到生产环境时，**必须修改以下环境变量**：

```bash
# 应用域名（重要！）
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# 数据库连接
DATABASE_URL="mysql://user:password@host:3306/database"

# JWT密钥（生产环境请使用强随机字符串）
JWT_SECRET="your-production-jwt-secret-change-this"

# SMTP邮件配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="1561588898@qq.com"
SMTP_PASSWORD="qfwnqzlcztgvgeei"
```

---

## 🌐 不同部署平台配置

### 1️⃣ Vercel 部署（推荐）

#### 步骤1：推送代码到GitHub
```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 步骤2：导入到Vercel
1. 访问 https://vercel.com
2. 点击"Import Project"
3. 选择您的GitHub仓库

#### 步骤3：配置环境变量

在 Vercel 项目设置中添加：

```
Settings → Environment Variables

NEXT_PUBLIC_BASE_URL = https://your-project.vercel.app
DATABASE_URL = mysql://user:password@your-db-host:3306/database
JWT_SECRET = your-strong-random-secret
SMTP_HOST = smtp.qq.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = 1561588898@qq.com
SMTP_PASSWORD = qfwnqzlcztgvgeei
```

#### 步骤4：部署
点击"Deploy"，等待部署完成

✅ 完成！您的应用现在运行在：`https://your-project.vercel.app`

---

### 2️⃣ 自己的服务器部署

#### 环境准备
```bash
# 安装 Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2（进程管理器）
npm install -g pm2
```

#### 步骤1：克隆代码
```bash
cd /var/www
git clone https://github.com/your-username/lifetree.git
cd lifetree
```

#### 步骤2：安装依赖
```bash
npm install
```

#### 步骤3：配置环境变量
```bash
nano .env.local
```

填入：
```bash
NEXT_PUBLIC_BASE_URL="https://lifetree.yourdomain.com"
DATABASE_URL="mysql://root:password@localhost:3306/life-db"
JWT_SECRET="your-production-jwt-secret"
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="1561588898@qq.com"
SMTP_PASSWORD="qfwnqzlcztgvgeei"
```

#### 步骤4：构建项目
```bash
npm run build
```

#### 步骤5：使用PM2启动
```bash
pm2 start npm --name "lifetree" -- start
pm2 save
pm2 startup
```

#### 步骤6：配置Nginx反向代理
```nginx
server {
    listen 80;
    server_name lifetree.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 步骤7：配置SSL（Let's Encrypt）
```bash
sudo certbot --nginx -d lifetree.yourdomain.com
```

✅ 完成！访问：`https://lifetree.yourdomain.com`

---

### 3️⃣ Docker 部署

#### docker-compose.yml
```yaml
version: '3.8'

services:
  lifetree:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BASE_URL=https://your-domain.com
      - DATABASE_URL=mysql://root:password@mysql:3306/life-db
      - JWT_SECRET=your-production-jwt-secret
      - SMTP_HOST=smtp.qq.com
      - SMTP_PORT=587
      - SMTP_SECURE=false
      - SMTP_USER=1561588898@qq.com
      - SMTP_PASSWORD=qfwnqzlcztgvgeei
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=your-mysql-password
      - MYSQL_DATABASE=life-db
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql-data:
```

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci

# 复制所有文件
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 部署命令
```bash
docker-compose up -d
```

✅ 完成！

---

## 🔧 环境变量详解

### NEXT_PUBLIC_BASE_URL
- **作用**：生成邮件中的验证链接
- **开发环境**：`http://localhost:3000`
- **生产环境**：`https://your-domain.com`
- **重要性**：⭐⭐⭐⭐⭐

### DATABASE_URL
- **作用**：数据库连接字符串
- **格式**：`mysql://user:password@host:3306/database`
- **重要性**：⭐⭐⭐⭐⭐

### JWT_SECRET
- **作用**：JWT Token签名密钥
- **要求**：至少32位随机字符串
- **生成方法**：
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **重要性**：⭐⭐⭐⭐⭐

### SMTP配置
- **作用**：发送验证邮件
- **重要性**：⭐⭐⭐⭐

---

## ✅ 部署检查清单

部署前请确认：

- [ ] 修改 `NEXT_PUBLIC_BASE_URL` 为生产域名
- [ ] 配置生产数据库连接
- [ ] 生成强随机 JWT_SECRET
- [ ] 配置SMTP邮件服务
- [ ] 运行数据库迁移：`npx prisma db push`
- [ ] 构建项目：`npm run build`
- [ ] 测试邮件发送功能
- [ ] 配置SSL证书（HTTPS）
- [ ] 设置域名DNS解析

---

## 🧪 部署后测试

### 1. 测试注册功能
访问：`https://your-domain.com/register`

注册新账号，检查：
- ✅ 能否成功注册
- ✅ 收到验证邮件
- ✅ 邮件中的链接是生产域名（不是localhost）

### 2. 测试邮件验证
点击邮件中的验证链接，检查：
- ✅ 能否正确跳转
- ✅ 显示验证成功消息

### 3. 测试登录
使用验证后的账号登录，检查：
- ✅ 能否成功登录
- ✅ 正确跳转到dashboard

---

## 🔒 安全建议

### 生产环境安全配置

1. **使用强密码**
   - JWT_SECRET：至少32位随机字符串
   - 数据库密码：复杂强密码

2. **启用HTTPS**
   - 使用SSL证书（Let's Encrypt免费）
   - 强制HTTPS跳转

3. **数据库安全**
   - 不要暴露3306端口到公网
   - 使用防火墙限制访问
   - 定期备份数据库

4. **环境变量**
   - 不要将 `.env.local` 提交到Git
   - 使用平台的环境变量管理

5. **限流保护**
   - 配置Nginx限流
   - 防止暴力破解

---

## 📊 环境对比

| 配置项 | 开发环境 | 生产环境 |
|-------|---------|---------|
| NEXT_PUBLIC_BASE_URL | http://localhost:3000 | https://your-domain.com |
| DATABASE_URL | 本地MySQL | 生产MySQL/云数据库 |
| JWT_SECRET | 简单字符串 | 强随机字符串 |
| NODE_ENV | development | production |
| SSL | ❌ | ✅ 必须 |

---

## 💡 常见问题

### Q: 邮件链接还是localhost怎么办？

**A:** 检查以下几点：
1. 确认环境变量 `NEXT_PUBLIC_BASE_URL` 已设置
2. 重启应用（`pm2 restart lifetree` 或重新部署）
3. 清除浏览器缓存

### Q: 如何查看当前环境变量？

**A:** 
```bash
# Linux/Mac
printenv | grep NEXT_PUBLIC

# 或者在代码中输出
console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
```

### Q: 可以用不同域名吗？

**A:** 可以！只需修改 `NEXT_PUBLIC_BASE_URL` 为您的域名即可。

---

**最后更新**: 2024-10-07  
**文档版本**: v1.0

