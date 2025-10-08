import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/plans - 获取用户的所有计划
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

    const plans = await prisma.plan.findMany({
      where: { userId: payload.userId },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { plans }
    })
  } catch (error) {
    console.error('获取计划失败:', error)
    return NextResponse.json(
      { success: false, message: '获取计划失败' },
      { status: 500 }
    )
  }
}

// POST /api/plans - 创建新计划
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
    const { title, description, priority, startDate, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { success: false, message: '计划标题不能为空' },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        userId: payload.userId,
        title,
        description,
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: 'PENDING',
      }
    })

    // 计划类通知不持久化，由前端显示 Toast
    return NextResponse.json({
      success: true,
      data: { plan },
      message: '✨ 新计划已创建',
    }, { status: 201 })
  } catch (error) {
    console.error('创建计划失败:', error)
    return NextResponse.json(
      { success: false, message: '创建计划失败' },
      { status: 500 }
    )
  }
}

