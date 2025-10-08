'use client'

import { Plan } from '@/types/plan'
import { DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd'
import { Dayjs } from 'dayjs'
import { FormInstance } from 'antd/es/form'

interface PlanFormProps {
  visible: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  form: FormInstance
  editingPlan: Plan | null
}

const PlanForm: React.FC<PlanFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingPlan
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🗒️</span>
          <span>{editingPlan ? '编辑计划' : '新增计划'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editingPlan ? '保存' : '创建'}
      cancelText="取消"
      maskClosable={false}
      style={{ top: 20 }}
      styles={{
        header: { background: '#121212', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.12)' },
        content: { background: '#0f0f0f', borderRadius: 16 },
        footer: { background: '#121212', borderTop: '1px solid rgba(255,255,255,0.12)' }
      }}
      okButtonProps={{
        style: {
          background: '#1890ff',
          borderColor: 'transparent',
          fontWeight: 600,
          borderRadius: 10,
          padding: '6px 16px'
        }
      }}
      cancelButtonProps={{
        style: {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          fontWeight: 600,
          borderRadius: 10,
          padding: '6px 16px'
        }
      }}
      zIndex={1300}
    >
      <Form
        form={form}
        layout="vertical"
        name="plan_form"
        initialValues={{ priority: 'MEDIUM' }}
        style={{
          marginTop: 8
        }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入计划标题' }]}
        >
          <Input 
            placeholder="请输入计划标题" 
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              height: 40,
              borderRadius: 10
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea 
            placeholder="请输入计划描述（可选）" 
            rows={4}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: 10
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select
            dropdownStyle={{ background: '#1f1f1f' }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: 10
            }}
          >
            <Select.Option value="HIGH">高</Select.Option>
            <Select.Option value="MEDIUM">中</Select.Option>
            <Select.Option value="LOW">低</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="startDate"
          label="开始日期"
        >
          <DatePicker 
            style={{ 
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10
            }} 
            placeholder="请选择开始日期（可选）"
          />
        </Form.Item>
        
        <Form.Item
          name="dueDate"
          label="截止日期"
        >
          <DatePicker 
            style={{ 
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10
            }} 
            placeholder="请选择截止日期（可选）"
          />
        </Form.Item>
        
        <Form.Item
          name="dueTime"
          label="截止时间"
        >
          <TimePicker 
            style={{ 
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10
            }} 
            placeholder="请选择截止时间（可选）"
            format="HH:mm"
          />
        </Form.Item>
      </Form>
      <style jsx global>{`
        /* 仅在模态框内强化文字与占位符可读性 */
        .ant-modal-content .ant-form-item-label > label { color: #ffffff; }
        .ant-modal-content .ant-form-item-required::before { color: #ff4d4f !important; }
        .ant-modal-content .ant-input, 
        .ant-modal-content .ant-input-textarea { color: #ffffff; }
        .ant-modal-content .ant-input::placeholder,
        .ant-modal-content textarea.ant-input::placeholder { color: rgba(255,255,255,0.65); }
        /* Select 选框与内容 */
        .ant-modal-content .ant-select .ant-select-selector { 
          background: rgba(255,255,255,0.08) !important; 
          border: 1px solid rgba(255,255,255,0.15) !important; 
          border-radius: 10px !important;
          color: #ffffff !important;
        }
        .ant-modal-content .ant-select-focused .ant-select-selector,
        .ant-modal-content .ant-select:hover .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24,144,255,0.2) !important;
        }
        .ant-modal-content .ant-select-selection-item, 
        .ant-modal-content .ant-select-selection-placeholder { color: #ffffff !important; }
        .ant-modal-content .ant-select-arrow { color: #ffffff; }
        .ant-modal-content .ant-picker-input > input { color: #ffffff !important; }
        .ant-modal-content .ant-picker-input > input::placeholder { color: rgba(255,255,255,0.65) !important; }
        .ant-modal-content .ant-picker-suffix { color: #ffffff; }
        .ant-modal-content .ant-modal-title { color: #ffffff; }
      `}</style>
    </Modal>
  )
}

export default PlanForm
