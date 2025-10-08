'use client'

import { Plan } from '@/types/plan'
import { Badge, Typography } from 'antd'
import { Dayjs } from 'dayjs'

const { Text } = Typography

interface MonthCellProps {
  date: Dayjs
  plans: Plan[]
}

const MonthCell: React.FC<MonthCellProps> = ({ date, plans }) => {
  if (plans.length === 0) {
    return null
  }

  // 计算已完成计划数量
  const completedCount = plans.filter(plan => plan.status === 'COMPLETED').length
  // 计算完成率
  const completionRate = plans.length > 0 ? Math.round((completedCount / plans.length) * 100) : 0

  // 计算优先级分布
  const highPriority = plans.filter(plan => plan.priority === 'HIGH').length
  const mediumPriority = plans.filter(plan => plan.priority === 'MEDIUM').length
  const lowPriority = plans.filter(plan => plan.priority === 'LOW').length

  return (
    <div className="month-plans-summary" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px',
      width: '100%',
      height: '100%',
      minHeight: '190px',
      justifyContent: 'space-between',
      padding: '8px 4px',
      overflow: 'visible',
      boxSizing: 'border-box'
    }}>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Badge color="#1890ff" text={<Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>总计划: {plans.length}</Text>} />
      </div>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Badge color="#52c41a" text={<Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>已完成: {completedCount} ({completionRate}%)</Text>} />
      </div>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Badge color="#ff4d4f" text={<Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>高优先级: {highPriority}</Text>} />
      </div>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Badge color="#faad14" text={<Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>中优先级: {mediumPriority}</Text>} />
      </div>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Badge color="#52c41a" text={<Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>低优先级: {lowPriority}</Text>} />
      </div>
    </div>
  )
}

export default MonthCell
