import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// POST /api/notifications/mark-all-read - 标记所有通知为已读
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

    await prisma.notification.updateMany({
      where: {
        userId: payload.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '所有通知已标记为已读',
    })
  } catch (error) {
    console.error('标记全部已读失败:', error)
    return NextResponse.json(
      { success: false, message: '标记全部已读失败' },
      { status: 500 }
    )
  }
}

