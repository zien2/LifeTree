import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数：分析数据' 
      }, { status: 400 })
    }

    let messages: Array<{role: string, content: string}> = []

    // 检查是否是聊天模式
    if (data.chatContext) {
      // 聊天模式：使用提供的聊天上下文
      messages = data.chatContext
    } else {
      // 分析模式：构建分析提示词
      const prompt = `作为时间管理专家，分析用户计划数据并提供优化建议：

数据概览：总计划${data.totalPlans}个，已完成${data.completedPlans}个，完成率${data.completionRate}%
优先级：高${data.highPriorityPlans}个，中${data.mediumPriorityPlans}个，低${data.lowPriorityPlans}个
最近计划：${data.recentPlans.slice(0, 5).map((plan: any) => 
  `${plan.title}(${plan.priority === 'HIGH' ? '高' : plan.priority === 'MEDIUM' ? '中' : '低'},${plan.status === 'COMPLETED' ? '完成' : '进行中'})`
).join('; ')}

请从完成度、优先级管理、时间分配、效率优化4个维度分析，给出3-5个具体建议。控制在400-600字。`
      messages = [
        {
          role: 'system',
          content: '你是一位专业的时间管理和效率专家，擅长分析个人计划完成情况并提供实用的优化建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }

    // 调用阿里云百炼API
    const aiApiKey = process.env.AI_API_KEY || 'sk-c3d3d8211d2e4a70a4132631ec644e42'
    const aiApiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    
    // 创建AbortController用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Moonshot-Kimi-K2-Instruct',
        messages: messages,
        max_tokens: 800,  // 减少token数量，提高响应速度
        temperature: 0.5, // 降低温度，提高确定性，减少生成时间
        stream: false,
        top_p: 0.9,      // 添加top_p参数，提高效率
        frequency_penalty: 0.1, // 减少重复，提高质量
        presence_penalty: 0.1
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json()
      console.error('阿里云百炼API错误:', errorData)
      return NextResponse.json({ 
        success: false, 
        message: `AI服务调用失败: ${errorData.error?.message || '未知错误'}` 
      }, { status: 500 })
    }

    const aiResult = await aiResponse.json()
    const analysis = aiResult.choices?.[0]?.message?.content

    if (!analysis) {
      return NextResponse.json({ 
        success: false, 
        message: 'AI分析结果为空' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('AI分析API错误:', error)
    
    // 处理超时错误
    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: 'AI分析请求超时，请稍后重试'
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: '服务器内部错误' 
    }, { status: 500 })
  }
}
