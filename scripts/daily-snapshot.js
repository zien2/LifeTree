#!/usr/bin/env node

/**
 * 每日数据快照定时任务脚本
 * 用于每日凌晨自动创建用户数据快照，构建完整的数据链路供AI分析
 * 
 * 使用方法：
 * 1. 手动执行：node scripts/daily-snapshot.js
 * 2. 设置crontab：0 0 * * * cd /path/to/lifetree && node scripts/daily-snapshot.js
 * 3. 使用PM2：pm2 start scripts/daily-snapshot.js --cron "0 0 * * *" --name "daily-snapshot"
 */

const https = require('https')
const http = require('http')

// 配置
const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002',
  cronToken: process.env.CRON_SECRET_TOKEN || 'lifetree-cron-2024',
  timeout: 30000 // 30秒超时
}

/**
 * 发送HTTP请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.cronToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LifeTree-DailySnapshot/1.0'
      },
      timeout: config.timeout,
      ...options
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve({
            statusCode: res.statusCode,
            data: result
          })
        } catch (error) {
          reject(new Error(`响应解析失败: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('请求超时'))
    })

    req.end()
  })
}

/**
 * 执行每日快照任务
 */
async function executeDailySnapshot() {
  const startTime = new Date()
  console.log(`[${startTime.toISOString()}] 开始执行每日数据快照任务...`)

  try {
    const url = `${config.baseUrl}/api/cron/daily-snapshot`
    console.log(`请求URL: ${url}`)

    const response = await makeRequest(url)
    
    if (response.statusCode === 200 && response.data.success) {
      const { data } = response.data
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()
      
      console.log(`[${endTime.toISOString()}] 每日数据快照任务执行成功!`)
      console.log(`执行时间: ${duration}ms`)
      console.log(`处理用户数: ${data.totalUsers}`)
      console.log(`成功创建: ${data.successCount} 个快照`)
      console.log(`失败数量: ${data.errorCount}`)
      
      if (data.errors && data.errors.length > 0) {
        console.log('错误详情:')
        data.errors.forEach(error => console.log(`  - ${error}`))
      }
      
      console.log(`快照日期: ${data.date}`)
      
      // 退出码0表示成功
      process.exit(0)
    } else {
      throw new Error(`API返回错误: ${response.data.message || '未知错误'}`)
    }
    
  } catch (error) {
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    console.error(`[${endTime.toISOString()}] 每日数据快照任务执行失败!`)
    console.error(`执行时间: ${duration}ms`)
    console.error(`错误信息: ${error.message}`)
    
    // 退出码1表示失败
    process.exit(1)
  }
}

/**
 * 测试连接
 */
async function testConnection() {
  try {
    const url = `${config.baseUrl}/api/cron/daily-snapshot`
    const response = await makeRequest(url, { method: 'GET' })
    
    if (response.statusCode === 200) {
      console.log('✅ 连接测试成功')
      console.log('API响应:', response.data.message)
      return true
    } else {
      console.error('❌ 连接测试失败:', response.data.message)
      return false
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message)
    return false
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--test') || args.includes('-t')) {
    console.log('🧪 执行连接测试...')
    const success = await testConnection()
    process.exit(success ? 0 : 1)
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LifeTree 每日数据快照定时任务

使用方法:
  node scripts/daily-snapshot.js          执行快照任务
  node scripts/daily-snapshot.js --test   测试API连接
  node scripts/daily-snapshot.js --help   显示帮助信息

环境变量:
  NEXT_PUBLIC_BASE_URL    应用基础URL (默认: http://localhost:3002)
  CRON_SECRET_TOKEN       定时任务密钥 (默认: lifetree-cron-2024)

定时任务设置:
  # 每日凌晨0点执行
  0 0 * * * cd /path/to/lifetree && node scripts/daily-snapshot.js

  # 使用PM2管理
  pm2 start scripts/daily-snapshot.js --cron "0 0 * * *" --name "daily-snapshot"
    `)
    process.exit(0)
  } else {
    await executeDailySnapshot()
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  process.exit(1)
})

// 启动主程序
main().catch((error) => {
  console.error('主程序执行失败:', error.message)
  process.exit(1)
})
