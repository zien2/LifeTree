const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const dayjs = require('dayjs')

async function takeDashboardTreeSnapshot() {
  let browser
  try {
    console.log('开始截取主页生命树快照...')
    
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 })
    
    // 访问主页
    await page.goto('http://localhost:3000/dashboard', {
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
    
    // 保存截图
    const today = dayjs()
    const year = today.format('YYYY')
    const month = today.format('MM')
    const filename = today.format('YYYYMMDD') + '.png'
    
    const yearDir = path.join(process.cwd(), 'public', 'tree-snapshots', year)
    const monthDir = path.join(yearDir, month)
    const filePath = path.join(monthDir, filename)
    
    await fs.mkdir(monthDir, { recursive: true })
    await fs.writeFile(filePath, screenshot)
    
    console.log(`主页生命树快照已保存: ${filePath}`)
    
    // 同时调用API保存快照信息
    const base64Data = screenshot.toString('base64')
    const dataUrl = `data:image/png;base64,${base64Data}`
    
    try {
      const response = await fetch('http://localhost:3000/api/dashboard-tree-snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: dataUrl,
          date: today.format('YYYY-MM-DD')
        })
      })
      
      if (response.ok) {
        console.log('快照信息已保存到API')
      } else {
        console.log('API保存失败，但文件已保存')
      }
    } catch (apiError) {
      console.log('API调用失败，但文件已保存:', apiError.message)
    }
    
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
