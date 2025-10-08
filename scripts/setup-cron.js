const { exec } = require('child_process')
const path = require('path')

// 设置cron任务，每天凌晨00:05自动保存主页生命树快照
function setupCronJob() {
  const scriptPath = path.join(__dirname, 'dashboard-tree-snapshot.js')
  const cronCommand = `5 0 * * * cd ${process.cwd()} && node ${scriptPath} >> logs/tree-snapshot.log 2>&1`
  
  // 检查是否已经存在相同的cron任务
  exec('crontab -l', (error, stdout) => {
    if (error && !error.message.includes('no crontab')) {
      console.error('检查crontab失败:', error)
      return
    }
    
    const existingCron = stdout || ''
    if (existingCron.includes('dashboard-tree-snapshot.js')) {
      console.log('生命树快照cron任务已存在')
      return
    }
    
    // 添加新的cron任务
    const newCron = existingCron + '\n' + cronCommand + '\n'
    
    exec(`echo "${newCron}" | crontab -`, (error) => {
      if (error) {
        console.error('设置cron任务失败:', error)
      } else {
        console.log('生命树快照cron任务设置成功！')
        console.log('任务将在每天凌晨00:05自动执行')
        console.log('日志文件: logs/tree-snapshot.log')
      }
    })
  })
}

// 如果直接运行此脚本
if (require.main === module) {
  setupCronJob()
}

module.exports = { setupCronJob }
