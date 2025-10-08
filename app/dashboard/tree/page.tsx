'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Typography, Space, Statistic, Row, Col, message, Modal, Form, Input, Select, DatePicker, Button, Image, Calendar, Badge } from 'antd'
import { PlusOutlined, FilterOutlined } from '@ant-design/icons'
import { Plan } from '@/types/plan'
import { getTodayPlans, sortPlansByPriority, fetchPlans as fetchPlansUtil } from '@/lib/planUtils'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

export default function TreePage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [form] = Form.useForm()
  const [snapshots, setSnapshots] = useState<Array<{ url: string; date: string; filename: string }>>([])
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<{ url: string; date: string; filename: string } | null>(null)

  // 获取计划数据
  const fetchPlans = useCallback(async () => {
    try {
      const result = await fetchPlansUtil()
      const safeArray = Array.isArray(result) ? result : []
      const sortedPlans = sortPlansByPriority(safeArray)
      setPlans(sortedPlans)
      setFilteredPlans(sortedPlans)
    } catch (error) {
      console.error('获取计划失败:', error)
      message.error('获取计划失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 切换计划状态
  const handlePlanToggle = useCallback(async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) return

      const newStatus = plan.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        message.success(newStatus === 'COMPLETED' ? '计划已完成！' : '计划已恢复进行中')
        fetchPlans()
      } else {
        message.error('更新计划状态失败')
      }
    } catch (error) {
      console.error('更新计划状态失败:', error)
      message.error('更新计划状态失败')
    }
  }, [plans, fetchPlans])

  // 编辑计划
  const handlePlanEdit = useCallback((plan: Plan) => {
    setEditingPlan(plan)
    form.setFieldsValue({
      title: plan.title,
      description: plan.description,
      priority: plan.priority,
      dueDate: plan.dueDate ? dayjs(plan.dueDate) : null,
    })
    setIsEditModalVisible(true)
  }, [form])

  // 删除计划
  const handlePlanDelete = useCallback(async (planId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        message.success('计划已删除')
        fetchPlans()
      } else {
        message.error('删除计划失败')
      }
    } catch (error) {
      console.error('删除计划失败:', error)
      message.error('删除计划失败')
    }
  }, [fetchPlans])

  // 添加新计划
  const handleAddPlan = useCallback(async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        }),
      })

      if (response.ok) {
        message.success('计划添加成功！')
        setIsAddModalVisible(false)
        form.resetFields()
        fetchPlans()
      } else {
        message.error('添加计划失败')
      }
    } catch (error) {
      console.error('添加计划失败:', error)
      message.error('添加计划失败')
    }
  }, [form, fetchPlans])

  // 更新计划
  const handleUpdatePlan = useCallback(async (values: any) => {
    if (!editingPlan) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/plans/${editingPlan.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        }),
      })

      if (response.ok) {
        message.success('计划更新成功！')
        setIsEditModalVisible(false)
        setEditingPlan(null)
        form.resetFields()
        fetchPlans()
      } else {
        message.error('更新计划失败')
      }
    } catch (error) {
      console.error('更新计划失败:', error)
      message.error('更新计划失败')
    }
  }, [editingPlan, form, fetchPlans])

  // 计算统计信息
  const stats = {
    total: plans.length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
    inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length,
    overdue: plans.filter(p => p.dueDate && dayjs(p.dueDate).isBefore(dayjs(), 'day') && p.status !== 'COMPLETED').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // 获取快照列表
  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch('/api/tree-snapshots')
      if (res.ok) {
        const data = await res.json()
        setSnapshots(data)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

  // 获取指定日期的快照
  const getSnapshotForDate = useCallback((date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    return snapshots.find(s => s.date === dateStr)
  }, [snapshots])

  // 日历单元格渲染
  const dateCellRender = useCallback((date: dayjs.Dayjs) => {
    const snapshot = getSnapshotForDate(date)
    if (snapshot) {
      return (
        <div style={{ textAlign: 'center', padding: '4px' }}>
          <Badge 
            dot 
            color="#52c41a" 
            style={{ marginBottom: '4px' }}
          />
          <div style={{ fontSize: '12px', color: '#52c41a' }}>有快照</div>
        </div>
      )
    }
    return null
  }, [getSnapshotForDate])

  // 处理日期选择
  const handleDateSelect = useCallback((date: dayjs.Dayjs) => {
    setSelectedDate(date)
    const snapshot = getSnapshotForDate(date)
    setSelectedSnapshot(snapshot || null)
  }, [getSnapshotForDate])

  return (
    <div style={{ padding: '24px', background: '#000', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          🌳 生命树
        </Title>
        <Text style={{ color: '#999' }}>
          每个计划都是一片叶子，完成计划让生命树更加茂盛
        </Text>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Statistic
              title={<Text style={{ color: '#fff' }}>总计划数</Text>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Statistic
              title={<Text style={{ color: '#fff' }}>已完成</Text>}
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Statistic
              title={<Text style={{ color: '#fff' }}>完成率</Text>}
              value={completionRate}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Statistic
              title={<Text style={{ color: '#fff' }}>进行中</Text>}
              value={stats.inProgress}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 日历视图 */}
      <Row gutter={24}>
        <Col span={16}>
          <Card 
            style={{ 
              background: '#1a1a1a', 
              border: '1px solid #333',
              height: 'calc(100vh - 200px)',
              minHeight: '600px'
            }}
            bodyStyle={{ padding: '20px', height: '100%' }}
          >
            <Title level={4} style={{ color: '#fff', marginBottom: '20px' }}>
              生命树快照日历
            </Title>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={handleDateSelect}
              style={{ 
                background: '#1a1a1a',
                color: '#fff'
              }}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            style={{ 
              background: '#1a1a1a', 
              border: '1px solid #333',
              height: 'calc(100vh - 200px)',
              minHeight: '600px'
            }}
            bodyStyle={{ padding: '20px', height: '100%' }}
          >
            <Title level={4} style={{ color: '#fff', marginBottom: '20px' }}>
              {selectedDate ? `${selectedDate.format('YYYY年MM月DD日')} 快照` : '选择日期查看快照'}
            </Title>
            
            {selectedSnapshot ? (
              <div>
                <Image 
                  src={selectedSnapshot.url} 
                  alt={selectedSnapshot.filename}
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}
                />
                <div style={{ marginTop: '16px' }}>
                  <Text style={{ color: '#999' }}>
                    文件名: {selectedSnapshot.filename}
                  </Text>
                </div>
              </div>
            ) : selectedDate ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '200px',
                color: '#666'
              }}>
                <Text>该日期暂无快照</Text>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '200px',
                color: '#666'
              }}>
                <Text>请从左侧日历选择日期</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 添加计划模态框 */}
      <Modal
        title="添加新计划"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPlan}
          style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}
        >
          <Form.Item
            name="title"
            label={<Text style={{ color: '#fff' }}>计划标题</Text>}
            rules={[{ required: true, message: '请输入计划标题' }]}
          >
            <Input 
              placeholder="请输入计划标题"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text style={{ color: '#fff' }}>计划描述</Text>}
          >
            <Input.TextArea 
              placeholder="请输入计划描述"
              rows={3}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={<Text style={{ color: '#fff' }}>优先级</Text>}
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select 
              placeholder="请选择优先级"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                borderRadius: '6px'
              }}
            >
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label={<Text style={{ color: '#fff' }}>截止日期</Text>}
          >
            <DatePicker 
              showTime
              placeholder="选择截止日期"
              style={{ 
                width: '100%',
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ background: '#1890ff', borderColor: '#1890ff' }}
              >
                添加计划
              </Button>
              <Button 
                onClick={() => {
                  setIsAddModalVisible(false)
                  form.resetFields()
                }}
                style={{ background: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑计划模态框 */}
      <Modal
        title="编辑计划"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false)
          setEditingPlan(null)
          form.resetFields()
        }}
        footer={null}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePlan}
          style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}
        >
          <Form.Item
            name="title"
            label={<Text style={{ color: '#fff' }}>计划标题</Text>}
            rules={[{ required: true, message: '请输入计划标题' }]}
          >
            <Input 
              placeholder="请输入计划标题"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text style={{ color: '#fff' }}>计划描述</Text>}
          >
            <Input.TextArea 
              placeholder="请输入计划描述"
              rows={3}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={<Text style={{ color: '#fff' }}>优先级</Text>}
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select 
              placeholder="请选择优先级"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                borderRadius: '6px'
              }}
            >
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label={<Text style={{ color: '#fff' }}>截止日期</Text>}
          >
            <DatePicker 
              showTime
              placeholder="选择截止日期"
              style={{ 
                width: '100%',
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid #333',
                borderRadius: '6px'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ background: '#1890ff', borderColor: '#1890ff' }}
              >
                更新计划
              </Button>
              <Button 
                onClick={() => {
                  setIsEditModalVisible(false)
                  setEditingPlan(null)
                  form.resetFields()
                }}
                style={{ background: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

