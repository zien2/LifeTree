# 📝 数据库注释说明

## ✅ 已完成

所有6个表和所有字段都已添加详细的中文注释！

## 📊 表注释总览

| 表名 | 中文名称 | 说明 |
|------|---------|------|
| `users` | 用户表 | 存储系统用户的基本信息和认证凭据 |
| `plans` | 计划表 | 存储用户创建的每日计划，支持优先级管理和状态跟踪 |
| `ai_analyses` | AI分析表 | 存储AI对用户计划数据的分析结果，包括成长性评分和周期报告 |
| `notifications` | 通知表 | 存储系统向用户推送的各类通知消息 |
| `trees` | 生命树表 | 存储用户的生命树信息，用于可视化展示用户的成长状态 |
| `leaves` | 叶子表 | 存储生命树上的叶子信息，每个计划对应一片叶子，用于可视化动画展示 |

## 🔍 如何查看注释

### 方法1: 查看表注释

```bash
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "
SELECT TABLE_NAME, TABLE_COMMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='life-db' 
ORDER BY TABLE_NAME;
"
```

### 方法2: 查看特定表的所有字段注释

```bash
# 查看 users 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM users;"

# 查看 plans 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM plans;"

# 查看 leaves 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM leaves;"

# 查看 trees 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM trees;"

# 查看 ai_analyses 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM ai_analyses;"

# 查看 notifications 表
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 -e "SHOW FULL COLUMNS FROM notifications;"
```

### 方法3: 使用数据库工具查看

使用 Navicat、DBeaver、phpMyAdmin 等数据库管理工具连接到数据库后：

1. 右键表名 → 查看表结构
2. 可以看到每个字段的完整注释
3. 确保工具的字符集设置为 UTF-8

## ⚠️ 重要提示

### 字符集问题

如果查看注释时出现乱码，请确保：

1. **MySQL客户端使用 utf8mb4 字符集**
   ```bash
   --default-character-set=utf8mb4
   ```

2. **数据库工具设置为 UTF-8 编码**

3. **终端/命令行支持 UTF-8**

### 重新添加注释

如果需要重新添加注释，执行：

```bash
cd /Users/hanzhiyin/lifetree
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 < prisma/add-comments.sql
```

## 📁 相关文件

- **注释SQL脚本**: `/Users/hanzhiyin/lifetree/prisma/add-comments.sql`
- **数据库设计文档**: `/Users/hanzhiyin/lifetree/docs/DATABASE.md`
- **Prisma Schema**: `/Users/hanzhiyin/lifetree/prisma/schema.prisma`

## 📋 字段注释示例

### users 表字段

- `id` - 用户唯一标识ID，自动生成
- `email` - 用户邮箱，用于登录，必须唯一
- `password` - 用户密码（使用bcrypt哈希加密后存储，不存储明文）
- `name` - 用户昵称/姓名（可选）
- `createdAt` - 账号注册创建时间
- `updatedAt` - 账号信息最后更新时间（自动更新）

### plans 表字段

- `id` - 计划唯一标识ID
- `title` - 计划标题（如"完成项目报告"）
- `description` - 计划详细描述/备注（可选）
- `priority` - 优先级：HIGH(高)、MEDIUM(中)、LOW(低)
- `status` - 状态：PENDING(未完成)、COMPLETED(已完成)、OVERDUE(逾期)
- `dueDate` - 计划截止日期时间（可选，用于逾期检查）
- `completedAt` - 计划实际完成时间（标记完成时自动记录）
- `createdAt` - 计划创建时间
- `updatedAt` - 计划最后更新时间
- `userId` - 所属用户ID（外键关联users表）

### leaves 表字段（动画相关）

- `id` - 叶子唯一标识ID
- `color` - 叶子颜色：green(绿色-已完成)、red(红色-高优先级)、yellow(黄色-中优先级)、blue(蓝色-低优先级)、brown(褐色-逾期)
- `status` - 叶子状态：GROWING(生长中)、FLOATING(飘动)、FALLING(飘落)、WITHERED(枯萎)
- `positionX` - 叶子在画布上的X坐标位置（像素值）
- `positionY` - 叶子在画布上的Y坐标位置（像素值）
- `rotation` - 叶子旋转角度（0-360度，用于飘落动画）
- `opacity` - 叶子透明度（0.0-1.0，1为完全不透明）
- `createdAt` - 叶子创建时间（计划创建时自动生成）
- `updatedAt` - 叶子状态最后更新时间
- `treeId` - 所属生命树ID（外键关联trees表）
- `planId` - 对应的计划ID（外键关联plans表）

### trees 表字段

- `id` - 生命树唯一标识ID
- `name` - 树的名称（如"2024年成长树"、"健身计划树"）
- `type` - 树的类型：DEFAULT(默认)、ANNUAL(年度)、CUSTOM(自定义)
- `health` - 树的健康度（0-100），根据计划完成情况动态计算，完成+2，逾期-5
- `level` - 树的等级，随着完成计划数量增加而提升，每10个计划升1级
- `createdAt` - 树创建时间
- `updatedAt` - 树状态最后更新时间
- `userId` - 所属用户ID（外键关联users表）

### ai_analyses 表字段

- `id` - AI分析记录唯一标识ID
- `type` - 分析类型：DAILY(每日成长性)、WEEKLY(周报告)、MONTHLY(月报告)、CUSTOM(自定义问答)
- `content` - AI分析的完整文本内容和建议
- `score` - 成长性评分（1-5星，仅DAILY类型有效，其他类型为NULL）
- `period` - 周期标识：如"2024-W01"表示2024年第1周，"2024-01"表示2024年1月
- `createdAt` - 分析生成时间
- `userId` - 所属用户ID（外键关联users表）

### notifications 表字段

- `id` - 通知唯一标识ID
- `title` - 通知标题（如"本周分析报告已生成"）
- `content` - 通知详细内容
- `isRead` - 是否已读：true(1-已读)、false(0-未读)
- `type` - 通知类型：ANALYSIS(分析报告)、REMINDER(提醒)、SYSTEM(系统通知)
- `createdAt` - 通知创建时间
- `userId` - 接收通知的用户ID（外键关联users表）

---

**创建时间**: 2024年10月7日  
**维护者**: LifeTree 开发团队

