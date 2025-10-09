#!/bin/bash

# LifeTree 宝塔面板一键部署脚本
# 使用方法: bash scripts/baota-deploy.sh

set -e

echo "🌳 LifeTree 宝塔面板部署脚本"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/www/wwwroot/lifetree.yourdomain.com"
DOMAIN="lifetree.yourdomain.com"
DB_NAME="life_db"
DB_USER="lifetree_user"
DB_PASS=""

# 函数：打印彩色消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 用户运行
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请以 root 用户运行此脚本"
        exit 1
    fi
}

# 检查宝塔面板是否安装
check_baota() {
    if [ ! -f "/www/server/panel/BT-Panel" ]; then
        print_error "未检测到宝塔面板，请先安装宝塔面板"
        exit 1
    fi
    print_message "检测到宝塔面板"
}

# 检查必要软件
check_software() {
    print_message "检查必要软件..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请在宝塔面板中安装 Node.js 20.x"
        exit 1
    fi
    
    # 检查 MySQL
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL 未安装，请在宝塔面板中安装 MySQL 8.0"
        exit 1
    fi
    
    # 检查 PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 未安装，正在安装..."
        npm install -g pm2
    fi
    
    print_message "软件检查完成"
}

# 创建项目目录
create_project_dir() {
    print_message "创建项目目录..."
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
}

# 安装项目依赖
install_dependencies() {
    print_message "安装项目依赖..."
    npm install --production
}

# 生成 Prisma 客户端
generate_prisma() {
    print_message "生成 Prisma 客户端..."
    npx prisma generate
}

# 构建项目
build_project() {
    print_message "构建项目..."
    npm run build
}

# 创建环境配置文件
create_env_file() {
    print_message "创建环境配置文件..."
    
    cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://$DOMAIN

# JWT 密钥（请修改为强密钥）
JWT_SECRET=$(openssl rand -base64 32)

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

    print_warning "请编辑 .env.production 文件，配置正确的数据库密码和其他参数"
}

# 创建 PM2 配置文件
create_pm2_config() {
    print_message "创建 PM2 配置文件..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'lifetree',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$PROJECT_DIR/logs/err.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    log_file: '$PROJECT_DIR/logs/combined.log',
    time: true
  }]
}
EOF
}

# 创建日志目录
create_log_dir() {
    print_message "创建日志目录..."
    mkdir -p $PROJECT_DIR/logs
    chown -R www:www $PROJECT_DIR/logs
}

# 设置文件权限
set_permissions() {
    print_message "设置文件权限..."
    chown -R www:www $PROJECT_DIR
    chmod -R 755 $PROJECT_DIR
}

# 创建数据库初始化脚本
create_db_init_script() {
    print_message "创建数据库初始化脚本..."
    
    cat > init-database.sh << 'EOF'
#!/bin/bash

# 数据库初始化脚本
echo "正在初始化数据库..."

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "错误: .env.production 文件不存在"
    exit 1
fi

# 从环境变量文件中提取数据库连接信息
DB_URL=$(grep "DATABASE_URL" .env.production | cut -d '=' -f2)
echo "数据库连接: $DB_URL"

# 推送数据库模式
echo "推送数据库模式..."
npx prisma db push

# 添加数据库注释（如果存在）
if [ -f "prisma/add-comments.sql" ]; then
    echo "添加数据库注释..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < prisma/add-comments.sql
fi

echo "数据库初始化完成！"
EOF

    chmod +x init-database.sh
}

# 创建 Nginx 配置模板
create_nginx_config() {
    print_message "创建 Nginx 配置模板..."
    
    cat > nginx.conf << EOF
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
}

# 创建启动脚本
create_start_script() {
    print_message "创建启动脚本..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

# LifeTree 启动脚本
echo "启动 LifeTree 应用..."

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "错误: .env.production 文件不存在，请先配置环境变量"
    exit 1
fi

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "LifeTree 应用启动完成！"
echo "使用 'pm2 status' 查看应用状态"
echo "使用 'pm2 logs lifetree' 查看日志"
EOF

    chmod +x start.sh
}

# 创建停止脚本
create_stop_script() {
    print_message "创建停止脚本..."
    
    cat > stop.sh << 'EOF'
#!/bin/bash

# LifeTree 停止脚本
echo "停止 LifeTree 应用..."

pm2 stop lifetree
pm2 delete lifetree

echo "LifeTree 应用已停止！"
EOF

    chmod +x stop.sh
}

# 创建重启脚本
create_restart_script() {
    print_message "创建重启脚本..."
    
    cat > restart.sh << 'EOF'
#!/bin/bash

# LifeTree 重启脚本
echo "重启 LifeTree 应用..."

pm2 restart lifetree

echo "LifeTree 应用重启完成！"
EOF

    chmod +x restart.sh
}

# 主函数
main() {
    print_message "开始部署 LifeTree 到宝塔面板..."
    
    check_root
    check_baota
    check_software
    create_project_dir
    install_dependencies
    generate_prisma
    build_project
    create_env_file
    create_pm2_config
    create_log_dir
    set_permissions
    create_db_init_script
    create_nginx_config
    create_start_script
    create_stop_script
    create_restart_script
    
    print_message "部署脚本执行完成！"
    print_warning "请完成以下步骤："
    echo "1. 在宝塔面板中创建网站和数据库"
    echo "2. 编辑 .env.production 文件，配置正确的参数"
    echo "3. 运行 ./init-database.sh 初始化数据库"
    echo "4. 在宝塔面板中配置 Nginx（使用 nginx.conf 文件）"
    echo "5. 运行 ./start.sh 启动应用"
    echo ""
    print_message "详细部署说明请查看: docs/BAOTA_DEPLOYMENT.md"
}

# 运行主函数
main "$@"
