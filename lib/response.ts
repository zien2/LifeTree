import { NextResponse } from 'next/server'

/**
 * 统一的成功响应格式
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || '操作成功',
    },
    { status }
  )
}

/**
 * 统一的错误响应格式
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  )
}

/**
 * 未授权响应
 */
export function unauthorizedResponse(message = '未授权，请先登录') {
  return errorResponse(message, 'UNAUTHORIZED', 401)
}

/**
 * 禁止访问响应
 */
export function forbiddenResponse(message = '无权访问此资源') {
  return errorResponse(message, 'FORBIDDEN', 403)
}

/**
 * 未找到响应
 */
export function notFoundResponse(message = '资源不存在') {
  return errorResponse(message, 'NOT_FOUND', 404)
}

/**
 * 服务器错误响应
 */
export function serverErrorResponse(message = '服务器内部错误') {
  return errorResponse(message, 'SERVER_ERROR', 500)
}

