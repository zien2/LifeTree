# 生命树快照功能使用指南

## 功能概述

生命树快照功能可以自动保存主页的生命树状态，并在专门的页面以日历形式展示历史快照。

## 主要特性

### 1. 自动快照保存
- **时间**: 每天凌晨00:05自动执行
- **内容**: 截取主页的生命树Canvas区域
- **存储**: 按年/月/日组织存储在 `public/tree-snapshots/` 目录
- **格式**: PNG图片文件

### 2. 日历视图展示
- **位置**: `/dashboard/tree` 页面
- **布局**: 左侧日历，右侧快照预览
- **交互**: 点击日历中的日期查看对应快照
- **标识**: 有快照的日期会显示绿色圆点

## 文件结构

```
public/tree-snapshots/
├── 2025/
│   └── 10/
│       ├── 20251006.png
│       ├── 20251007.png
│       └── 20251008.png
```

## 技术实现

### 自动截图脚本
- **文件**: `scripts/dashboard-tree-snapshot.js`
- **依赖**: Puppeteer
- **功能**: 访问主页，等待Canvas加载，截取生命树区域

### API接口
- **保存**: `POST /api/dashboard-tree-snapshot`
- **获取**: `GET /api/tree-snapshots`

### 定时任务
- **命令**: `npm run cron:tree-snapshot`
- **设置**: `node scripts/setup-cron.js`

## 使用方法

### 1. 手动测试截图
```bash
npm run cron:tree-snapshot
```

### 2. 设置自动定时任务
```bash
node scripts/setup-cron.js
```

### 3. 查看快照
1. 访问 `/dashboard/tree` 页面
2. 在左侧日历中点击有绿色圆点的日期
3. 右侧会显示对应日期的生命树快照

## 注意事项

1. **服务器运行**: 自动截图需要服务器在运行状态
2. **Canvas加载**: 脚本会等待Canvas完全加载后再截图
3. **文件大小**: 每个快照文件约500KB左右
4. **存储空间**: 建议定期清理旧快照以节省空间

## 故障排除

### 截图失败
- 检查服务器是否运行在 `http://localhost:3000`
- 确认主页的生命树Canvas正常加载
- 查看日志文件 `logs/tree-snapshot.log`

### 快照不显示
- 检查 `public/tree-snapshots/` 目录权限
- 确认API接口正常工作
- 刷新页面重新加载快照列表

## 自定义配置

### 修改截图时间
编辑 `scripts/setup-cron.js` 中的cron表达式：
```javascript
const cronCommand = `5 0 * * * cd ${process.cwd()} && node ${scriptPath} >> logs/tree-snapshot.log 2>&1`
```

### 修改截图区域
编辑 `scripts/dashboard-tree-snapshot.js` 中的截图逻辑：
```javascript
// 截取整个页面
screenshot = await page.screenshot({ 
  type: 'png',
  fullPage: false,
  clip: {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  }
})
```
