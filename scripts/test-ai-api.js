// 测试阿里云百炼AI API
// 使用Node.js内置的fetch (Node 18+)

async function testAiApi() {
  try {
    console.log('🤖 测试阿里云百炼AI API...');
    
    const aiApiKey = process.env.AI_API_KEY || 'sk-c3d3d8211d2e4a70a4132631ec644e42';
    const aiApiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    
    const response = await fetch(aiApiUrl, {
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
            content: '请简单介绍一下时间管理的重要性，控制在100字以内。'
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API调用失败:', errorData);
      return;
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content;

    if (analysis) {
      console.log('✅ AI API测试成功！');
      console.log('📝 AI回复:', analysis);
    } else {
      console.log('❌ AI回复为空');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAiApi();
