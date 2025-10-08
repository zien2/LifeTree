# AI API 配置说明

## 概述

AI分析功能已集成阿里云百炼API，使用Moonshot-Kimi-K2-Instruct模型，用户无需输入API Key，直接点击按钮即可进行分析。

## 配置步骤

### 1. 环境变量配置

在您的 `.env` 文件中添加以下配置：

```bash
# AI API配置 - 阿里云百炼
AI_API_KEY="sk-c3d3d8211d2e4a70a4132631ec644e42"
```

### 2. 阿里云百炼API配置

系统已集成阿里云百炼API，使用以下配置：

#### API端点
```
https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

#### 模型
```
Moonshot-Kimi-K2-Instruct
```

#### 请求格式

```json
POST /chat/completions
Content-Type: application/json
Authorization: Bearer {AI_API_KEY}

{
  "model": "Moonshot-Kimi-K2-Instruct",
  "messages": [
    {
      "role": "system",
      "content": "你是一位专业的时间管理和效率专家..."
    },
    {
      "role": "user", 
      "content": "分析提示词..."
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "stream": false
}
```

#### 响应格式

```json
{
  "choices": [
    {
      "message": {
        "content": "AI分析结果文本..."
      }
    }
  ]
}
```

### 3. 分析提示词

系统会向您的AI API发送以下格式的分析提示词：

```
请作为一位专业的时间管理和效率专家，分析以下用户的计划完成数据，并提供详细的优化建议：

## 用户数据概览
- 总计划数：{totalPlans}
- 已完成计划：{completedPlans}
- 待完成计划：{pendingPlans}
- 完成率：{completionRate}%

## 优先级分布
- 高优先级计划：{highPriorityPlans}
- 中优先级计划：{mediumPriorityPlans}
- 低优先级计划：{lowPriorityPlans}

## 最近计划示例
{recentPlans列表}

## 分析要求
请从以下几个维度进行分析：

1. **完成度评估**：当前完成率是否合理？与行业标准对比如何？
2. **优先级管理**：优先级分配是否合理？高优先级计划的完成情况如何？
3. **时间管理**：是否存在计划过多或过少的问题？
4. **效率优化**：基于数据模式，提供具体的改进建议
5. **行动计划**：给出3-5个可执行的优化建议

请用中文回答，语言要专业但易懂，建议要具体可操作。分析结果请控制在500-800字之间。
```

## 技术实现

### 当前实现

系统已直接集成阿里云百炼API，无需额外配置：

```javascript
// 在 /api/ai-analysis/route.ts 中的实现
const aiResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${aiApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'Moonshot-Kimi-K2-Instruct',
    messages: [
      {
        role: 'system',
        content: '你是一位专业的时间管理和效率专家，擅长分析个人计划完成情况并提供实用的优化建议。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: false
  }),
});
```

### 其他AI服务集成

如需集成其他AI服务，可以修改 `/api/ai-analysis/route.ts` 文件：

- 百度文心一言
- 阿里通义千问  
- 腾讯混元
- 自建AI模型

## 测试

配置完成后，您可以通过以下方式测试：

1. 访问 `/dashboard/analytics` 页面
2. 点击"AI分析"按钮
3. 点击"开始分析"
4. 查看分析结果

## 故障排除

如果AI分析失败，请检查：

1. 环境变量是否正确配置
2. AI API服务是否正常运行
3. API Key是否有效
4. 网络连接是否正常
5. 查看服务器日志获取详细错误信息

## 安全建议

1. 妥善保管AI API Key
2. 限制API调用频率
3. 记录API调用日志
4. 定期轮换API Key
