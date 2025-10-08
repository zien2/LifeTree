#!/usr/bin/env node

/**
 * AI分析性能测试脚本
 * 用于测试AI分析API的响应时间和优化效果
 */

const axios = require('axios')

// 测试数据
const testData = {
  totalPlans: 15,
  completedPlans: 10,
  pendingPlans: 5,
  highPriorityPlans: 3,
  mediumPriorityPlans: 8,
  lowPriorityPlans: 4,
  completionRate: "66.7",
  recentPlans: [
    { title: "完成项目报告", status: "COMPLETED", priority: "HIGH", createdAt: "2025-10-08T10:00:00Z" },
    { title: "安排团队会议", status: "PENDING", priority: "MEDIUM", createdAt: "2025-10-08T11:00:00Z" },
    { title: "学习新技术", status: "PENDING", priority: "LOW", createdAt: "2025-10-08T12:00:00Z" },
    { title: "整理文档", status: "COMPLETED", priority: "MEDIUM", createdAt: "2025-10-08T13:00:00Z" },
    { title: "代码审查", status: "PENDING", priority: "HIGH", createdAt: "2025-10-08T14:00:00Z" }
  ]
}

async function testAiPerformance() {
  console.log('🚀 开始AI分析性能测试...\n')
  
  const token = process.env.TEST_TOKEN || 'YOUR_AUTH_TOKEN_HERE'
  if (token === 'YOUR_AUTH_TOKEN_HERE') {
    console.warn('⚠️  请设置 TEST_TOKEN 环境变量或修改脚本中的token')
    console.warn('   例如: TEST_TOKEN=your_token node scripts/test-ai-performance.js')
    return
  }

  const testCount = 3
  const results = []

  for (let i = 1; i <= testCount; i++) {
    console.log(`📊 第 ${i} 次测试...`)
    
    const startTime = Date.now()
    
    try {
      const response = await axios.post('http://localhost:3000/api/ai-analysis', {
        data: testData
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35秒超时
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (response.data.success) {
        console.log(`✅ 成功 - 耗时: ${duration}ms`)
        console.log(`📝 响应长度: ${response.data.analysis.length} 字符`)
        results.push({ success: true, duration, length: response.data.analysis.length })
      } else {
        console.log(`❌ 失败 - ${response.data.message}`)
        results.push({ success: false, duration, error: response.data.message })
      }
      
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (error.code === 'ECONNABORTED') {
        console.log(`⏰ 超时 - 耗时: ${duration}ms`)
        results.push({ success: false, duration, error: 'timeout' })
      } else {
        console.log(`❌ 错误 - ${error.message}`)
        results.push({ success: false, duration, error: error.message })
      }
    }
    
    console.log('') // 空行分隔
    
    // 等待1秒再进行下一次测试
    if (i < testCount) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // 统计结果
  console.log('📈 性能测试结果统计:')
  console.log('=' * 50)
  
  const successfulTests = results.filter(r => r.success)
  const failedTests = results.filter(r => !r.success)
  
  console.log(`总测试次数: ${testCount}`)
  console.log(`成功次数: ${successfulTests.length}`)
  console.log(`失败次数: ${failedTests.length}`)
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length
    const minDuration = Math.min(...successfulTests.map(r => r.duration))
    const maxDuration = Math.max(...successfulTests.map(r => r.duration))
    
    console.log(`\n⏱️  响应时间统计:`)
    console.log(`平均响应时间: ${avgDuration.toFixed(0)}ms`)
    console.log(`最快响应时间: ${minDuration}ms`)
    console.log(`最慢响应时间: ${maxDuration}ms`)
    
    const avgLength = successfulTests.reduce((sum, r) => sum + r.length, 0) / successfulTests.length
    console.log(`\n📝 响应内容统计:`)
    console.log(`平均响应长度: ${avgLength.toFixed(0)} 字符`)
  }
  
  if (failedTests.length > 0) {
    console.log(`\n❌ 失败原因:`)
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.error}`)
    })
  }
  
  console.log('\n🎯 优化建议:')
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length
    if (avgDuration > 15000) {
      console.log('- 响应时间仍然较慢，建议进一步优化提示词长度')
      console.log('- 考虑使用更快的AI模型或调整参数')
    } else if (avgDuration > 10000) {
      console.log('- 响应时间中等，可以接受')
    } else {
      console.log('- 响应时间良好！')
    }
  }
}

// 运行测试
testAiPerformance().catch(console.error)
