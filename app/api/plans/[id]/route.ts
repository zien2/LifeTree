import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PATCH /api/plans/[id] - 更新计划
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    console.log('PATCH /api/plans/', params.id, 'raw body =>', body)
    const { title, description, priority, startDate, dueDate, status, completed } = body

    // 检查计划是否属于当前用户
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, message: '计划不存在' },
        { status: 404 }
      )
    }

    if (existingPlan.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限修改此计划' },
        { status: 403 }
      )
    }

    // 处理完成状态的转换
    let updateStatus = status
    if (completed !== undefined) {
      updateStatus = completed ? 'COMPLETED' : 'PENDING'
    }

    // 构造更新数据，仅包含前端传入的有效字段
    const updateData: any = {}
    if (typeof title === 'string') updateData.title = title
    if (typeof description === 'string') updateData.description = description
    if (typeof priority === 'string') updateData.priority = priority
    if (updateStatus !== undefined) updateData.status = updateStatus
    if (updateStatus === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (updateStatus === 'PENDING') {
      updateData.completedAt = null
    }
    if (startDate !== undefined) {
      // 仅当传入 startDate 时才尝试更新；为空字符串则忽略
      if (startDate) {
        const parsed = new Date(startDate)
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { success: false, message: '无效的开始日期格式' },
            { status: 400 }
          )
        }
        updateData.startDate = parsed
      } else {
        updateData.startDate = null
      }
    }
    if (dueDate !== undefined) {
      // 仅当传入 dueDate 时才尝试更新；为空字符串则忽略
      if (dueDate) {
        const parsed = new Date(dueDate)
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { success: false, message: '无效的截止日期格式' },
            { status: 400 }
          )
        }
        updateData.dueDate = parsed
      } else {
        updateData.dueDate = null
      }
    }

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: updateData,
    })

    // 计划类通知不持久化，由前端显示 Toast
    let message = undefined
    if (updateStatus === 'COMPLETED' && existingPlan.status !== 'COMPLETED') {
      message = `🎉 恭喜完成计划：${plan.title}`
    } else if (updateStatus === 'PENDING' && existingPlan.status === 'COMPLETED') {
      message = `📝 计划已取消完成：${plan.title}`
    }

    return NextResponse.json({
      success: true,
      data: { plan },
      message,
    })
  } catch (error: any) {
    console.error('更新计划失败:', error)
    return NextResponse.json(
      { success: false, message: error?.message || '更新计划失败', stack: error?.stack },
      { status: 500 }
    )
  }
}

// DELETE /api/plans/[id] - 删除计划
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查计划是否属于当前用户
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, message: '计划不存在' },
        { status: 404 }
      )
    }

    if (existingPlan.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限删除此计划' },
        { status: 403 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '计划已删除'
    })
  } catch (error) {
    console.error('删除计划失败:', error)
    return NextResponse.json(
      { success: false, message: '删除计划失败' },
      { status: 500 }
    )
  }
}

