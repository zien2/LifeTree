'use client'

import { Plan } from '@/types/plan'
import { Badge, Button, Modal, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

interface PlanDetailProps {
  visible: boolean
  onCancel: () => void
  plan: Plan | null
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => Promise<void>
  onToggleStatus: (plan: Plan) => Promise<void>
}

const PlanDetail: React.FC<PlanDetailProps> = ({
  visible,
  onCancel,
  plan,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  if (!plan) return null
  
  let priorityText = ''
  let priorityColor = ''
  
  switch (plan.priority) {
    case 'HIGH':
      priorityText = '高'
      priorityColor = '#ff4d4f'
      break
    case 'MEDIUM':
      priorityText = '中'
      priorityColor = '#faad14'
      break
    case 'LOW':
      priorityText = '低'
      priorityColor = '#52c41a'
      break
    default:
      priorityText = '中'
      priorityColor = '#faad14'
  }
  
  const statusText = plan.status === 'COMPLETED' ? '已完成' : '进行中'
  const statusColor = plan.status === 'COMPLETED' ? '#52c41a' : '#1890ff'
  
  return (
    <Modal
      title="计划详情"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button 
          key="delete" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => plan && onDelete(plan.id)}
        >
          删除
        </Button>,
        <Button 
          key="toggle" 
          type={plan.status === 'COMPLETED' ? 'default' : 'primary'}
          onClick={() => plan && onToggleStatus(plan)}
        >
          {plan.status === 'COMPLETED' ? '标记为未完成' : '标记为已完成'}
        </Button>,
        <Button 
          key="edit" 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => plan && onEdit(plan)}
        >
          编辑
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ margin: '0 0 16px 0' }}>{plan.title}</Title>
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>优先级：</Text>
            <Badge color={priorityColor} text={priorityText} />
          </div>
          
          <div>
            <Text strong>状态：</Text>
            <Badge color={statusColor} text={statusText} />
          </div>
          
          {plan.dueDate && (
            <div>
              <Text strong>截止日期：</Text>
              <Text>{dayjs(plan.dueDate).format('YYYY年MM月DD日 HH:mm')}</Text>
            </div>
          )}
          
          {plan.completedAt && (
            <div>
              <Text strong>完成时间：</Text>
              <Text>{dayjs(plan.completedAt).format('YYYY年MM月DD日 HH:mm')}</Text>
            </div>
          )}
          
          {plan.description && (
            <div>
              <Text strong>描述：</Text>
              <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-line' }}>
                {plan.description}
              </Paragraph>
            </div>
          )}
        </Space>
      </div>
    </Modal>
  )
}

export default PlanDetail
