import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 测试用户数据
const testUsers = [
  {
    email: 'zhangsan@lifetree.com',
    password: 'Test123456',
    name: '张三',
  },
  {
    email: 'lisi@lifetree.com',
    password: 'Test123456',
    name: '李四',
  },
  {
    email: 'wangwu@lifetree.com',
    password: 'Test123456',
    name: '王五',
  },
  {
    email: 'zhaoliu@lifetree.com',
    password: 'Test123456',
    name: '赵六',
  },
  {
    email: 'sunqi@lifetree.com',
    password: 'Test123456',
    name: '孙七',
  },
  {
    email: 'zhouba@lifetree.com',
    password: 'Test123456',
    name: '周八',
  },
  {
    email: 'wujiu@lifetree.com',
    password: 'Test123456',
    name: '吴九',
  },
  {
    email: 'zhengshi@lifetree.com',
    password: 'Test123456',
    name: '郑十',
  },
  {
    email: 'admin@lifetree.com',
    password: 'Admin123456',
    name: '管理员',
  },
  {
    email: 'demo@lifetree.com',
    password: 'Demo123456',
    name: '演示账号',
  },
]

async function main() {
  console.log('🌱 开始填充数据库...')

  // 清空现有数据（可选）
  console.log('🗑️  清空现有数据...')
  await prisma.notification.deleteMany()
  await prisma.aIAnalysis.deleteMany()
  await prisma.leaf.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.tree.deleteMany()
  await prisma.user.deleteMany()

  // 创建测试用户
  console.log('👥 创建测试用户...')
  
  for (const userData of testUsers) {
    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    })

    console.log(`  ✅ 创建用户: ${user.email} (${user.name})`)

    // 为每个用户创建默认生命树
    const tree = await prisma.tree.create({
      data: {
        name: `${userData.name}的生命树`,
        type: 'DEFAULT',
        health: 100,
        level: 1,
        userId: user.id,
      },
    })

    console.log(`    🌳 创建生命树: ${tree.name}`)

    // 为部分用户创建示例计划
    if (testUsers.indexOf(userData) < 5) {
      // 只为前5个用户创建计划
      const plans = [
        {
          title: '学习 React 基础',
          description: '完成 React 官方教程',
          priority: 'HIGH',
          status: 'COMPLETED',
        },
        {
          title: '完成项目文档',
          description: '编写 API 文档和使用说明',
          priority: 'MEDIUM',
          status: 'COMPLETED',
        },
        {
          title: '每日运动30分钟',
          description: '保持健康的运动习惯',
          priority: 'MEDIUM',
          status: 'PENDING',
        },
        {
          title: '阅读技术书籍',
          description: '阅读《深入理解TypeScript》',
          priority: 'LOW',
          status: 'PENDING',
        },
      ]

      let completedCount = 0

      for (const planData of plans) {
        const plan = await prisma.plan.create({
          data: {
            ...planData,
            userId: user.id,
            completedAt: planData.status === 'COMPLETED' ? new Date() : null,
          },
        })

        if (plan.status === 'COMPLETED') {
          completedCount++
        }

        // 为每个计划创建对应的叶子
        const leafColor =
          plan.status === 'COMPLETED'
            ? 'green'
            : plan.priority === 'HIGH'
            ? 'red'
            : plan.priority === 'MEDIUM'
            ? 'yellow'
            : 'blue'

        const leafStatus =
          plan.status === 'COMPLETED' ? 'FLOATING' : 'GROWING'

        await prisma.leaf.create({
          data: {
            color: leafColor,
            status: leafStatus,
            positionX: Math.random() * 300 + 50,
            positionY: Math.random() * 400 + 50,
            rotation: Math.random() * 360,
            opacity: 1.0,
            treeId: tree.id,
            planId: plan.id,
          },
        })
      }

      // 更新树的健康度和等级
      const newHealth = 100 + completedCount * 2
      const newLevel = Math.floor(completedCount / 2) + 1

      await prisma.tree.update({
        where: { id: tree.id },
        data: {
          health: newHealth,
          level: newLevel,
        },
      })

      console.log(
        `    📋 创建 ${plans.length} 个计划，完成 ${completedCount} 个`
      )

      // 为有计划的用户创建AI分析
      await prisma.aIAnalysis.create({
        data: {
          type: 'DAILY',
          content: `今日完成了${completedCount}个计划，表现不错！建议继续保持学习和运动的习惯，同时注意劳逸结合。`,
          score: completedCount >= 2 ? 5 : 3,
          userId: user.id,
        },
      })

      // 创建通知
      await prisma.notification.create({
        data: {
          title: '欢迎使用 LifeTree',
          content: '您已成功注册！开始创建您的第一个计划吧。',
          type: 'SYSTEM',
          isRead: false,
          userId: user.id,
        },
      })

      console.log(`    🔔 创建通知和AI分析`)
    }
  }

  console.log('\n✨ 数据填充完成！')
  console.log('\n📊 数据统计：')
  
  const userCount = await prisma.user.count()
  const planCount = await prisma.plan.count()
  const treeCount = await prisma.tree.count()
  const leafCount = await prisma.leaf.count()
  const analysisCount = await prisma.aIAnalysis.count()
  const notificationCount = await prisma.notification.count()

  console.log(`  - 用户数: ${userCount}`)
  console.log(`  - 计划数: ${planCount}`)
  console.log(`  - 生命树: ${treeCount}`)
  console.log(`  - 叶子数: ${leafCount}`)
  console.log(`  - AI分析: ${analysisCount}`)
  console.log(`  - 通知数: ${notificationCount}`)

  console.log('\n🔑 测试账号信息：')
  console.log('  邮箱: zhangsan@lifetree.com ~ demo@lifetree.com')
  console.log('  密码: Test123456 (前8个) / Admin123456 (admin) / Demo123456 (demo)')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

