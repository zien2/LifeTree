import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PATCH /api/notifications/[id] - 标记通知为已读
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

    // 检查通知是否属于当前用户
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: '通知不存在' },
        { status: 404 }
      )
    }

    if (existingNotification.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限操作此通知' },
        { status: 403 }
      )
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: { notification },
    })
  } catch (error) {
    console.error('更新通知失败:', error)
    return NextResponse.json(
      { success: false, message: '更新通知失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - 删除通知
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

    // 检查通知是否属于当前用户
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: '通知不存在' },
        { status: 404 }
      )
    }

    if (existingNotification.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限删除此通知' },
        { status: 403 }
      )
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: '通知已删除',
    })
  } catch (error) {
    console.error('删除通知失败:', error)
    return NextResponse.json(
      { success: false, message: '删除通知失败' },
      { status: 500 }
    )
  }
}

