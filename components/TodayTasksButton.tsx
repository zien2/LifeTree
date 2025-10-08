'use client'

import React, { useState } from 'react'
import { Button, Badge } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { Plan, getTodayPlans } from '@/lib/planUtils'
import TodayTasksList from '@/components/plans/TodayTasksList'

interface TodayTasksButtonProps {
  plans: Plan[]
  onToggleStatus: (plan: Plan) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (plan: Plan) => void
}

const TodayTasksButton: React.FC<TodayTasksButtonProps> = ({
  plans,
  onToggleStatus,
  onDelete,
  onEdit
}) => {
  const [visible, setVisible] = useState(false)
  const todayPlans = getTodayPlans(plans)

  return (
    <>
      <Badge count={todayPlans.length} size="small" offset={[-2, 2]}>
        <Button
          icon={<CalendarOutlined />}
          onClick={() => setVisible(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          }}
        >
          今日计划
        </Button>
      </Badge>

      <TodayTasksList
        visible={visible}
        onClose={() => setVisible(false)}
        plans={plans}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </>
  )
}

export default TodayTasksButton
