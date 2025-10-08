import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/notifications - 获取用户的所有通知
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

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const notifications = await prisma.notification.findMany({
      where: {
        userId: payload.userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // 限制返回最近50条
    })

    // 统计未读数量
    const unreadCount = await prisma.notification.count({
      where: {
        userId: payload.userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    console.error('获取通知失败:', error)
    return NextResponse.json(
      { success: false, message: '获取通知失败' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - 创建新通知（系统内部使用）
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
    const { title, content, type } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title,
        content,
        type: type || 'SYSTEM',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: { notification },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建通知失败:', error)
    return NextResponse.json(
      { success: false, message: '创建通知失败' },
      { status: 500 }
    )
  }
}

