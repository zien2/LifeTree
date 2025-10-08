'use client'

import { Plan } from '@/types/plan'
import { Typography } from 'antd'
import { Dayjs } from 'dayjs'
import PlanCell from './PlanCell'

const { Text } = Typography

interface DateCellProps {
  date: Dayjs
  plans: Plan[]
  showPlanDetail: (plan: Plan) => void
  showTodayTasks?: () => void
}

const DateCell: React.FC<DateCellProps> = ({ date, plans, showPlanDetail, showTodayTasks }) => {
  // 小型列表：显示当天计划（最多 4 条）
  const rows = plans.slice(0, 4)
  return (
    <div className="plans-cell">
      {rows.map(plan => (
        <div
          key={plan.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 6px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            cursor: 'default'
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background:
                plan.priority === 'HIGH' ? '#ff4d4f' : plan.priority === 'MEDIUM' ? '#faad14' : '#52c41a',
              opacity: plan.status === 'COMPLETED' ? 0.4 : 1,
              flexShrink: 0
            }}
          />
          <Text
            ellipsis
            style={{
              color: plan.status === 'COMPLETED' ? 'rgba(255,255,255,0.45)' : '#fff',
              textDecoration: plan.status === 'COMPLETED' ? 'line-through' : 'none',
              fontSize: 12,
              lineHeight: '18px',
              width: '100%'
            }}
          >
            {plan.title}
          </Text>
        </div>
      ))}

      {plans.length > rows.length && (
        <div className="more-plans">
          <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
            +{plans.length - rows.length}
          </Text>
        </div>
      )}
    </div>
  )
}

export default DateCell
