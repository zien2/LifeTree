#!/bin/bash

# LifeTree 数据库初始化脚本
# 用于在宝塔面板中初始化数据库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production 文件不存在"
        print_warning "请先运行配置脚本或手动创建环境变量文件"
        exit 1
    fi
    print_message "找到环境变量文件"
}

# 从环境变量文件中提取数据库连接信息
extract_db_config() {
    print_message "提取数据库配置..."
    
    # 提取 DATABASE_URL
    DATABASE_URL=$(grep "DATABASE_URL" .env.production | cut -d '=' -f2 | tr -d ' ')
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL 未配置"
        exit 1
    fi
    
    # 解析数据库连接信息
    # 格式: mysql://username:password@host:port/database
    DB_USER=$(echo $DATABASE_URL | sed 's/mysql:\/\/\([^:]*\):.*/\1/')
    DB_PASS=$(echo $DATABASE_URL | sed 's/mysql:\/\/[^:]*:\([^@]*\)@.*/\1/')
    DB_HOST=$(echo $DATABASE_URL | sed 's/mysql:\/\/[^:]*:[^@]*@\([^:]*\):.*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed 's/mysql:\/\/[^:]*:[^@]*@[^:]*:\([^/]*\)\/.*/\1/')
    DB_NAME=$(echo $DATABASE_URL | sed 's/mysql:\/\/[^:]*:[^@]*@[^:]*:[^/]*\/\(.*\)/\1/')
    
    print_message "数据库配置:"
    echo "  主机: $DB_HOST"
    echo "  端口: $DB_PORT"
    echo "  数据库: $DB_NAME"
    echo "  用户名: $DB_USER"
}

# 测试数据库连接
test_db_connection() {
    print_message "测试数据库连接..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1; then
        print_message "数据库连接成功"
    else
        print_error "数据库连接失败"
        print_warning "请检查数据库配置和权限"
        exit 1
    fi
}

# 检查数据库是否存在
check_database_exists() {
    print_message "检查数据库是否存在..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME;" > /dev/null 2>&1; then
        print_message "数据库 $DB_NAME 已存在"
        
        # 检查是否已有表
        TABLE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | wc -l)
        
        if [ $TABLE_COUNT -gt 0 ]; then
            print_warning "数据库 $DB_NAME 中已存在 $((TABLE_COUNT-1)) 个表"
            print_question "是否要重新初始化数据库？这将删除所有现有数据！(y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                print_warning "将删除现有数据并重新初始化"
                return 1
            else
                print_message "跳过数据库初始化"
                exit 0
            fi
        else
            print_message "数据库 $DB_NAME 为空，可以安全初始化"
        fi
    else
        print_error "数据库 $DB_NAME 不存在"
        print_warning "请在宝塔面板中先创建数据库"
        exit 1
    fi
}

# 备份现有数据（如果存在）
backup_existing_data() {
    print_message "备份现有数据..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
        print_message "数据已备份到: $BACKUP_FILE"
    else
        print_warning "备份失败，但继续初始化"
    fi
}

# 推送数据库模式
push_database_schema() {
    print_message "推送数据库模式..."
    
    # 设置环境变量
    export DATABASE_URL="$DATABASE_URL"
    
    # 推送模式
    if npx prisma db push --accept-data-loss; then
        print_message "数据库模式推送成功"
    else
        print_error "数据库模式推送失败"
        exit 1
    fi
}

# 添加数据库注释
add_database_comments() {
    print_message "添加数据库注释..."
    
    if [ -f "prisma/add-comments.sql" ]; then
        if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < prisma/add-comments.sql; then
            print_message "数据库注释添加成功"
        else
            print_warning "数据库注释添加失败，但可以继续"
        fi
    else
        print_warning "prisma/add-comments.sql 文件不存在，跳过注释添加"
    fi
}

# 验证数据库初始化
verify_initialization() {
    print_message "验证数据库初始化..."
    
    # 检查表是否创建成功
    TABLES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in" | wc -l)
    
    if [ $TABLES -gt 0 ]; then
        print_message "数据库初始化成功，共创建 $TABLES 个表"
        
        # 显示表列表
        echo "创建的表："
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in"
    else
        print_error "数据库初始化失败，没有创建任何表"
        exit 1
    fi
}

# 创建数据库用户（如果需要）
create_database_user() {
    print_message "检查数据库用户权限..."
    
    # 检查用户是否有创建表的权限
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SHOW GRANTS FOR '$DB_USER'@'$DB_HOST';" 2>/dev/null | grep -q "CREATE"; then
        print_message "用户权限检查通过"
    else
        print_warning "用户可能没有足够的权限，请确保用户有以下权限："
        echo "  - CREATE"
        echo "  - DROP"
        echo "  - ALTER"
        echo "  - INSERT"
        echo "  - UPDATE"
        echo "  - DELETE"
        echo "  - SELECT"
        echo "  - INDEX"
    fi
}

# 生成数据库连接测试脚本
create_db_test_script() {
    print_message "创建数据库连接测试脚本..."
    
    cat > test-db-connection.sh << EOF
#!/bin/bash

# 数据库连接测试脚本

echo "测试数据库连接..."

# 测试基本连接
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1 as test;" 2>/dev/null; then
    echo "✅ 基本连接测试通过"
else
    echo "❌ 基本连接测试失败"
    exit 1
fi

# 测试数据库访问
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SELECT 1 as test;" 2>/dev/null; then
    echo "✅ 数据库访问测试通过"
else
    echo "❌ 数据库访问测试失败"
    exit 1
fi

# 测试表创建权限
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; CREATE TABLE test_table (id INT); DROP TABLE test_table;" 2>/dev/null; then
    echo "✅ 表操作权限测试通过"
else
    echo "❌ 表操作权限测试失败"
    exit 1
fi

echo "🎉 所有数据库测试通过！"
EOF

    chmod +x test-db-connection.sh
    print_message "数据库连接测试脚本已创建: test-db-connection.sh"
}

# 主函数
main() {
    echo "🌳 LifeTree 数据库初始化脚本"
    echo "=============================="
    
    check_env_file
    extract_db_config
    test_db_connection
    create_database_user
    
    if check_database_exists; then
        backup_existing_data
    fi
    
    push_database_schema
    add_database_comments
    verify_initialization
    create_db_test_script
    
    print_message "数据库初始化完成！"
    echo ""
    print_message "下一步："
    echo "1. 运行 ./test-db-connection.sh 测试数据库连接"
    echo "2. 启动应用: pm2 start ecosystem.config.js"
    echo "3. 访问网站测试功能"
    echo ""
    print_warning "如果遇到问题，请检查："
    echo "- 数据库用户权限"
    echo "- 网络连接"
    echo "- 环境变量配置"
}

# 运行主函数
main "$@"
