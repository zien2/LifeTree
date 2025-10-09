# 🐳 LifeTree Docker 部署指南

## 📋 概述

本指南将帮助您使用 Docker 和 Docker Compose 快速部署 LifeTree 项目，包括：
- Next.js 应用容器化
- MySQL 数据库容器化
- 一键启动完整环境

## 🛠 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zien2/LifeTree.git
cd LifeTree
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp env.sample .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库连接（Docker Compose 会自动配置）
DATABASE_URL=mysql://lifetree_user:lifetree_password@mysql:3306/life_db

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# 应用基础 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI API 配置（可选）
AI_API_KEY=your_bailian_api_key

# 邮件配置（可选）
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@qq.com
SMTP_PASS=your_smtp_password
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

```bash
# 等待 MySQL 启动完成（约 30 秒）
sleep 30

# 推送数据库模式
docker-compose exec app npx prisma db push

# 添加数据库注释（可选）
docker-compose exec mysql mysql -u lifetree_user -plifetree_password life_db < /docker-entrypoint-initdb.d/add-comments.sql
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
docker-compose logs -f mysql
```

### 数据库操作

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec mysql mysql -u lifetree_user -plifetree_password life_db

# 备份数据库
docker-compose exec mysql mysqldump -u lifetree_user -plifetree_password life_db > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u lifetree_user -plifetree_password life_db < backup.sql
```

### 应用管理

```bash
# 重新构建应用
docker-compose build app

# 查看应用日志
docker-compose logs -f app

# 进入应用容器
docker-compose exec app sh

# 运行 Prisma 命令
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma generate
```

## 📊 服务配置

### MySQL 配置

- **端口**: 3306
- **数据库名**: life_db
- **用户名**: lifetree_user
- **密码**: lifetree_password
- **数据持久化**: mysql_data 卷

### 应用配置

- **端口**: 3000
- **环境**: production
- **日志目录**: ./logs

## 🔒 安全配置

### 生产环境部署

1. **修改默认密码**：

```yaml
# docker-compose.yml
environment:
  MYSQL_ROOT_PASSWORD: your_strong_root_password
  MYSQL_PASSWORD: your_strong_user_password
  JWT_SECRET: your_very_strong_jwt_secret
```

2. **使用环境变量文件**：

```bash
# 创建 .env.production
cp .env .env.production

# 修改 docker-compose.yml 使用生产环境变量
environment:
  - NODE_ENV=production
env_file:
  - .env.production
```

3. **配置反向代理**：

使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 故障排除

### 常见问题

1. **端口冲突**：
   ```bash
   # 检查端口占用
   netstat -tlnp | grep :3000
   netstat -tlnp | grep :3306
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3001:3000"  # 改为其他端口
   ```

2. **数据库连接失败**：
   ```bash
   # 检查 MySQL 容器状态
   docker-compose ps mysql
   
   # 查看 MySQL 日志
   docker-compose logs mysql
   
   # 等待 MySQL 完全启动
   docker-compose exec mysql mysqladmin ping -h localhost
   ```

3. **应用构建失败**：
   ```bash
   # 清理构建缓存
   docker-compose build --no-cache app
   
   # 查看构建日志
   docker-compose build app
   ```

4. **权限问题**：
   ```bash
   # 修复日志目录权限
   sudo chown -R $USER:$USER logs/
   chmod -R 755 logs/
   ```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app
docker-compose logs mysql

# 实时查看日志
docker-compose logs -f

# 查看最近的日志
docker-compose logs --tail=100 app
```

## 📈 性能优化

### 1. 资源限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
  
  mysql:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### 2. 数据库优化

```yaml
# docker-compose.yml
mysql:
  command: --innodb-buffer-pool-size=256M --max-connections=100
```

### 3. 应用优化

```yaml
# docker-compose.yml
app:
  environment:
    - NODE_OPTIONS=--max-old-space-size=1024
```

## 🔄 更新部署

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose down
docker-compose build --no-cache app
docker-compose up -d

# 运行数据库迁移（如果有）
docker-compose exec app npx prisma db push
```

### 备份和恢复

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u lifetree_user -plifetree_password life_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker-compose exec -T mysql mysql -u lifetree_user -plifetree_password life_db < backup_20241009_120000.sql
```

## 📞 技术支持

如果在部署过程中遇到问题：

1. 查看项目文档：`docs/` 目录
2. 提交 Issue：GitHub Issues
3. 联系技术支持：support@lifetree.com

---

**部署完成后，您的 LifeTree 应用将在 http://localhost:3000 上运行！**
