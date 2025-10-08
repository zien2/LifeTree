'use client'

import React from 'react'
import { Modal, List, Tag, Button, Space, Typography, Empty } from 'antd'
import { CheckOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { Plan } from '@/types/plan'

const { Title, Text } = Typography

interface DateDetailModalProps {
  visible: boolean
  date: Dayjs
  plans: Plan[]
  onClose: () => void
  onToggleStatus: (plan: Plan) => void
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
  onAdd: (date: Dayjs) => void
  onRefresh?: () => void // 添加刷新回调
}

const DateDetailModal: React.FC<DateDetailModalProps> = ({
  visible,
  date,
  plans,
  onClose,
  onToggleStatus,
  onEdit,
  onDelete,
  onAdd,
  onRefresh
}) => {
  // 按优先级排序计划
  const sortedPlans = [...plans].sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
  })

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'red'
      case 'MEDIUM': return 'orange'
      case 'LOW': return 'green'
      default: return 'default'
    }
  }

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '高'
      case 'MEDIUM': return '中'
      case 'LOW': return '低'
      default: return priority
    }
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0, color: '#ffffff', flex: 1 }}>
            {date.format('YYYY年MM月DD日')} 的计划
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onAdd(date)}
            size="small"
            style={{
              background: 'rgba(24, 144, 255, 0.8)',
              borderColor: 'rgba(24, 144, 255, 0.8)',
              borderRadius: '6px',
              marginRight: '8px'
            }}
          >
            新增计划
          </Button>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{
        top: 20
      }}
      styles={{
        header: {
          background: '#000000',
          borderBottom: '1px solid #333333',
          padding: '16px 24px'
        },
        body: {
          background: '#000000',
          color: '#ffffff',
          maxHeight: '65vh',
          overflowY: 'auto',
          padding: '16px 24px'
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.8)'
        }
      }}
      closeIcon={
        <span style={{ 
          color: '#ffffff', 
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s'
        }}>
          ×
        </span>
      }
    >
      {sortedPlans.length === 0 ? (
        <Empty
          description="这一天还没有计划"
          style={{ color: '#ffffff' }}
        />
      ) : (
        <List
          dataSource={sortedPlans}
          renderItem={(plan) => (
            <List.Item
              key={plan.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                margin: '12px 0',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              actions={[
                <Button
                  key="toggle"
                  type={plan.status === 'COMPLETED' ? 'default' : 'primary'}
                  icon={<CheckOutlined />}
                  onClick={async () => {
                    onToggleStatus(plan)
                    // 状态切换完成后刷新数据
                    setTimeout(() => {
                      onRefresh?.()
                    }, 300)
                  }}
                  size="small"
                  style={{
                    background: plan.status === 'COMPLETED' ? 'rgba(82, 196, 26, 0.8)' : 'rgba(24, 144, 255, 0.8)',
                    borderColor: plan.status === 'COMPLETED' ? 'rgba(82, 196, 26, 0.8)' : 'rgba(24, 144, 255, 0.8)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  {plan.status === 'COMPLETED' ? '已完成' : '完成'}
                </Button>,
                <Button
                  key="edit"
                  type="default"
                  icon={<EditOutlined />}
                  onClick={async () => {
                    onEdit(plan)
                    // 编辑完成后刷新数据
                    setTimeout(() => {
                      onRefresh?.()
                    }, 300)
                  }}
                  size="small"
                  style={{
                    background: 'rgba(250, 173, 20, 0.8)',
                    borderColor: 'rgba(250, 173, 20, 0.8)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  编辑
                </Button>,
                <Button
                  key="delete"
                  type="default"
                  icon={<DeleteOutlined />}
                  onClick={async () => {
                    onDelete(plan.id)
                    // 删除完成后刷新数据
                    setTimeout(() => {
                      onRefresh?.()
                    }, 300)
                  }}
                  size="small"
                  style={{
                    background: 'rgba(255, 77, 79, 0.8)',
                    borderColor: 'rgba(255, 77, 79, 0.8)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Text
                      style={{
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '600',
                        textDecoration: plan.status === 'COMPLETED' ? 'line-through' : 'none',
                        opacity: plan.status === 'COMPLETED' ? 0.5 : 1,
                        flex: 1
                      }}
                    >
                      {plan.title}
                    </Text>
                    <Tag 
                      color={getPriorityColor(plan.priority)}
                      style={{
                        borderRadius: '6px',
                        fontWeight: '500',
                        fontSize: '12px'
                      }}
                    >
                      {getPriorityText(plan.priority)}
                    </Tag>
                    {plan.status === 'COMPLETED' && (
                      <Tag 
                        color="green"
                        style={{
                          borderRadius: '6px',
                          fontWeight: '500',
                          fontSize: '12px'
                        }}
                      >
                        已完成
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    {plan.description && (
                      <Text 
                        style={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          display: 'block', 
                          marginBottom: '12px',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {plan.description}
                      </Text>
                    )}
                    <Space size="middle">
                      <Text style={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        fontSize: '13px',
                        fontWeight: '400'
                      }}>
                        创建: {dayjs(plan.createdAt).format('HH:mm')}
                      </Text>
                      {plan.completedAt && (
                        <Text style={{ 
                          color: 'rgba(255, 255, 255, 0.5)', 
                          fontSize: '13px',
                          fontWeight: '400'
                        }}>
                          完成: {dayjs(plan.completedAt).format('HH:mm')}
                        </Text>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  )
}

export default DateDetailModal
