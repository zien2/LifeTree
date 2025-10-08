import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/daily-snapshots - 获取用户的每日数据快照
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供认证令牌' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')

    // 构建查询条件
    const where: any = {
      userId: payload.userId
    }

    if (startDate && endDate) {
      where.snapshotDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const snapshots = await prisma.dailyPlanSnapshot.findMany({
      where,
      orderBy: { snapshotDate: 'desc' },
      take: limit,
      include: {
        details: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { snapshots }
    })
  } catch (error: any) {
    console.error('获取每日快照失败:', error)
    return NextResponse.json(
      { success: false, message: error.message || '获取每日快照失败' },
      { status: 500 }
    )
  }
}

// POST /api/daily-snapshots - 创建每日数据快照
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供认证令牌' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { snapshotDate } = body

    if (!snapshotDate) {
      return NextResponse.json(
        { success: false, message: '请提供快照日期' },
        { status: 400 }
      )
    }

    const targetDate = new Date(snapshotDate)
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

    // 获取该日期的所有计划
    const plans = await prisma.plan.findMany({
      where: {
        userId: payload.userId,
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

    // 检查是否已存在该日期的快照
    const existingSnapshot = await prisma.dailyPlanSnapshot.findFirst({
      where: {
        userId: payload.userId,
        snapshotDate: startOfDay
      }
    })

    let snapshot
    if (existingSnapshot) {
      // 更新现有快照
      snapshot = await prisma.dailyPlanSnapshot.update({
        where: { id: existingSnapshot.id },
        data: {
          totalPlans,
          completedPlans,
          pendingPlans,
          completionRate,
          highPriorityPlans,
          mediumPriorityPlans,
          lowPriorityPlans
        }
      })

      // 删除旧的详情记录
      await prisma.dailyPlanDetail.deleteMany({
        where: { snapshotId: existingSnapshot.id }
      })
    } else {
      // 创建新快照
      snapshot = await prisma.dailyPlanSnapshot.create({
        data: {
          userId: payload.userId,
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
    }

    // 创建详情记录
    const detailData = plans.map(plan => ({
      snapshotId: snapshot.id,
      planId: plan.id,
      title: plan.title,
      status: plan.status,
      priority: plan.priority
    }))

    if (detailData.length > 0) {
      await prisma.dailyPlanDetail.createMany({
        data: detailData
      })
    }

    // 返回完整的快照数据
    const fullSnapshot = await prisma.dailyPlanSnapshot.findUnique({
      where: { id: snapshot.id },
      include: {
        details: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { snapshot: fullSnapshot },
      message: `成功创建 ${targetDate.toLocaleDateString('zh-CN')} 的数据快照`
    })
  } catch (error: any) {
    console.error('创建每日快照失败:', error)
    return NextResponse.json(
      { success: false, message: error.message || '创建每日快照失败' },
      { status: 500 }
    )
  }
}
