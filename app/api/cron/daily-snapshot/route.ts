import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/cron/daily-snapshot - 每日凌晨自动创建数据快照
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加API密钥验证）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'lifetree-cron-2024'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    console.log(`开始执行每日数据快照任务: ${startOfDay.toISOString()}`)

    // 获取所有活跃用户
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    })

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const user of users) {
      try {
        console.log(`处理用户: ${user.email} (${user.id})`)
        console.log(`Prisma客户端状态:`, typeof prisma, prisma ? '已初始化' : '未初始化')
        
        // 检查是否已存在今日快照
        const existingSnapshot = await prisma.dailyPlanSnapshot.findFirst({
          where: {
            userId: user.id,
            snapshotDate: startOfDay
          }
        })

        if (existingSnapshot) {
          console.log(`用户 ${user.email} 今日快照已存在，跳过`)
          continue
        }

        // 获取该用户的所有计划（截至今日）
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
        const plans = await prisma.plan.findMany({
          where: {
            userId: user.id,
            createdAt: {
              lte: endOfDay
            }
          }
        })

        // 计算统计数据
        const totalPlans = plans.length
        const completedPlans = plans.filter(plan => plan.status === 'COMPLETED').length
        const pendingPlans = plans.filter(plan => plan.status === 'PENDING').length
        const completionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0

        const highPriorityPlans = plans.filter(plan => plan.priority === 'HIGH').length
        const mediumPriorityPlans = plans.filter(plan => plan.priority === 'MEDIUM').length
        const lowPriorityPlans = plans.filter(plan => plan.priority === 'LOW').length

        // 创建快照
        const snapshot = await prisma.dailyPlanSnapshot.create({
          data: {
            userId: user.id,
            snapshotDate: startOfDay,
            totalPlans,
            completedPlans,
            pendingPlans,
            completionRate,
            highPriorityPlans,
            mediumPriorityPlans,
            lowPriorityPlans
          }
        })

        // 创建详情记录
        if (plans.length > 0) {
          const detailData = plans.map(plan => ({
            snapshotId: snapshot.id,
            planId: plan.id,
            title: plan.title,
            status: plan.status,
            priority: plan.priority
          }))

          await prisma.dailyPlanDetail.createMany({
            data: detailData
          })
        }

        successCount++
        console.log(`用户 ${user.email} 数据快照创建成功: 总计划${totalPlans}，完成${completedPlans}，完成率${completionRate.toFixed(1)}%`)

      } catch (error: any) {
        errorCount++
        const errorMsg = `用户 ${user.email} 快照创建失败: ${error.message}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    const result = {
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        totalUsers: users.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `每日数据快照任务完成: 成功${successCount}个，失败${errorCount}个`
    }

    console.log(result.message)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('每日数据快照任务执行失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || '每日数据快照任务执行失败',
        error: error.stack 
      },
      { status: 500 }
    )
  }
}

// GET /api/cron/daily-snapshot - 手动触发快照任务（用于测试）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testDate = searchParams.get('date')
    
    if (testDate) {
      // 测试指定日期的快照
      const testRequest = new NextRequest(request.url, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.CRON_SECRET_TOKEN || 'lifetree-cron-2024'}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ date: testDate })
      })
      
      return POST(testRequest)
    }

    return NextResponse.json({
      success: true,
      message: '每日数据快照API运行正常',
      endpoints: {
        'POST /api/cron/daily-snapshot': '执行每日凌晨自动快照任务',
        'GET /api/cron/daily-snapshot?date=YYYY-MM-DD': '测试指定日期的快照任务'
      }
    })
  } catch (error: any) {
    console.error('快照API测试失败:', error)
    return NextResponse.json(
      { success: false, message: error.message || '快照API测试失败' },
      { status: 500 }
    )
  }
}
