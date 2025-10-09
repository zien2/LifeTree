#!/bin/bash

# LifeTree 宝塔面板快速配置脚本
# 用于在宝塔面板中快速配置网站、数据库等

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
DOMAIN=""
PROJECT_DIR=""
DB_NAME="life_db"
DB_USER="lifetree_user"
DB_PASS=""

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_question() {
    echo -e "${BLUE}[QUESTION]${NC} $1"
}

# 获取用户输入
get_user_input() {
    print_question "请输入您的域名（如：lifetree.yourdomain.com）:"
    read -r DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        print_error "域名不能为空"
        exit 1
    fi
    
    PROJECT_DIR="/www/wwwroot/$DOMAIN"
    
    print_question "请输入数据库密码:"
    read -s DB_PASS
    echo
    
    if [ -z "$DB_PASS" ]; then
        print_error "数据库密码不能为空"
        exit 1
    fi
}

# 创建网站配置
create_website_config() {
    print_message "创建网站配置..."
    
    cat > /tmp/website_config.txt << EOF
域名: $DOMAIN
根目录: $PROJECT_DIR
PHP版本: 纯静态
SSL: 需要配置
EOF

    print_message "网站配置已保存到 /tmp/website_config.txt"
    print_warning "请在宝塔面板中手动创建网站，使用以上配置"
}

# 创建数据库配置
create_database_config() {
    print_message "创建数据库配置..."
    
    cat > /tmp/database_config.txt << EOF
数据库名: $DB_NAME
用户名: $DB_USER
密码: $DB_PASS
主机: 127.0.0.1
端口: 3306
权限: 本地服务器
EOF

    print_message "数据库配置已保存到 /tmp/database_config.txt"
    print_warning "请在宝塔面板中手动创建数据库，使用以上配置"
}

# 创建 Nginx 配置
create_nginx_config() {
    print_message "创建 Nginx 配置..."
    
    cat > /tmp/nginx_config.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL 配置（需要在宝塔面板中配置）
    # ssl_certificate /www/server/panel/vhost/cert/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /www/server/panel/vhost/cert/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers on;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态文件缓存
    location /_next/static/ {
        alias $PROJECT_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源
    location /public/ {
        alias $PROJECT_DIR/public/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API 路由和页面路由
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

    print_message "Nginx 配置已保存到 /tmp/nginx_config.conf"
    print_warning "请在宝塔面板中配置网站 Nginx，使用以上配置"
}

# 创建环境变量配置
create_env_config() {
    print_message "创建环境变量配置..."
    
    # 生成随机 JWT 密钥
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > /tmp/env_production.txt << EOF
# 生产环境配置
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://$DOMAIN

# JWT 密钥
JWT_SECRET=$JWT_SECRET

# 数据库连接
DATABASE_URL=mysql://$DB_USER:$DB_PASS@127.0.0.1:3306/$DB_NAME

# AI API 配置（可选）
AI_API_KEY=your_bailian_api_key

# 邮件配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@qq.com
SMTP_PASS=your_smtp_password
EOF

    print_message "环境变量配置已保存到 /tmp/env_production.txt"
    print_warning "请将配置复制到项目的 .env.production 文件中"
}

# 创建定时任务配置
create_cron_config() {
    print_message "创建定时任务配置..."
    
    cat > /tmp/cron_tasks.txt << EOF
# LifeTree 定时任务配置

## 任务1：每日数据快照
任务名称: LifeTree 每日快照
任务类型: Shell 脚本
执行周期: 每天 0:30
脚本内容:
cd $PROJECT_DIR && npm run cron:snapshot

## 任务2：安全扫描
任务名称: LifeTree 安全扫描
任务类型: Shell 脚本
执行周期: 每周一 2:00
脚本内容:
cd $PROJECT_DIR && npm run security:check

## 任务3：应用重启（可选）
任务名称: LifeTree 应用重启
任务类型: Shell 脚本
执行周期: 每天 3:00
脚本内容:
cd $PROJECT_DIR && pm2 restart lifetree
EOF

    print_message "定时任务配置已保存到 /tmp/cron_tasks.txt"
    print_warning "请在宝塔面板中手动添加这些定时任务"
}

# 创建防火墙配置
create_firewall_config() {
    print_message "创建防火墙配置..."
    
    cat > /tmp/firewall_config.txt << EOF
# LifeTree 防火墙配置

需要开放的端口:
- 80 (HTTP)
- 443 (HTTPS)
- 22 (SSH)
- 3306 (MySQL，仅本地访问)

在宝塔面板中配置:
1. 点击"安全" → "防火墙"
2. 确保以上端口已开放
3. 3306 端口仅允许本地访问
EOF

    print_message "防火墙配置已保存到 /tmp/firewall_config.txt"
}

# 创建部署检查清单
create_checklist() {
    print_message "创建部署检查清单..."
    
    cat > /tmp/deployment_checklist.txt << EOF
# LifeTree 宝塔面板部署检查清单

## 1. 环境准备
□ 宝塔面板已安装
□ Node.js 20.x 已安装
□ MySQL 8.0 已安装
□ PM2 已安装
□ Nginx 已安装

## 2. 网站配置
□ 在宝塔面板中创建网站: $DOMAIN
□ 根目录设置为: $PROJECT_DIR
□ 配置 SSL 证书
□ 配置 Nginx（使用提供的配置文件）

## 3. 数据库配置
□ 在宝塔面板中创建数据库: $DB_NAME
□ 用户名: $DB_USER
□ 密码: $DB_PASS
□ 权限: 本地服务器

## 4. 项目部署
□ 上传项目代码到: $PROJECT_DIR
□ 安装依赖: npm install --production
□ 生成 Prisma 客户端: npx prisma generate
□ 构建项目: npm run build
□ 配置环境变量: .env.production

## 5. 数据库初始化
□ 推送数据库模式: npx prisma db push
□ 添加数据库注释: mysql -u $DB_USER -p$DB_PASS $DB_NAME < prisma/add-comments.sql

## 6. 应用启动
□ 创建 PM2 配置文件: ecosystem.config.js
□ 启动应用: pm2 start ecosystem.config.js
□ 设置开机自启: pm2 save && pm2 startup

## 7. 定时任务
□ 添加每日快照任务
□ 添加安全扫描任务
□ 添加应用重启任务（可选）

## 8. 安全配置
□ 配置防火墙
□ 设置文件权限
□ 配置安全头

## 9. 测试验证
□ 访问网站: https://$DOMAIN
□ 测试注册功能
□ 测试登录功能
□ 测试创建计划功能
□ 测试生命树显示

## 10. 监控配置
□ 配置日志监控
□ 配置性能监控
□ 配置备份策略
EOF

    print_message "部署检查清单已保存到 /tmp/deployment_checklist.txt"
}

# 主函数
main() {
    echo "🌳 LifeTree 宝塔面板快速配置脚本"
    echo "=================================="
    
    get_user_input
    
    print_message "开始生成配置文件..."
    
    create_website_config
    create_database_config
    create_nginx_config
    create_env_config
    create_cron_config
    create_firewall_config
    create_checklist
    
    print_message "配置文件生成完成！"
    echo ""
    print_message "生成的配置文件："
    echo "- /tmp/website_config.txt - 网站配置"
    echo "- /tmp/database_config.txt - 数据库配置"
    echo "- /tmp/nginx_config.conf - Nginx 配置"
    echo "- /tmp/env_production.txt - 环境变量配置"
    echo "- /tmp/cron_tasks.txt - 定时任务配置"
    echo "- /tmp/firewall_config.txt - 防火墙配置"
    echo "- /tmp/deployment_checklist.txt - 部署检查清单"
    echo ""
    print_warning "请按照检查清单完成所有配置步骤"
    print_message "详细部署说明请查看: docs/BAOTA_DEPLOYMENT.md"
}

# 运行主函数
main "$@"
