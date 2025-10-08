const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPlans() {
  try {
    const userId = 'cmgg80cir0003e7gmg0owv3qn'
    
    const totalPlans = await prisma.plan.count({
      where: { userId }
    })
    
    const completedPlans = await prisma.plan.count({
      where: { 
        userId,
        status: 'COMPLETED'
      }
    })
    
    const inProgressPlans = await prisma.plan.count({
      where: { 
        userId,
        status: 'IN_PROGRESS'
      }
    })
    
    const pendingPlans = await prisma.plan.count({
      where: { 
        userId,
        status: 'PENDING'
      }
    })
    
    console.log('=== 计划统计 ===')
    console.log(`总计划数: ${totalPlans}`)
    console.log(`已完成: ${completedPlans}`)
    console.log(`进行中: ${inProgressPlans}`)
    console.log(`待处理: ${pendingPlans}`)
    console.log(`完成率: ${totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0}%`)
    
    // 显示最近几个计划
    const recentPlans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log('\n=== 最近5个计划 ===')
    recentPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (${plan.status}) - ${plan.createdAt.toISOString().split('T')[0]}`)
    })
    
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPlans()
