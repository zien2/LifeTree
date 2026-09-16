const puppeteer = require('puppeteer')
const dayjs = require('dayjs')

async function takeDashboardTreeSnapshot() {
  let browser
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const authToken = process.env.TREE_SNAPSHOT_TOKEN
    if (!authToken) {
      throw new Error('TREE_SNAPSHOT_TOKEN is required')
    }

    console.log('开始截取主页生命树快照...')
    
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 })

    // 使用受限用户会话访问仪表盘；令牌只从环境变量读取。
    await page.setCookie({
      name: 'lifetree_token',
      value: authToken,
      url: baseUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: baseUrl.startsWith('https://'),
    })
    
    // 访问主页
    await page.goto(`${baseUrl}/dashboard`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // 等待页面完全加载
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 等待生命树Canvas加载完成 - 尝试多种选择器
    try {
      await page.waitForSelector('canvas', { timeout: 15000 })
    } catch (e) {
      console.log('未找到canvas，尝试查找其他元素...')
      // 如果没找到canvas，尝试查找生命树相关的div
      try {
        await page.waitForSelector('[class*="tree"], [class*="canvas"], [class*="life"]', { timeout: 10000 })
      } catch (e2) {
        console.log('未找到特定元素，继续截取整个页面')
      }
    }
    
    // 等待一下让动画完成
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 截取生命树区域
    let screenshot
    const canvas = await page.$('canvas')
    
    if (canvas) {
      // 如果找到Canvas，截取Canvas
      screenshot = await canvas.screenshot({ type: 'png' })
      console.log('成功截取Canvas区域')
    } else {
      // 如果没找到Canvas，截取整个页面
      console.log('未找到Canvas，截取整个页面')
      screenshot = await page.screenshot({ 
        type: 'png',
        fullPage: false, // 只截取视口
        clip: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080
        }
      })
    }
    
    // 通过认证 API 保存到服务器的私有快照目录。
    const today = dayjs()
    const base64Data = screenshot.toString('base64')
    const dataUrl = `data:image/png;base64,${base64Data}`

    const response = await fetch(`${baseUrl}/api/dashboard-tree-snapshot`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: dataUrl,
        date: today.format('YYYY-MM-DD')
      })
    })

    if (!response.ok) {
      throw new Error(`Snapshot API returned HTTP ${response.status}`)
    }

    console.log('主页生命树快照已通过认证 API 保存')
    
  } catch (error) {
    console.error('截取主页生命树快照失败:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  takeDashboardTreeSnapshot()
    .then(() => {
      console.log('脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

module.exports = { takeDashboardTreeSnapshot }
