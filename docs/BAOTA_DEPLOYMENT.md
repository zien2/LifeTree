# 🌳 LifeTree 宝塔面板部署指南

## 📋 部署概述

本指南将帮助您将 LifeTree 项目完整部署到宝塔面板上，包括：
- Next.js 应用部署
- MySQL 数据库配置
- 环境变量配置
- 域名和 SSL 证书配置
- 定时任务设置

## 🛠 环境要求

### 宝塔面板要求
- 宝塔面板 7.x 或更高版本
- Linux 系统（推荐 CentOS 7+ 或 Ubuntu 18+）
- 至少 2GB 内存
- 至少 20GB 硬盘空间

### 软件环境
- Node.js 20.x
- MySQL 8.0
- PM2 进程管理器
- Nginx 反向代理

## 🚀 部署步骤

### 第一步：安装宝塔面板

1. **下载并安装宝塔面板**
```bash
# CentOS 安装命令
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu 安装命令
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

2. **安装完成后，记录面板地址、用户名和密码**

### 第二步：安装必要软件

1. **登录宝塔面板**
2. **安装软件商店中的以下软件：**
   - Nginx 1.20+
   - MySQL 8.0
   - Node.js 20.x
   - PM2 管理器

### 第三步：创建网站

1. **在宝塔面板中创建网站**
   - 点击"网站" → "添加站点"
   - 域名：填写您的域名（如：lifetree.yourdomain.com）
   - 根目录：`/www/wwwroot/lifetree.yourdomain.com`
   - PHP版本：选择"纯静态"

2. **配置 SSL 证书**
   - 在网站设置中申请 Let's Encrypt 免费证书
   - 或上传您自己的 SSL 证书

### 第四步：上传项目代码

1. **上传项目文件**
   ```bash
   # 方法1：通过宝塔面板文件管理器上传
   # 将项目压缩包上传到 /www/wwwroot/lifetree.yourdomain.com/
   # 然后解压
   
   # 方法2：通过 Git 克隆
   cd /www/wwwroot/lifetree.yourdomain.com/
   git clone https://github.com/your-username/lifetree.git .
   ```

2. **设置文件权限**
   ```bash
   chown -R www:www /www/wwwroot/lifetree.yourdomain.com/
   chmod -R 755 /www/wwwroot/lifetree.yourdomain.com/
   ```

### 第五步：配置数据库

1. **创建数据库**
   - 在宝塔面板中点击"数据库" → "添加数据库"
   - 数据库名：`life_db`
   - 用户名：`lifetree_user`
   - 密码：设置强密码
   - 权限：本地服务器

2. **记录数据库连接信息**
   - 主机：`127.0.0.1`
   - 端口：`3306`
   - 数据库名：`life_db`
   - 用户名：`lifetree_user`
   - 密码：您设置的密码

### 第六步：配置环境变量

1. **创建生产环境配置文件**
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com/
   cp env.sample .env.production
   ```

2. **编辑 `.env.production` 文件**
   ```env
   # 生产环境配置
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://lifetree.yourdomain.com
   
   # JWT 密钥（请使用强密钥）
   JWT_SECRET=your-super-secret-jwt-key-for-production
   
   # 数据库连接
   DATABASE_URL=mysql://lifetree_user:your_password@127.0.0.1:3306/life_db
   
   # AI API 配置（可选）
   AI_API_KEY=your_bailian_api_key
   
   # 邮件配置
   SMTP_HOST=smtp.qq.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@qq.com
   SMTP_PASS=your_smtp_password
   ```

### 第七步：安装依赖和构建

1. **安装项目依赖**
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com/
   npm install --production
   ```

2. **生成 Prisma 客户端**
   ```bash
   npx prisma generate
   ```

3. **构建生产版本**
   ```bash
   npm run build
   ```

### 第八步：初始化数据库

1. **推送数据库模式**
   ```bash
   npx prisma db push
   ```

2. **添加数据库注释（可选）**
   ```bash
   mysql -u lifetree_user -p life_db < prisma/add-comments.sql
   ```

### 第九步：配置 PM2 进程管理

1. **创建 PM2 配置文件**
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com/
   ```

2. **创建 `ecosystem.config.js`**
   ```javascript
   module.exports = {
     apps: [{
       name: 'lifetree',
       script: 'npm',
       args: 'start',
       cwd: '/www/wwwroot/lifetree.yourdomain.com',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: '/www/wwwroot/lifetree.yourdomain.com/logs/err.log',
       out_file: '/www/wwwroot/lifetree.yourdomain.com/logs/out.log',
       log_file: '/www/wwwroot/lifetree.yourdomain.com/logs/combined.log',
       time: true
     }]
   }
   ```

3. **创建日志目录**
   ```bash
   mkdir -p /www/wwwroot/lifetree.yourdomain.com/logs
   ```

4. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 第十步：配置 Nginx 反向代理

1. **在宝塔面板中配置网站**
   - 点击网站设置 → "配置文件"
   - 替换为以下配置：

```nginx
server {
    listen 80;
    server_name lifetree.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lifetree.yourdomain.com;
    
    # SSL 配置
    ssl_certificate /www/server/panel/vhost/cert/lifetree.yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/lifetree.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers on;
    
    # 静态文件缓存
    location /_next/static/ {
        alias /www/wwwroot/lifetree.yourdomain.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源
    location /public/ {
        alias /www/wwwroot/lifetree.yourdomain.com/public/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API 路由和页面路由
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

2. **重载 Nginx 配置**
   ```bash
   nginx -t
   nginx -s reload
   ```

### 第十一步：配置定时任务

1. **在宝塔面板中设置定时任务**
   - 点击"计划任务" → "添加任务"
   - 任务类型：Shell 脚本
   - 任务名称：LifeTree 每日快照
   - 执行周期：每天 0:30
   - 脚本内容：
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com && npm run cron:snapshot
   ```

2. **添加安全扫描任务（可选）**
   - 任务名称：LifeTree 安全扫描
   - 执行周期：每周一 2:00
   - 脚本内容：
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com && npm run security:check
   ```

### 第十二步：配置防火墙

1. **在宝塔面板中配置防火墙**
   - 点击"安全" → "防火墙"
   - 确保以下端口开放：
     - 80 (HTTP)
     - 443 (HTTPS)
     - 22 (SSH)
     - 3306 (MySQL，仅本地访问)

### 第十三步：测试部署

1. **检查应用状态**
   ```bash
   pm2 status
   pm2 logs lifetree
   ```

2. **测试数据库连接**
   ```bash
   cd /www/wwwroot/lifetree.yourdomain.com
   npx prisma studio
   ```

3. **访问网站**
   - 打开浏览器访问：`https://lifetree.yourdomain.com`
   - 测试注册、登录、创建计划等功能

## 🔧 维护和监控

### 日志管理

1. **查看应用日志**
   ```bash
   pm2 logs lifetree
   tail -f /www/wwwroot/lifetree.yourdomain.com/logs/combined.log
   ```

2. **查看 Nginx 日志**
   - 在宝塔面板中点击"网站" → "日志"

### 性能优化

1. **启用 Gzip 压缩**
   - 在 Nginx 配置中添加：
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

2. **配置缓存**
   - 静态资源缓存已在 Nginx 配置中设置

### 备份策略

1. **数据库备份**
   - 在宝塔面板中设置数据库自动备份
   - 备份频率：每日
   - 保留天数：30天

2. **代码备份**
   - 定期提交代码到 Git 仓库
   - 在宝塔面板中设置文件备份

## 🚨 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep :3000
   
   # 检查 PM2 状态
   pm2 status
   pm2 logs lifetree
   ```

2. **数据库连接失败**
   ```bash
   # 检查 MySQL 状态
   systemctl status mysql
   
   # 测试数据库连接
   mysql -u lifetree_user -p life_db
   ```

3. **Nginx 502 错误**
   - 检查应用是否正常运行
   - 检查端口配置是否正确
   - 查看 Nginx 错误日志

### 性能监控

1. **使用宝塔面板监控**
   - 查看系统资源使用情况
   - 监控数据库性能
   - 查看网站访问统计

2. **应用性能监控**
   ```bash
   # 查看 PM2 监控
   pm2 monit
   
   # 查看系统资源
   htop
   ```

## 📞 技术支持

如果在部署过程中遇到问题，可以：

1. 查看项目文档：`docs/` 目录
2. 提交 Issue：GitHub Issues
3. 联系技术支持：support@lifetree.com

---

**部署完成后，您的 LifeTree 应用将在 `https://lifetree.yourdomain.com` 上运行！**
