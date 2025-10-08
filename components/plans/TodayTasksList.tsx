'use client'

import React from 'react'
import dayjs from 'dayjs'
import { Badge, Button, Drawer, Empty, Space, Typography } from 'antd'
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { Plan } from '@/types/plan'
import { isPlanCompleted, getPriorityColor, sortPlansByPriority, getTodayPlans } from '@/lib/planUtils'

const { Text, Title } = Typography

interface TodayTasksListProps {
  visible: boolean
  onClose: () => void
  plans: Plan[]
  onToggleStatus: (plan: Plan) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (plan: Plan) => void
  onAdd?: (date?: any) => void
  maskClosable?: boolean
}

const TodayTasksList: React.FC<TodayTasksListProps> = ({
  visible,
  onClose,
  plans,
  onToggleStatus,
  onDelete,
  onEdit,
  onAdd,
  maskClosable
}) => {
  // 过滤今天的计划
  const todayPlans = getTodayPlans(plans)

  // 按优先级排序
  const sortedPlans = sortPlansByPriority(todayPlans)

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📅</span>
          <span>今日计划</span>
          <Badge 
            count={todayPlans.length} 
            style={{ 
              backgroundColor: todayPlans.length > 0 ? '#1890ff' : '#52c41a',
              marginLeft: '8px'
            }} 
          />
        </div>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
      maskClosable={maskClosable}
      zIndex={1200}
      styles={{
        header: { 
          background: '#121212', 
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        body: { 
          background: '#000000', 
          padding: '16px'
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.55)'
        },
        footer: {
          background: '#121212',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            type="primary"
            onClick={() => onAdd && onAdd(dayjs())}
            style={{
              background: '#1890ff',
              borderColor: 'transparent',
              fontWeight: 600,
              borderRadius: 10,
              padding: '6px 16px'
            }}
          >
            新增计划
          </Button>
          <Button onClick={onClose} style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: 10,
            padding: '6px 16px'
          }}>
            关闭
          </Button>
        </div>
      }
    >
      {sortedPlans.length === 0 ? (
        <Empty 
          description={<span style={{ color: '#999' }}>今天暂无计划</span>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '60px 0' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Title level={5} style={{ color: '#ffffff', marginTop: '0' }}>
            {dayjs().format('YYYY年MM月DD日')} · 共 {sortedPlans.length} 项计划
          </Title>
          
          {sortedPlans.map(plan => (
            <div
              key={plan.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                gap: '12px',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: `1px solid ${isPlanCompleted(plan) ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`
              }}
              onClick={() => onEdit(plan)}
            >
              {/* 完成状态圆圈 */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStatus(plan)
                }}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${isPlanCompleted(plan) ? '#52c41a' : getPriorityColor(plan.priority || 'MEDIUM')}`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  background: isPlanCompleted(plan) ? 'rgba(82, 196, 26, 0.2)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {isPlanCompleted(plan) && (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                )}
              </div>

              {/* 计划内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <Text
                    ellipsis
                    style={{
                      fontSize: '15px',
                      color: isPlanCompleted(plan) ? 'rgba(255, 255, 255, 0.45)' : '#ffffff',
                      textDecoration: isPlanCompleted(plan) ? 'line-through' : 'none',
                      fontWeight: isPlanCompleted(plan) ? 400 : 500,
                      transition: 'all 0.3s',
                    }}
                  >
                    {plan.title}
                  </Text>
                  
                  {/* 优先级标识 */}
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: getPriorityColor(plan.priority || 'MEDIUM'),
                      opacity: isPlanCompleted(plan) ? 0.4 : 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0,
                    }}
                  />
                </div>
                
                {plan.description && (
                  <Text
                    ellipsis
                    style={{
                      fontSize: '13px',
                      color: isPlanCompleted(plan) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.65)',
                      transition: 'all 0.3s',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    {plan.description}
                  </Text>
                )}
              </div>

              {/* 删除按钮 */}
              <DeleteOutlined
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(plan.id)
                }}
                style={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ff4d4f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}

export default TodayTasksList