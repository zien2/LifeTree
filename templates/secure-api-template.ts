import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

/**
 * 安全的API路由模板
 * 使用此模板创建新的API端点
 */

// GET /api/your-endpoint - 获取数据
export async function GET(request: NextRequest) {
  try {
    // 1. 验证JWT token
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

    // 2. 获取查询参数（如果需要）
    const { searchParams } = new URL(request.url)
    const param1 = searchParams.get('param1')

    // 3. 执行业务逻辑 - 确保数据按用户隔离
    // 示例：获取用户的计划
    const data = await prisma.plan.findMany({
      where: { 
        userId: payload.userId, // 重要：按用户隔离数据
        // 其他查询条件...
      },
      // 其他查询选项...
    })

    return NextResponse.json({
      success: true,
      data,
      message: '数据获取成功'
    })
  } catch (error) {
    console.error('获取数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取数据失败' },
      { status: 500 }
    )
  }
}

// POST /api/your-endpoint - 创建数据
export async function POST(request: NextRequest) {
  try {
    // 1. 验证JWT token
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

    // 2. 获取请求体数据
    const body = await request.json()
    const { field1, field2 } = body

    // 3. 验证输入数据
    if (!field1) {
      return NextResponse.json(
        { success: false, message: 'field1不能为空' },
        { status: 400 }
      )
    }

    // 4. 创建数据 - 确保关联到当前用户
    const newData = await prisma.plan.create({
      data: {
        userId: payload.userId, // 重要：关联到当前用户
        title: '示例计划',
        description: '这是一个示例计划',
        priority: 'MEDIUM',
        status: 'PENDING',
        // 其他字段...
      }
    })

    return NextResponse.json({
      success: true,
      data: newData,
      message: '数据创建成功'
    }, { status: 201 })
  } catch (error) {
    console.error('创建数据失败:', error)
    return NextResponse.json(
      { success: false, message: '创建数据失败' },
      { status: 500 }
    )
  }
}

// PATCH /api/your-endpoint/[id] - 更新数据
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证JWT token
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

    // 2. 检查数据是否存在且属于当前用户
    const existingData = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!existingData) {
      return NextResponse.json(
        { success: false, message: '数据不存在' },
        { status: 404 }
      )
    }

    if (existingData.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限修改此数据' },
        { status: 403 }
      )
    }

    // 3. 获取更新数据
    const body = await request.json()
    const { field1, field2 } = body

    // 4. 更新数据
    const updatedData = await prisma.plan.update({
      where: { id: params.id },
      data: {
        title: '更新的计划',
        description: '这是更新后的计划描述',
        // 其他字段...
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedData,
      message: '数据更新成功'
    })
  } catch (error) {
    console.error('更新数据失败:', error)
    return NextResponse.json(
      { success: false, message: '更新数据失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/your-endpoint/[id] - 删除数据
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证JWT token
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

    // 2. 检查数据是否存在且属于当前用户
    const existingData = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!existingData) {
      return NextResponse.json(
        { success: false, message: '数据不存在' },
        { status: 404 }
      )
    }

    if (existingData.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: '无权限删除此数据' },
        { status: 403 }
      )
    }

    // 3. 删除数据
    await prisma.plan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '数据删除成功'
    })
  } catch (error) {
    console.error('删除数据失败:', error)
    return NextResponse.json(
      { success: false, message: '删除数据失败' },
      { status: 500 }
    )
  }
}
