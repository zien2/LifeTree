# 🧪 LifeTree 测试数据文档

## 📊 数据概览

系统已生成以下测试数据，用于开发和测试：

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 用户 | 10个 | 包含不同场景的测试账号 |
| 计划 | 20个 | 前5个用户各有4个计划 |
| 生命树 | 10棵 | 每个用户一棵默认树 |
| 叶子 | 20片 | 每个计划对应一片叶子 |
| AI分析 | 5条 | 前5个用户各有一条 |
| 通知 | 5条 | 前5个用户各有一条欢迎通知 |

---

## 👥 测试账号

### 基础测试账号（1-8号）

| 序号 | 邮箱 | 密码 | 姓名 | 有计划 | 说明 |
|------|------|------|------|--------|------|
| 1 | `zhangsan@lifetree.com` | `Test123456` | 张三 | ✅ | 完整数据用户 |
| 2 | `lisi@lifetree.com` | `Test123456` | 李四 | ✅ | 完整数据用户 |
| 3 | `wangwu@lifetree.com` | `Test123456` | 王五 | ✅ | 完整数据用户 |
| 4 | `zhaoliu@lifetree.com` | `Test123456` | 赵六 | ✅ | 完整数据用户 |
| 5 | `sunqi@lifetree.com` | `Test123456` | 孙七 | ✅ | 完整数据用户 |
| 6 | `zhouba@lifetree.com` | `Test123456` | 周八 | ❌ | 新用户（无数据） |
| 7 | `wujiu@lifetree.com` | `Test123456` | 吴九 | ❌ | 新用户（无数据） |
| 8 | `zhengshi@lifetree.com` | `Test123456` | 郑十 | ❌ | 新用户（无数据） |

### 特殊测试账号

| 邮箱 | 密码 | 姓名 | 用途 |
|------|------|------|------|
| `admin@lifetree.com` | `Admin123456` | 管理员 | 管理员功能测试 |
| `demo@lifetree.com` | `Demo123456` | 演示账号 | 演示和展示用 |

---

## 📋 计划数据详情

前5个用户（张三-孙七）各有4个计划：

### 计划1: 学习 React 基础
- **优先级**: HIGH（高）
- **状态**: COMPLETED（已完成）
- **描述**: 完成 React 官方教程
- **叶子颜色**: 🟢 绿色

### 计划2: 完成项目文档
- **优先级**: MEDIUM（中）
- **状态**: COMPLETED（已完成）
- **描述**: 编写 API 文档和使用说明
- **叶子颜色**: 🟢 绿色

### 计划3: 每日运动30分钟
- **优先级**: MEDIUM（中）
- **状态**: PENDING（进行中）
- **描述**: 保持健康的运动习惯
- **叶子颜色**: 🟡 黄色

### 计划4: 阅读技术书籍
- **优先级**: LOW（低）
- **状态**: PENDING（进行中）
- **描述**: 阅读《深入理解TypeScript》
- **叶子颜色**: 🔵 蓝色

---

## 🌳 生命树数据

每个用户都有一棵默认生命树：

### 有计划用户的树（张三-孙七）
- **名称**: {姓名}的生命树
- **类型**: DEFAULT（默认树）
- **健康度**: 104（基础100 + 完成2个计划×2）
- **等级**: 2（完成2个计划 / 2 + 1）
- **叶子数**: 4片

### 新用户的树（周八-演示账号）
- **名称**: {姓名}的生命树
- **类型**: DEFAULT（默认树）
- **健康度**: 100
- **等级**: 1
- **叶子数**: 0片

---

## 🤖 AI分析数据

前5个用户各有一条每日分析：

```json
{
  "type": "DAILY",
  "content": "今日完成了2个计划，表现不错！建议继续保持学习和运动的习惯，同时注意劳逸结合。",
  "score": 5
}
```

---

## 🔔 通知数据

前5个用户各有一条欢迎通知：

```json
{
  "title": "欢迎使用 LifeTree",
  "content": "您已成功注册！开始创建您的第一个计划吧。",
  "type": "SYSTEM",
  "isRead": false
}
```

---

## 🧪 测试场景

### 场景1: 新用户注册流程
**使用账号**: 无（创建新账号）
```bash
# 测试注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test123456","name":"新用户"}'
```

### 场景2: 用户登录流程
**使用账号**: `zhangsan@lifetree.com` / `Test123456`
```bash
# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zhangsan@lifetree.com","password":"Test123456"}'
```

### 场景3: 有数据用户
**使用账号**: 张三、李四、王五、赵六、孙七
- ✅ 有完成的计划（2个）
- ✅ 有进行中的计划（2个）
- ✅ 有生命树和叶子
- ✅ 有AI分析记录
- ✅ 有系统通知
- **适合测试**: 计划列表、树可视化、数据统计

### 场景4: 新用户（无数据）
**使用账号**: 周八、吴九、郑十
- ✅ 只有默认生命树
- ❌ 没有计划
- ❌ 没有叶子
- ❌ 没有AI分析
- ❌ 没有通知
- **适合测试**: 空状态页面、创建第一个计划

### 场景5: 管理员账号
**使用账号**: `admin@lifetree.com` / `Admin123456`
- **适合测试**: 管理员功能（未来开发）

### 场景6: 演示账号
**使用账号**: `demo@lifetree.com` / `Demo123456`
- **适合测试**: 演示和展示用途

---

## 🔄 重新生成测试数据

如果需要重新生成测试数据，运行以下命令：

```bash
npm run prisma:seed
```

**⚠️ 警告**: 此命令会清空所有现有数据！

---

## 📝 数据验证

### 查看用户列表
```bash
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 \
  -e "SELECT id, email, name FROM users;"
```

### 查看计划列表
```bash
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 \
  -e "SELECT id, title, priority, status, userId FROM plans;"
```

### 查看生命树
```bash
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 \
  -e "SELECT id, name, health, level, userId FROM trees;"
```

### 查看叶子
```bash
docker exec -i mysql-grip mysql -u root -pHzy0520. life-db --default-character-set=utf8mb4 \
  -e "SELECT id, color, status, treeId, planId FROM leaves LIMIT 10;"
```

---

## 💡 使用建议

1. **前端开发**: 使用张三账号（有完整数据）
2. **空状态测试**: 使用周八账号（新用户）
3. **API测试**: 使用任意账号
4. **演示展示**: 使用demo账号
5. **性能测试**: 可创建更多用户和数据

---

## 🔐 密码规则

所有测试账号的密码都符合系统要求：
- ✅ 至少8个字符
- ✅ 包含大写字母
- ✅ 包含小写字母
- ✅ 包含数字

---

**创建时间**: 2024-10-07  
**更新时间**: 2024-10-07  
**维护者**: LifeTree 开发团队

