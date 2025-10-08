import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import dayjs from 'dayjs'

// 创建一些测试计划数据
export async function GET(request: NextRequest) {
  try {
    // 验证JWT token
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

    const today = dayjs().format('YYYY-MM-DD')
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

    const plans = [
      {
        id: '1',
        userId: payload.userId, // 使用当前用户ID
        title: '今天的计划1',
        description: '这是今天的一个测试计划',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: `${today}T10:00:00.000Z`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: payload.userId, // 使用当前用户ID
        title: '今天的计划2',
        description: '这是今天的另一个测试计划',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        dueDate: `${today}T14:00:00.000Z`,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        userId: payload.userId, // 使用当前用户ID
        title: '明天的计划',
        description: '这是明天的测试计划',
        priority: 'LOW',
        status: 'PENDING',
        dueDate: `${tomorrow}T09:00:00.000Z`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        userId: payload.userId, // 使用当前用户ID
        title: '昨天的计划',
        description: '这是昨天的测试计划',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: `${yesterday}T16:00:00.000Z`,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({ 
      success: true, 
      data: { plans },
      message: '测试计划数据获取成功'
    })
  } catch (error) {
    console.error('获取测试计划失败:', error)
    return NextResponse.json(
      { success: false, message: '获取测试计划失败' },
      { status: 500 }
    )
  }
}
