'use client'

import { Badge, Typography } from 'antd'
import { Plan } from '@/types/plan'

const { Text } = Typography

interface PlanCellProps {
  plan: Plan
  onClick: (plan: Plan) => void
}

const PlanCell: React.FC<PlanCellProps> = ({ plan, onClick }) => {
  let badgeColor = ''
  switch (plan.priority) {
    case 'HIGH':
      badgeColor = '#ff4d4f'
      break
    case 'MEDIUM':
      badgeColor = '#faad14'
      break
    case 'LOW':
      badgeColor = '#52c41a'
      break
    default:
      badgeColor = '#1890ff'
  }
  
  return (
    <div 
      className="plan-item"
      onClick={(e) => {
        e.stopPropagation()
        onClick(plan)
      }}
    >
      <Badge 
        color={plan.status === 'COMPLETED' ? '#8c8c8c' : badgeColor} 
        text={
          <Text 
            ellipsis 
            style={{ 
              color: plan.status === 'COMPLETED' ? 'rgba(255, 255, 255, 0.45)' : '#fff',
              textDecoration: plan.status === 'COMPLETED' ? 'line-through' : 'none',
            }}
          >
            {plan.title}
          </Text>
        } 
      />
    </div>
  )
}

export default PlanCell
