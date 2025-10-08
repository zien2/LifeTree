-- ==========================================
-- LifeTree 数据库表和字段注释脚本
-- ==========================================

-- 1. users 表注释
ALTER TABLE `users` COMMENT '用户表：存储系统用户的基本信息和认证凭据';

ALTER TABLE `users` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT '用户唯一标识ID，自动生成';
ALTER TABLE `users` MODIFY COLUMN `email` VARCHAR(255) NOT NULL COMMENT '用户邮箱，用于登录，必须唯一';
ALTER TABLE `users` MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT '用户密码（使用bcrypt哈希加密后存储，不存储明文）';
ALTER TABLE `users` MODIFY COLUMN `name` VARCHAR(100) DEFAULT NULL COMMENT '用户昵称/姓名（可选）';
ALTER TABLE `users` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '账号注册创建时间';
ALTER TABLE `users` MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL COMMENT '账号信息最后更新时间（自动更新）';

-- 2. plans 表注释
ALTER TABLE `plans` COMMENT '计划表：存储用户创建的每日计划，支持优先级管理和状态跟踪';

ALTER TABLE `plans` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT '计划唯一标识ID';
ALTER TABLE `plans` MODIFY COLUMN `title` VARCHAR(255) NOT NULL COMMENT '计划标题（如"完成项目报告"）';
ALTER TABLE `plans` MODIFY COLUMN `description` TEXT DEFAULT NULL COMMENT '计划详细描述/备注（可选）';
ALTER TABLE `plans` MODIFY COLUMN `priority` VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' COMMENT '优先级：HIGH(高)、MEDIUM(中)、LOW(低)';
ALTER TABLE `plans` MODIFY COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING(未完成)、COMPLETED(已完成)、OVERDUE(逾期)';
ALTER TABLE `plans` MODIFY COLUMN `dueDate` DATETIME(3) DEFAULT NULL COMMENT '计划截止日期时间（可选，用于逾期检查）';
ALTER TABLE `plans` MODIFY COLUMN `completedAt` DATETIME(3) DEFAULT NULL COMMENT '计划实际完成时间（标记完成时自动记录）';
ALTER TABLE `plans` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '计划创建时间';
ALTER TABLE `plans` MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL COMMENT '计划最后更新时间';
ALTER TABLE `plans` MODIFY COLUMN `userId` VARCHAR(191) NOT NULL COMMENT '所属用户ID（外键关联users表）';

-- 3. ai_analyses 表注释
ALTER TABLE `ai_analyses` COMMENT 'AI分析表：存储AI对用户计划数据的分析结果，包括成长性评分和周期报告';

ALTER TABLE `ai_analyses` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT 'AI分析记录唯一标识ID';
ALTER TABLE `ai_analyses` MODIFY COLUMN `type` VARCHAR(50) NOT NULL COMMENT '分析类型：DAILY(每日成长性)、WEEKLY(周报告)、MONTHLY(月报告)、CUSTOM(自定义问答)';
ALTER TABLE `ai_analyses` MODIFY COLUMN `content` TEXT NOT NULL COMMENT 'AI分析的完整文本内容和建议';
ALTER TABLE `ai_analyses` MODIFY COLUMN `score` INT DEFAULT NULL COMMENT '成长性评分（1-5星，仅DAILY类型有效，其他类型为NULL）';
ALTER TABLE `ai_analyses` MODIFY COLUMN `period` VARCHAR(50) DEFAULT NULL COMMENT '周期标识：如"2024-W01"表示2024年第1周，"2024-01"表示2024年1月';
ALTER TABLE `ai_analyses` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '分析生成时间';
ALTER TABLE `ai_analyses` MODIFY COLUMN `userId` VARCHAR(191) NOT NULL COMMENT '所属用户ID（外键关联users表）';

-- 4. notifications 表注释
ALTER TABLE `notifications` COMMENT '通知表：存储系统向用户推送的各类通知消息';

ALTER TABLE `notifications` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT '通知唯一标识ID';
ALTER TABLE `notifications` MODIFY COLUMN `title` VARCHAR(255) NOT NULL COMMENT '通知标题（如"本周分析报告已生成"）';
ALTER TABLE `notifications` MODIFY COLUMN `content` TEXT NOT NULL COMMENT '通知详细内容';
ALTER TABLE `notifications` MODIFY COLUMN `isRead` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读：true(1-已读)、false(0-未读)';
ALTER TABLE `notifications` MODIFY COLUMN `type` VARCHAR(50) NOT NULL COMMENT '通知类型：ANALYSIS(分析报告)、REMINDER(提醒)、SYSTEM(系统通知)';
ALTER TABLE `notifications` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '通知创建时间';
ALTER TABLE `notifications` MODIFY COLUMN `userId` VARCHAR(191) NOT NULL COMMENT '接收通知的用户ID（外键关联users表）';

-- 5. trees 表注释
ALTER TABLE `trees` COMMENT '生命树表：存储用户的生命树信息，用于可视化展示用户的成长状态';

ALTER TABLE `trees` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT '生命树唯一标识ID';
ALTER TABLE `trees` MODIFY COLUMN `name` VARCHAR(100) NOT NULL COMMENT '树的名称（如"2024年成长树"、"健身计划树"）';
ALTER TABLE `trees` MODIFY COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'DEFAULT' COMMENT '树的类型：DEFAULT(默认)、ANNUAL(年度)、CUSTOM(自定义)';
ALTER TABLE `trees` MODIFY COLUMN `health` INT NOT NULL DEFAULT 100 COMMENT '树的健康度（0-100），根据计划完成情况动态计算，完成+2，逾期-5';
ALTER TABLE `trees` MODIFY COLUMN `level` INT NOT NULL DEFAULT 1 COMMENT '树的等级，随着完成计划数量增加而提升，每10个计划升1级';
ALTER TABLE `trees` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '树创建时间';
ALTER TABLE `trees` MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL COMMENT '树状态最后更新时间';
ALTER TABLE `trees` MODIFY COLUMN `userId` VARCHAR(191) NOT NULL COMMENT '所属用户ID（外键关联users表）';

-- 6. leaves 表注释
ALTER TABLE `leaves` COMMENT '叶子表：存储生命树上的叶子信息，每个计划对应一片叶子，用于可视化动画展示';

ALTER TABLE `leaves` MODIFY COLUMN `id` VARCHAR(191) NOT NULL COMMENT '叶子唯一标识ID';
ALTER TABLE `leaves` MODIFY COLUMN `color` VARCHAR(50) NOT NULL COMMENT '叶子颜色：green(绿色-已完成)、red(红色-高优先级)、yellow(黄色-中优先级)、blue(蓝色-低优先级)、brown(褐色-逾期)';
ALTER TABLE `leaves` MODIFY COLUMN `status` VARCHAR(50) NOT NULL COMMENT '叶子状态：GROWING(生长中)、FLOATING(飘动)、FALLING(飘落)、WITHERED(枯萎)';
ALTER TABLE `leaves` MODIFY COLUMN `positionX` DOUBLE NOT NULL COMMENT '叶子在画布上的X坐标位置（像素值）';
ALTER TABLE `leaves` MODIFY COLUMN `positionY` DOUBLE NOT NULL COMMENT '叶子在画布上的Y坐标位置（像素值）';
ALTER TABLE `leaves` MODIFY COLUMN `rotation` DOUBLE NOT NULL DEFAULT 0 COMMENT '叶子旋转角度（0-360度，用于飘落动画）';
ALTER TABLE `leaves` MODIFY COLUMN `opacity` DOUBLE NOT NULL DEFAULT 1 COMMENT '叶子透明度（0.0-1.0，1为完全不透明）';
ALTER TABLE `leaves` MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '叶子创建时间（计划创建时自动生成）';
ALTER TABLE `leaves` MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL COMMENT '叶子状态最后更新时间';
ALTER TABLE `leaves` MODIFY COLUMN `treeId` VARCHAR(191) NOT NULL COMMENT '所属生命树ID（外键关联trees表）';
ALTER TABLE `leaves` MODIFY COLUMN `planId` VARCHAR(191) NOT NULL COMMENT '对应的计划ID（外键关联plans表）';

