// 共享的计划相关工具函数

import axios from 'axios'
import dayjs from 'dayjs'

// 导入统一的 Plan 类型
import { Plan } from '@/types/plan'

// 重新导出 Plan 类型
export type { Plan }

// 检查计划是否完成
export const isPlanCompleted = (plan: Plan) => plan.status === 'COMPLETED'

// 获取今天的计划
export const getTodayPlans = (plans: Plan[]) => {
  const today = dayjs().format('YYYY-MM-DD')
  return plans.filter(plan => {
    // 显示今天创建的计划（根据createdAt字段）
    return dayjs(plan.createdAt).format('YYYY-MM-DD') === today
  })
}

// 按优先级排序计划
export const sortPlansByPriority = (plans: Plan[]) => {
  return [...plans].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1
    return aPriority - bPriority
  })
}

// 获取计划列表
export const fetchPlans = async () => {
  try {
    const token = localStorage.getItem('token')
    console.log('🔍 正在获取计划列表...')
    const response = await axios.get('/api/plans', {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('📋 获取到的计划数据:', response.data)
    if (response.data.success) {
      const sortedPlans = sortPlansByPriority(response.data.data.plans)
      console.log('✅ 计划列表已更新，共', sortedPlans.length, '个计划')
      return sortedPlans
    }
    return []
  } catch (error) {
    console.error('❌ 获取计划失败:', error)
    return []
  }
}

// 切换计划完成状态
export const togglePlanComplete = async (planId: string, currentStatus: string) => {
  try {
    const token = localStorage.getItem('token')
    const newCompleted = currentStatus !== 'COMPLETED'
    console.log('🔄 切换计划状态:', planId, '从', currentStatus, '到', newCompleted ? 'COMPLETED' : 'PENDING')
    const response = await axios.patch(
      `/api/plans/${planId}`,
      { completed: newCompleted },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  } catch (error) {
    console.error('❌ 更新计划失败:', error)
    throw error
  }
}

// 添加计划
export const addPlan = async (title: string, priority: string = 'MEDIUM') => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(
      '/api/plans',
      { 
        title,
        priority,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    console.log('计划创建成功:', response.data)
    return response.data
  } catch (error) {
    console.error('创建计划失败:', error)
    throw error
  }
}

// 删除计划
export const deletePlan = async (planId: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`/api/plans/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    console.error('删除计划失败:', error)
    throw error
  }
}

// 获取优先级标签颜色
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return '#ff4d4f'
    case 'MEDIUM':
      return '#faad14'
    case 'LOW':
      return '#52c41a'
    default:
      return '#1890ff'
  }
}
