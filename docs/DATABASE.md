# 📊 LifeTree 数据库设计文档

## 数据库概览

LifeTree 系统使用 MySQL 数据库，包含 6 个核心数据表，用于管理用户、计划、AI分析、通知、生命树及叶子的完整生命周期。

### 表关系图

```
User (用户)
 ├── Plan (计划) ──→ Leaf (叶子)
 ├── Notification (通知)
 ├── AIAnalysis (AI分析)
 └── Tree (生命树) ──→ Leaf (叶子)
```

---

## 1️⃣ users（用户表）

**表名**: `users`  
**用途**: 存储系统用户的基本信息和认证凭据

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | 用户唯一标识ID，自动生成 |
| `email` | VARCHAR(255) | ✅ | - | 用户邮箱，用于登录，必须唯一 |
| `password` | VARCHAR(255) | ✅ | - | 用户密码（使用bcrypt哈希加密后存储，不存储明文） |
| `name` | VARCHAR(100) | ❌ | NULL | 用户昵称/姓名（可选） |
| `createdAt` | DATETIME | ✅ | now() | 账号注册创建时间 |
| `updatedAt` | DATETIME | ✅ | now() | 账号信息最后更新时间（自动更新） |

### 索引
- **PRIMARY KEY**: `id`
- **UNIQUE INDEX**: `email` - 确保邮箱唯一性
- **INDEX**: `email` - 优化登录查询性能

### 关联关系
- **一对多**: 一个用户可以创建多个计划 (`plans`)
- **一对多**: 一个用户可以拥有多个通知 (`notifications`)
- **一对多**: 一个用户可以有多条AI分析记录 (`aiAnalyses`)
- **一对多**: 一个用户可以拥有多棵生命树 (`trees`)

### 业务规则
1. 邮箱必须唯一，注册时需验证
2. 密码长度建议 8-20 位，需包含大小写字母和数字
3. 用户删除时，级联删除其所有关联数据（计划、通知、分析、树）

---

## 2️⃣ plans（计划表）

**表名**: `plans`  
**用途**: 存储用户创建的每日计划，支持优先级管理和状态跟踪

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | 计划唯一标识ID |
| `title` | VARCHAR(255) | ✅ | - | 计划标题（如"完成项目报告"） |
| `description` | TEXT | ❌ | NULL | 计划详细描述/备注（可选） |
| `priority` | VARCHAR(50) | ✅ | MEDIUM | 优先级：**HIGH**(高)、**MEDIUM**(中)、**LOW**(低) |
| `status` | VARCHAR(50) | ✅ | PENDING | 状态：**PENDING**(未完成)、**COMPLETED**(已完成)、**OVERDUE**(逾期) |
| `dueDate` | DATETIME | ❌ | NULL | 计划截止日期时间（可选，用于逾期检查） |
| `completedAt` | DATETIME | ❌ | NULL | 计划实际完成时间（标记完成时自动记录） |
| `createdAt` | DATETIME | ✅ | now() | 计划创建时间 |
| `updatedAt` | DATETIME | ✅ | now() | 计划最后更新时间 |
| `userId` | VARCHAR(191) | ✅ | - | 所属用户ID（外键） |

### 索引
- **PRIMARY KEY**: `id`
- **INDEX**: `userId` - 优化查询某用户的所有计划
- **INDEX**: `status` - 优化按状态筛选（如查询未完成计划）
- **INDEX**: `dueDate` - 优化逾期检查任务

### 关联关系
- **多对一**: 多个计划属于一个用户 (`user`)
- **一对多**: 一个计划可以对应多个叶子状态记录 (`leaves`)

### 优先级说明
| 优先级 | 值 | 颜色标识 | 图标 | 说明 |
|--------|-----|----------|------|------|
| 高 | HIGH | 🔴 红色 | ⚠️ | 紧急重要任务 |
| 中 | MEDIUM | 🟡 黄色 | ⚫ | 常规任务 |
| 低 | LOW | 🔵 蓝色 | ✓ | 灵活可调整任务 |

### 状态说明
| 状态 | 值 | 说明 | 叶子效果 |
|------|-----|------|----------|
| 未完成 | PENDING | 计划进行中，未到截止日期 | 按优先级颜色轻微飘动 |
| 已完成 | COMPLETED | 用户已标记完成 | 变绿色静止 |
| 逾期 | OVERDUE | 已过截止日期但未完成 | 变褐色飘落 |

### 业务规则
1. 创建计划时自动关联当前用户和创建日期
2. 标记完成时自动记录 `completedAt` 时间，状态改为 `COMPLETED`
3. 系统定时任务（每日凌晨）检查 `dueDate`，将过期未完成计划标记为 `OVERDUE`
4. 计划删除时，级联删除关联的叶子记录

---

## 3️⃣ ai_analyses（AI分析表）

**表名**: `ai_analyses`  
**用途**: 存储AI对用户计划数据的分析结果，包括成长性评分和周期报告

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | AI分析记录唯一标识ID |
| `type` | VARCHAR(50) | ✅ | - | 分析类型：**DAILY**(每日)、**WEEKLY**(周报)、**MONTHLY**(月报)、**CUSTOM**(自定义问答) |
| `content` | TEXT | ✅ | - | AI分析的完整文本内容和建议 |
| `score` | INT | ❌ | NULL | 成长性评分（1-5星，仅DAILY类型有效） |
| `period` | VARCHAR(50) | ❌ | NULL | 周期标识：如"2024-W01"(第1周)、"2024-01"(1月) |
| `createdAt` | DATETIME | ✅ | now() | 分析生成时间 |
| `userId` | VARCHAR(191) | ✅ | - | 所属用户ID（外键） |

### 索引
- **PRIMARY KEY**: `id`
- **INDEX**: `userId` - 优化查询某用户的分析记录
- **INDEX**: `type` - 优化按分析类型筛选
- **INDEX**: `period` - 优化查询特定周期的报告

### 关联关系
- **多对一**: 多条分析记录属于一个用户 (`user`)

### 分析类型说明
| 类型 | 值 | 触发方式 | 触发时机 | score字段 | period字段 |
|------|-----|----------|----------|-----------|-----------|
| 每日分析 | DAILY | 被动 | 创建计划后自动生成 | ✅ 必填(1-5) | ❌ 不填 |
| 周报告 | WEEKLY | 定时 | 每周一凌晨自动生成 | ❌ 不填 | ✅ 必填(如"2024-W42") |
| 月报告 | MONTHLY | 定时 | 每月1日凌晨自动生成 | ❌ 不填 | ✅ 必填(如"2024-10") |
| 自定义 | CUSTOM | 主动 | 用户提问时生成 | ❌ 不填 | ❌ 不填 |

### 业务规则
1. **DAILY 类型**: 用户创建计划后，AI自动分析该计划的成长性并给出1-5星评分
2. **WEEKLY 类型**: 系统定时任务每周一生成，统计上周完成率、趋势分析
3. **MONTHLY 类型**: 系统定时任务每月1日生成，统计上月数据和对比分析
4. **CUSTOM 类型**: 用户主动提问（如"如何优化健身计划"），基于历史数据给出建议
5. 生成周期报告后，自动创建一条通知提醒用户查看

---

## 4️⃣ notifications（通知表）

**表名**: `notifications`  
**用途**: 存储系统向用户推送的各类通知消息

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | 通知唯一标识ID |
| `title` | VARCHAR(255) | ✅ | - | 通知标题（如"本周分析报告已生成"） |
| `content` | TEXT | ✅ | - | 通知详细内容 |
| `isRead` | BOOLEAN | ✅ | false | 是否已读：**true**(已读)、**false**(未读) |
| `type` | VARCHAR(50) | ✅ | - | 通知类型：**ANALYSIS**(分析报告)、**REMINDER**(提醒)、**SYSTEM**(系统通知) |
| `createdAt` | DATETIME | ✅ | now() | 通知创建时间 |
| `userId` | VARCHAR(191) | ✅ | - | 接收通知的用户ID（外键） |

### 索引
- **PRIMARY KEY**: `id`
- **INDEX**: `userId` - 优化查询某用户的通知列表
- **INDEX**: `isRead` - 优化查询未读通知

### 关联关系
- **多对一**: 多条通知属于一个用户 (`user`)

### 通知类型说明
| 类型 | 值 | 触发场景 | 示例 |
|------|-----|----------|------|
| 分析报告 | ANALYSIS | 周期分析完成后 | "您的本周成长报告已生成，完成率85%" |
| 提醒 | REMINDER | 重要计划逾期 | "您有3个高优先级计划已逾期" |
| 系统通知 | SYSTEM | 系统公告、功能更新 | "LifeTree 新增了AI问答功能" |

### 业务规则
1. 通知创建时默认为未读状态（`isRead = false`）
2. 用户点击通知详情后，自动标记为已读（`isRead = true`）
3. 支持按已读/未读状态筛选通知列表
4. 未读通知在界面上显示角标提示

---

## 5️⃣ trees（生命树表）

**表名**: `trees`  
**用途**: 存储用户的生命树信息，用于可视化展示用户的成长状态

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | 生命树唯一标识ID |
| `name` | VARCHAR(100) | ✅ | - | 树的名称（如"2024年成长树"、"健身计划树"） |
| `type` | VARCHAR(50) | ✅ | DEFAULT | 树的类型：**DEFAULT**(默认)、**ANNUAL**(年度)、**CUSTOM**(自定义) |
| `health` | INT | ✅ | 100 | 树的健康度（0-100），根据计划完成情况动态计算 |
| `level` | INT | ✅ | 1 | 树的等级，随着完成计划数量增加而提升 |
| `createdAt` | DATETIME | ✅ | now() | 树创建时间 |
| `updatedAt` | DATETIME | ✅ | now() | 树状态最后更新时间 |
| `userId` | VARCHAR(191) | ✅ | - | 所属用户ID（外键） |

### 索引
- **PRIMARY KEY**: `id`
- **INDEX**: `userId` - 优化查询某用户的所有树

### 关联关系
- **多对一**: 多棵树属于一个用户 (`user`)
- **一对多**: 一棵树上有多片叶子 (`leaves`)

### 树类型说明
| 类型 | 值 | 说明 | 使用场景 |
|------|-----|------|----------|
| 默认树 | DEFAULT | 用户的主要生命树 | 首次注册自动创建 |
| 年度树 | ANNUAL | 按年度创建的树 | 每年1月1日自动创建新树 |
| 自定义树 | CUSTOM | 用户自定义的主题树 | 如"学习树"、"健康树" |

### 健康度计算规则
```
健康度 = 基础分(100) + 完成计划奖励 - 逾期计划惩罚

- 完成一个计划：+2分
- 逾期一个计划：-5分
- 取值范围：0-100
- 健康度 < 30：树显示枯萎状态
- 健康度 30-70：树显示普通状态
- 健康度 > 70：树显示茂盛状态
```

### 等级提升规则
```
等级提升 = floor(完成计划总数 / 10)

- 每完成10个计划，等级提升1级
- 等级越高，树的视觉效果越壮观
- Lv1-3: 小树苗
- Lv4-7: 成长树
- Lv8+: 参天大树
```

### 业务规则
1. 用户首次注册时自动创建一棵 `DEFAULT` 类型的树
2. 每年1月1日系统自动为活跃用户创建新的 `ANNUAL` 树
3. 用户可以手动创建 `CUSTOM` 类型的主题树
4. 树的 `health` 和 `level` 会根据关联计划的状态实时更新
5. 树删除时，级联删除树上的所有叶子

---

## 6️⃣ leaves（叶子表）

**表名**: `leaves`  
**用途**: 存储生命树上的叶子信息，每个计划对应一片叶子，用于可视化动画展示

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | VARCHAR(191) | ✅ | cuid() | 叶子唯一标识ID |
| `color` | VARCHAR(50) | ✅ | - | 叶子颜色：**green**(绿-已完成)、**red**(红-高优先级)、**yellow**(黄-中)、**blue**(蓝-低)、**brown**(褐-逾期) |
| `status` | VARCHAR(50) | ✅ | - | 叶子状态：**GROWING**(生长中)、**FLOATING**(飘动)、**FALLING**(飘落)、**WITHERED**(枯萎) |
| `positionX` | DOUBLE | ✅ | - | 叶子在画布上的X坐标位置（像素） |
| `positionY` | DOUBLE | ✅ | - | 叶子在画布上的Y坐标位置（像素） |
| `rotation` | DOUBLE | ✅ | 0 | 叶子旋转角度（0-360度） |
| `opacity` | DOUBLE | ✅ | 1.0 | 叶子透明度（0.0-1.0） |
| `createdAt` | DATETIME | ✅ | now() | 叶子创建时间 |
| `updatedAt` | DATETIME | ✅ | now() | 叶子状态最后更新时间 |
| `treeId` | VARCHAR(191) | ✅ | - | 所属生命树ID（外键） |
| `planId` | VARCHAR(191) | ✅ | - | 对应的计划ID（外键） |

### 索引
- **PRIMARY KEY**: `id`
- **INDEX**: `treeId` - 优化查询某棵树的所有叶子
- **INDEX**: `planId` - 优化查询某个计划对应的叶子
- **INDEX**: `status` - 优化按状态筛选叶子

### 关联关系
- **多对一**: 多片叶子属于一棵树 (`tree`)
- **多对一**: 多片叶子可以对应一个计划 (`plan`)

### 颜色与优先级映射
| 颜色 | 值 | 对应状态 | RGB值 |
|------|-----|----------|-------|
| 绿色 | green | 计划已完成 | #52c41a |
| 红色 | red | 高优先级未完成 | #ff4d4f |
| 黄色 | yellow | 中优先级未完成 | #faad14 |
| 蓝色 | blue | 低优先级未完成 | #1890ff |
| 褐色 | brown | 计划逾期 | #8b4513 |

### 叶子状态与动画效果
| 状态 | 值 | 动画效果 | 触发条件 |
|------|-----|----------|----------|
| 生长中 | GROWING | 从无到有渐显 | 计划刚创建 |
| 飘动 | FLOATING | 轻微上下左右摆动 | 计划未完成且未逾期 |
| 飘落 | FALLING | 向下飘落+旋转 | 计划逾期 |
| 枯萎 | WITHERED | 褐色静止 | 长期逾期 |

### 动画参数说明
```javascript
// 飘动动画（FLOATING）
{
  translateX: [-5, 5], // 左右摆动5px
  translateY: [-3, 3], // 上下摆动3px
  duration: 2000,      // 2秒一个周期
  repeat: Infinity
}

// 飘落动画（FALLING）
{
  translateY: [0, 500], // 向下500px
  rotate: [0, 360],     // 旋转360度
  opacity: [1, 0.3],    // 透明度降低
  duration: 3000,       // 3秒完成
  ease: "easeIn"
}
```

### 业务规则
1. **创建计划时**：自动生成一片叶子，颜色根据优先级确定，状态为 `GROWING`
2. **计划状态同步**：
   - 计划未完成 → 叶子 `FLOATING`，颜色对应优先级
   - 计划完成 → 叶子颜色变 `green`，停止飘动
   - 计划逾期 → 叶子颜色变 `brown`，状态变 `FALLING`
3. **位置计算**：叶子位置基于树的结构算法随机分布，避免重叠
4. **性能优化**：前端使用 Canvas 或 SVG 渲染，支持数百片叶子流畅动画

---

## 🔗 表关系详解

### 用户中心设计
所有数据都以用户为中心，用户删除时级联删除所有关联数据：
```
User (删除)
  ├── CASCADE → Plans (计划)
  │     └── CASCADE → Leaves (叶子)
  ├── CASCADE → Notifications (通知)
  ├── CASCADE → AIAnalyses (分析)
  └── CASCADE → Trees (树)
        └── CASCADE → Leaves (叶子)
```

### 计划与叶子联动
```
Plan (计划状态变化)
  ↓
Leaf (叶子视觉变化)
  ↓
Tree (树健康度更新)
```

### 数据流转示例
1. **用户创建计划**
   ```
   POST /api/plans
   → 创建 Plan 记录
   → 触发 AI 生成 DAILY 分析
   → 创建 Leaf 记录（GROWING状态）
   → 更新 Tree 健康度
   ```

2. **用户完成计划**
   ```
   PATCH /api/plans/:id (status = COMPLETED)
   → 更新 Plan.status = "COMPLETED"
   → 更新 Plan.completedAt = now()
   → 更新 Leaf.color = "green"
   → 更新 Leaf.status = "FLOATING"停止
   → 更新 Tree.health += 2
   → 更新 Tree.level (如满足升级条件)
   ```

3. **系统检测逾期**
   ```
   定时任务（每日凌晨）
   → 查询 Plan.dueDate < now() AND status = "PENDING"
   → 批量更新 Plan.status = "OVERDUE"
   → 批量更新 Leaf.color = "brown", status = "FALLING"
   → 批量更新 Tree.health -= 5
   → 创建 Notification (type = "REMINDER")
   ```

---

## 🎯 设计亮点

### 1. 完整的生命周期管理
- 从计划创建到完成/逾期，每个状态都有对应的数据记录和视觉反馈

### 2. 数据一致性保障
- 使用外键约束和级联删除，确保数据完整性
- 关键字段添加索引，优化查询性能

### 3. 可扩展性
- 字符串类型的枚举字段，便于后续添加新状态
- 预留自定义字段（如 Tree.type 的 CUSTOM）

### 4. 实时可视化支持
- Leaf 表的动画参数字段（position, rotation, opacity）
- Tree 表的健康度和等级字段

### 5. AI 分析能力
- 支持多种分析类型（每日/周/月/自定义）
- 周期标识便于生成趋势报告

---

## 📝 SQL 查询示例

### 查询用户的所有未完成计划（按优先级排序）
```sql
SELECT * FROM plans
WHERE userId = 'user_xxx' AND status = 'PENDING'
ORDER BY 
  FIELD(priority, 'HIGH', 'MEDIUM', 'LOW'),
  dueDate ASC;
```

### 查询本周的周报告
```sql
SELECT * FROM ai_analyses
WHERE userId = 'user_xxx' 
  AND type = 'WEEKLY'
  AND period = '2024-W42';
```

### 查询某棵树的所有飘动叶子
```sql
SELECT l.*, p.title, p.priority
FROM leaves l
JOIN plans p ON l.planId = p.id
WHERE l.treeId = 'tree_xxx' 
  AND l.status = 'FLOATING';
```

### 统计用户本月完成率
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
  ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rate
FROM plans
WHERE userId = 'user_xxx'
  AND createdAt >= '2024-10-01'
  AND createdAt < '2024-11-01';
```

---

## 🔒 安全与权限

### 数据隔离
- 所有查询必须包含 `userId` 条件，确保用户只能访问自己的数据
- API 层使用 JWT 认证，从 token 中提取 `userId`

### 敏感数据保护
- 用户密码使用 bcrypt 加密存储（salt rounds = 10）
- 不返回密码字段到前端

### 级联删除策略
- 用户删除：级联删除所有关联数据（计划、通知、分析、树、叶子）
- 谨慎操作，建议添加"软删除"功能

---

## 📊 性能优化建议

### 索引优化
- ✅ 已添加常用查询字段的索引
- 建议定期分析慢查询日志，优化索引策略

### 数据归档
- 建议每年归档历史计划数据
- 保留近一年的详细数据，历史数据仅保留统计摘要

### 缓存策略
- 用户信息（Redis，TTL 1小时）
- 生命树数据（Redis，TTL 5分钟）
- 周期报告（Redis，TTL 1天）

---

**文档版本**: v1.0  
**最后更新**: 2024年10月  
**维护者**: LifeTree 开发团队

