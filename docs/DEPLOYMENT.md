# 🚀 LifeTree 部署文档

本文档介绍如何将 LifeTree 项目部署到各种环境。

---

## 📋 目录

- [部署前准备](#部署前准备)
- [Vercel 部署（推荐）](#vercel-部署推荐)
- [Docker 部署](#docker-部署)
- [传统服务器部署](#传统服务器部署)
- [数据库部署](#数据库部署)
- [环境变量配置](#环境变量配置)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [常见问题](#常见问题)

---

## 部署前准备

### 系统要求

- Node.js >= 20.0.0
- MySQL >= 8.0
- 内存 >= 1GB
- 磁盘空间 >= 5GB

### 必需服务

1. **MySQL 数据库**
   - 云服务推荐：PlanetScale, AWS RDS, 阿里云 RDS
   - 自建推荐：Docker 容器

2. **OpenAI API Key**（可选，用于 AI 功能）
   - 访问 [https://platform.openai.com](https://platform.openai.com)
   - 创建 API Key

### 构建检查

在部署前，确保本地构建成功：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 检查构建产物
ls -la .next/
```

---

## Vercel 部署（推荐）

Vercel 是 Next.js 的官方推荐部署平台，部署简单，性能优秀。

### 步骤 1: 准备数据库

#### 方案 A: 使用 PlanetScale（推荐）

PlanetScale 提供免费的 MySQL 数据库，非常适合 Next.js 项目。

1. 访问 [https://planetscale.com](https://planetscale.com)
2. 创建账号并新建数据库
3. 创建分支（默认为 `main`）
4. 获取连接字符串：

```bash
# 格式
mysql://username:password@host/database?sslaccept=strict
```

5. 推送数据库模式：

```bash
# 设置环境变量
export DATABASE_URL="mysql://..."

# 推送 schema
npx prisma db push
```

#### 方案 B: 使用其他云数据库

- **AWS RDS**: [https://aws.amazon.com/rds/](https://aws.amazon.com/rds/)
- **阿里云 RDS**: [https://www.aliyun.com/product/rds/mysql](https://www.aliyun.com/product/rds/mysql)
- **腾讯云 CDB**: [https://cloud.tencent.com/product/cdb](https://cloud.tencent.com/product/cdb)

### 步骤 2: 推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/lifetree.git

# 提交代码
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 步骤 3: 在 Vercel 上部署

1. **登录 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**

   在项目设置中添加以下环境变量：

   ```env
   # 数据库
   DATABASE_URL=mysql://username:password@host/database?sslaccept=strict
   
   # JWT 密钥（使用强随机字符串）
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   
   # OpenAI（可选）
   OPENAI_API_KEY=sk-your-openai-api-key
   
   # Node 环境
   NODE_ENV=production
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 2-5 分钟）
   - 访问分配的域名测试

5. **自定义域名（可选）**
   - 在 Project Settings → Domains 中添加自定义域名
   - 按提示配置 DNS 记录

### 步骤 4: 验证部署

```bash
# 测试 API
curl https://your-domain.vercel.app/api/hello

# 预期输出
{
  "message": "欢迎使用 LifeTree API",
  "status": "success"
}
```

### 自动部署

配置完成后，每次推送到 GitHub 都会自动触发部署：

```bash
git push origin main
# Vercel 会自动构建和部署
```

---

## Docker 部署

使用 Docker 可以实现环境一致性和便捷部署。

### 步骤 1: 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 多阶段构建，减小镜像体积

# Stage 1: 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production && \
    npm install -g prisma

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# Stage 2: 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 修改权限
RUN chown -R nextjs:nodejs /app

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

### 步骤 2: 创建 .dockerignore

```
node_modules
.next
.git
.env
.env.local
npm-debug.log
.DS_Store
coverage
.vscode
```

### 步骤 3: 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8
    container_name: lifetree-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: life_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - lifetree-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js 应用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lifetree-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:${MYSQL_ROOT_PASSWORD}@mysql:3306/life_db
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      NODE_ENV: production
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - lifetree-network

volumes:
  mysql_data:

networks:
  lifetree-network:
    driver: bridge
```

### 步骤 4: 创建 .env 文件

```env
MYSQL_ROOT_PASSWORD=your_strong_password
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key
```

### 步骤 5: 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 初始化数据库
docker-compose exec app npx prisma db push

# 添加数据库注释
docker-compose exec mysql mysql -u root -p life_db --default-character-set=utf8mb4 < prisma/add-comments.sql
```

### 步骤 6: 验证部署

```bash
# 测试应用
curl http://localhost:3000/api/hello

# 进入容器
docker-compose exec app sh

# 查看容器状态
docker-compose ps
```

### 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 更新镜像
docker-compose build --no-cache
docker-compose up -d
```

---

## 传统服务器部署

适用于阿里云 ECS、腾讯云 CVM 等传统云服务器。

### 步骤 1: 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

### 步骤 2: 部署应用

```bash
# 克隆项目
cd /var/www
sudo git clone https://github.com/your-username/lifetree.git
cd lifetree

# 安装依赖
npm install

# 配置环境变量
sudo nano .env
# 粘贴环境变量配置

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库
npx prisma db push

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start npm --name "lifetree" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 3: 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/lifetree
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 日志
    access_log /var/log/nginx/lifetree_access.log;
    error_log /var/log/nginx/lifetree_error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/lifetree /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 4: 配置 SSL（HTTPS）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置，添加 HTTPS 支持。

### PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs lifetree

# 重启应用
pm2 restart lifetree

# 停止应用
pm2 stop lifetree

# 删除应用
pm2 delete lifetree

# 监控
pm2 monit
```

---

## 数据库部署

### MySQL 优化配置

编辑 MySQL 配置文件：

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加优化配置：

```ini
[mysqld]
# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 性能优化
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 0
query_cache_type = 0

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

重启 MySQL：

```bash
sudo systemctl restart mysql
```

### 数据库备份

创建备份脚本 `/opt/scripts/backup-db.sh`：

```bash
#!/bin/bash

# 配置
DB_NAME="life_db"
DB_USER="root"
DB_PASS="your_password"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨3点备份
0 3 * * * /opt/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 环境变量配置

### 开发环境 (.env.local)

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/life_db"

# JWT（开发环境可以使用简单密钥）
JWT_SECRET="dev-secret-key"

# OpenAI
OPENAI_API_KEY="sk-your-dev-api-key"

# 日志级别
LOG_LEVEL="debug"
```

### 生产环境 (.env)

```env
# 数据库（使用连接池）
DATABASE_URL="mysql://user:password@host:3306/life_db?connection_limit=10"

# JWT（必须使用强密钥）
JWT_SECRET="production-super-secret-key-min-32-characters"

# OpenAI
OPENAI_API_KEY="sk-your-prod-api-key"

# Node 环境
NODE_ENV="production"

# 日志级别
LOG_LEVEL="error"

# CORS 允许的域名
ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"
```

### 安全建议

1. **不要提交 .env 文件到 Git**
   ```bash
   # 确保 .gitignore 包含
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **使用强随机密钥**
   ```bash
   # 生成 JWT 密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **定期轮换密钥**
   - JWT_SECRET 每3个月更换一次
   - 数据库密码每6个月更换一次

---

## 性能优化

### 1. Next.js 优化

```javascript
// next.config.js
module.exports = {
  // 启用 SWC 压缩
  swcMinify: true,
  
  // 图片优化
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 压缩
  compress: true,
  
  // 输出独立构建
  output: 'standalone',
}
```

### 2. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_plans_user_status ON plans(userId, status);
CREATE INDEX idx_plans_due_date ON plans(dueDate);
CREATE INDEX idx_leaves_tree ON leaves(treeId);

-- 分析表
ANALYZE TABLE plans, leaves, trees, users;
```

### 3. CDN 配置

使用 CDN 加速静态资源：

- **Vercel**: 自动配置 CDN
- **Cloudflare**: 免费 CDN + DDoS 防护
- **阿里云 CDN**: 国内访问加速

### 4. 缓存策略

```javascript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 缓存不存在，执行查询
  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  
  return data
}
```

---

## 监控和日志

### 1. 应用监控

推荐使用 Sentry 进行错误监控：

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### 2. 日志管理

```javascript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }))
}

export default logger
```

### 3. 性能监控

使用 Web Vitals 监控前端性能：

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 常见问题

### Q: 构建时出现内存不足错误？

**A:** 增加 Node.js 内存限制：

```bash
# package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### Q: 数据库连接池耗尽？

**A:** 调整 Prisma 连接池配置：

```env
DATABASE_URL="mysql://user:pass@host/db?connection_limit=5"
```

### Q: 静态资源加载慢？

**A:** 使用 CDN 或启用 Gzip 压缩：

```nginx
# Nginx 配置
gzip on;
gzip_vary on;
gzip_types text/plain application/javascript text/css application/json;
```

### Q: 如何实现零停机部署？

**A:** 使用 PM2 的 cluster 模式：

```bash
pm2 start npm --name "lifetree" -i max -- start
pm2 reload lifetree --update-env
```

---

## 检查清单

部署完成后，使用以下清单验证：

- [ ] 应用可以正常访问
- [ ] API 接口正常工作
- [ ] 数据库连接正常
- [ ] 用户注册/登录功能正常
- [ ] 计划 CRUD 功能正常
- [ ] 生命树动画正常显示
- [ ] AI 分析功能正常（如果配置了）
- [ ] 通知系统正常
- [ ] HTTPS 证书有效
- [ ] 日志正常记录
- [ ] 备份任务已配置
- [ ] 监控已启用

---

**文档版本**: v1.0.0  
**最后更新**: 2024年10月7日  
**维护者**: LifeTree DevOps Team

