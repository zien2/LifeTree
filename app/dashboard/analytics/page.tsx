'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Select, Spin, message, Typography, Divider, Button, Modal, Input } from 'antd'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { DownloadOutlined, RobotOutlined, LoadingOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import * as XLSX from 'xlsx'
import 'dayjs/locale/zh-cn'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// 设置 dayjs 语言为中文
dayjs.locale('zh-cn')

interface Plan {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  createdAt: string
  dueDate?: string
  completedAt?: string
}

interface DailyData {
  date: string
  totalPlans: number
  completedPlans: number
  pendingPlans: number
  completionRate: number
  highPriorityPlans: number
  mediumPriorityPlans: number
  lowPriorityPlans: number
}

export default function AnalyticsPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  // dailyData 通过 useMemo 动态计算
  const [loading, setLoading] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  // 日期范围防抖，减少频繁计算
  const [debouncedDateRange, setDebouncedDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState<boolean>(false)
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('')
  const [aiResultModalVisible, setAiResultModalVisible] = useState<boolean>(false)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState<string>('')
  const [chatLoading, setChatLoading] = useState<boolean>(false)
  const chatContainerRef = React.useRef<HTMLDivElement | null>(null)

  const scrollToBottom = React.useCallback(() => {
    const el = chatContainerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [chatMessages, chatLoading, aiResultModalVisible, scrollToBottom])

  // 仅获取计划数据（初始化/手动刷新）
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const allPlans = response.data.data.plans
        setPlans(allPlans)
      }
    } catch (error) {
      console.error('获取计划数据失败:', error)
      message.error('获取计划数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 生成每日数据
  const generateDailyData = (plans: Plan[], range: [Dayjs, Dayjs]): DailyData[] => {
    const data: DailyData[] = []
    const startDate = range[0]
    const endDate = range[1]
    
    let currentDate = startDate
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD')
      
      // 筛选该日期的计划（基于创建日期）
      const dayPlans = plans.filter(plan => {
        const planDate = dayjs(plan.createdAt).format('YYYY-MM-DD')
        return planDate === dateStr
      })
      
      const totalPlans = dayPlans.length
      const completedPlans = dayPlans.filter(p => p.status === 'COMPLETED').length
      const pendingPlans = totalPlans - completedPlans
      const completionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0
      
      const highPriorityPlans = dayPlans.filter(p => p.priority === 'HIGH').length
      const mediumPriorityPlans = dayPlans.filter(p => p.priority === 'MEDIUM').length
      const lowPriorityPlans = dayPlans.filter(p => p.priority === 'LOW').length
      
      data.push({
        date: dateStr,
        totalPlans,
        completedPlans,
        pendingPlans,
        completionRate,
        highPriorityPlans,
        mediumPriorityPlans,
        lowPriorityPlans
      })
      
      currentDate = currentDate.add(1, 'day')
    }
    
    return data
  }

  // 初始化获取一次计划数据
  useEffect(() => {
    fetchPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 日期范围防抖
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDateRange(dateRange)
    }, 300)
    return () => clearTimeout(handler)
  }, [dateRange])

  // 生成每日数据（基于 plans 与 防抖后的日期范围）
  const dailyData = useMemo(() => {
    return generateDailyData(plans, debouncedDateRange)
  }, [plans, debouncedDateRange])

  // 导出Excel功能
  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 获取所有计划数据
      const plansResponse = await axios.get('/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!plansResponse.data.success) {
        message.error('获取计划数据失败')
        return
      }
      
      const plans = plansResponse.data.data.plans
      
      // 准备Excel数据
      const excelData = plans.map((plan: any) => ({
        '计划ID': plan.id,
        '标题': plan.title,
        '描述': plan.description || '',
        '状态': plan.status === 'COMPLETED' ? '已完成' : '进行中',
        '优先级': plan.priority === 'HIGH' ? '高' : plan.priority === 'MEDIUM' ? '中' : '低',
        '创建时间': dayjs(plan.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        '截止时间': plan.dueDate ? dayjs(plan.dueDate).format('YYYY-MM-DD HH:mm:ss') : '',
        '完成时间': plan.completedAt ? dayjs(plan.completedAt).format('YYYY-MM-DD HH:mm:ss') : ''
      }))
      
      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      
      // 设置列宽
      const colWidths = [
        { wch: 20 }, // 计划ID
        { wch: 30 }, // 标题
        { wch: 40 }, // 描述
        { wch: 10 }, // 状态
        { wch: 10 }, // 优先级
        { wch: 20 }, // 创建时间
        { wch: 20 }, // 截止时间
        { wch: 20 }  // 完成时间
      ]
      ws['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, ws, '计划数据')
      
      // 生成文件名
      const fileName = `计划数据导出_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
      
      // 下载文件
      XLSX.writeFile(wb, fileName)
      
      message.success('Excel文件导出成功！')
    } catch (error) {
      console.error('导出Excel失败:', error)
      message.error('导出Excel失败，请重试')
    }
  }

  // 聊天功能
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    // 添加用户消息
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }]
    setChatMessages(newMessages)

    try {
      const token = localStorage.getItem('token')
      
      // 构建聊天上下文，包含原始分析结果
      const chatContext = [
        {
          role: 'system',
          content: '你是时间管理专家。基于之前的分析结果，简洁回答用户问题。'
        },
        {
          role: 'user',
          content: `分析结果：${aiAnalysisResult.substring(0, 500)}...\n\n问题：${userMessage}`
        }
      ]

      const response = await axios.post('/api/ai-analysis', {
        data: { chatContext }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const assistantMessage = response.data.analysis
        setChatMessages([...newMessages, { role: 'assistant', content: assistantMessage }])
        setTimeout(scrollToBottom, 0)
      } else {
        message.error(response.data.message || '发送消息失败')
      }
    } catch (error: any) {
      console.error('发送消息失败:', error)
      message.error(error.response?.data?.message || '发送消息失败，请稍后重试')
    } finally {
      setChatLoading(false)
    }
  }

  // AI分析功能
  const performAiAnalysis = async () => {
    try {
      setAiAnalysisLoading(true)
      setAiAnalysisResult('')
      
      const token = localStorage.getItem('token')
      
      // 获取所有计划数据
      const plansResponse = await axios.get('/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!plansResponse.data.success) {
        message.error('获取计划数据失败')
        return
      }
      
      const plans = plansResponse.data.data.plans
      
      // 准备分析数据
      const analysisData = {
        totalPlans: plans.length,
        completedPlans: plans.filter((p: any) => p.status === 'COMPLETED').length,
        pendingPlans: plans.filter((p: any) => p.status !== 'COMPLETED').length,
        highPriorityPlans: plans.filter((p: any) => p.priority === 'HIGH').length,
        mediumPriorityPlans: plans.filter((p: any) => p.priority === 'MEDIUM').length,
        lowPriorityPlans: plans.filter((p: any) => p.priority === 'LOW').length,
        completionRate: plans.length > 0 ? (plans.filter((p: any) => p.status === 'COMPLETED').length / plans.length * 100).toFixed(1) : 0,
        recentPlans: plans.slice(0, 10).map((p: any) => ({
          title: p.title,
          status: p.status,
          priority: p.priority,
          createdAt: p.createdAt
        }))
      }
      
      // 调用AI分析API
      const aiResponse = await axios.post('/api/ai-analysis', {
        data: analysisData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (aiResponse.data.success) {
        setAiAnalysisResult(aiResponse.data.analysis)
        // 初始化聊天消息，将分析结果作为第一条助手消息
        setChatMessages([{ role: 'assistant', content: aiResponse.data.analysis }])
        setAiAnalysisVisible(false) // 关闭分析对话框
        setAiResultModalVisible(true) // 打开结果对话框
        message.success('AI分析完成！')
      } else {
        message.error(aiResponse.data.message || 'AI分析失败')
      }
    } catch (error: any) {
      console.error('AI分析失败:', error)
      message.error(error.response?.data?.message || 'AI分析失败，请稍后重试')
    } finally {
      setAiAnalysisLoading(false)
    }
  }

  // 计算统计数据
  const calculateStats = () => {
    if (dailyData.length === 0) return null

    const totalDays = dailyData.length
    const avgCompletionRate = dailyData.reduce((sum, d) => sum + d.completionRate, 0) / totalDays
    const totalPlansCreated = dailyData.reduce((sum, d) => sum + d.totalPlans, 0)
    const totalPlansCompleted = dailyData.reduce((sum, d) => sum + d.completedPlans, 0)
    const latest = dailyData[dailyData.length - 1] || {
      date: dayjs().format('YYYY-MM-DD'),
      totalPlans: 0,
      completedPlans: 0,
      pendingPlans: 0,
      completionRate: 0,
      highPriorityPlans: 0,
      mediumPriorityPlans: 0,
      lowPriorityPlans: 0
    }

    return {
      latest,
      totalDays,
      avgCompletionRate,
      totalPlansCreated,
      totalPlansCompleted,
      overallCompletionRate: totalPlansCreated > 0 ? (totalPlansCompleted / totalPlansCreated) * 100 : 0
    }
  }

  const stats = useMemo(() => calculateStats(), [dailyData])

  // 准备图表数据
  const chartData = useMemo(() => dailyData.map(data => ({
    date: dayjs(data.date).format('MM-DD'),
    fullDate: data.date,
    总计划数: data.totalPlans,
    已完成: data.completedPlans,
    待完成: data.pendingPlans,
    完成率: Number(data.completionRate.toFixed(1)),
    高优先级: data.highPriorityPlans,
    中优先级: data.mediumPriorityPlans,
    低优先级: data.lowPriorityPlans
  })), [dailyData])

  // 优先级分布数据 - 基于时间范围内所有计划
  const priorityData = useMemo(() => {
    if (!plans.length) return []
    
    // 筛选时间范围内的计划
    const rangePlans = plans.filter(plan => {
      const planDate = dayjs(plan.createdAt)
      return planDate.isAfter(debouncedDateRange[0].subtract(1, 'day')) && 
             planDate.isBefore(debouncedDateRange[1].add(1, 'day'))
    })
    
    const highPriority = rangePlans.filter(p => p.priority === 'HIGH').length
    const mediumPriority = rangePlans.filter(p => p.priority === 'MEDIUM').length
    const lowPriority = rangePlans.filter(p => p.priority === 'LOW').length
    
    return [
      { name: '高优先级', value: highPriority, color: '#ff4d4f' },
      { name: '中优先级', value: mediumPriority, color: '#faad14' },
      { name: '低优先级', value: lowPriority, color: '#52c41a' }
    ].filter(item => item.value > 0) // 只显示有数据的优先级
  }, [plans, debouncedDateRange])

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1f1f1f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <p style={{ color: '#ffffff', margin: '0 0 8px 0', fontWeight: 600 }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              color: entry.color, 
              margin: '4px 0',
              fontSize: '14px'
            }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ padding: '24px', background: '#000000', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
            📊 数据分析中心
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            基于每日数据快照的AI分析数据链路
          </Text>
        </div>

        {/* 控制面板 */}
        <Card 
          style={{ 
            marginBottom: '24px', 
            background: '#121212', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Text style={{ color: '#ffffff', marginRight: '8px' }}>时间范围:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]])
                  }
                }}
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text style={{ color: '#ffffff', marginRight: '8px' }}>图表类型:</Text>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: '100%' }}
              >
                <Option value="line">折线图</Option>
                <Option value="bar">柱状图</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                数据点: {dailyData.length} 天
              </Text>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={exportToExcel}
                  style={{
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: '8px'
                  }}
                >
                  导出Excel
                </Button>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={() => setAiAnalysisVisible(true)}
                  style={{
                    background: '#1890ff',
                    borderColor: '#1890ff',
                    borderRadius: '8px'
                  }}
                >
                  AI分析
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ color: '#ffffff', marginTop: '16px' }}>加载数据中...</div>
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  background: '#121212', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>总计划数</span>}
                    value={stats?.totalPlansCreated || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  background: '#121212', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>已完成</span>}
                    value={stats?.totalPlansCompleted || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  background: '#121212', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>整体完成率</span>}
                    value={stats?.overallCompletionRate || 0}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  background: '#121212', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>数据天数</span>}
                    value={stats?.totalDays || 0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {/* 趋势图表 */}
              <Col xs={24} lg={16}>
                <Card 
                  title={<span style={{ color: '#ffffff' }}>📈 计划完成趋势</span>}
                  style={{ 
                    background: '#121212', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255, 255, 255, 0.65)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.65)"
                          fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="总计划数" 
                          stroke="#1890ff" 
                          strokeWidth={2}
                          dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="已完成" 
                          stroke="#52c41a" 
                          strokeWidth={2}
                          dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="完成率" 
                          stroke="#faad14" 
                          strokeWidth={2}
                          dot={{ fill: '#faad14', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255, 255, 255, 0.65)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.65)"
                          fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="总计划数" fill="#1890ff" />
                        <Bar dataKey="已完成" fill="#52c41a" />
                        <Bar dataKey="待完成" fill="#ff4d4f" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* 优先级分布 */}
              <Col xs={24} lg={8}>
                <Card 
                  title={<span style={{ color: '#ffffff' }}>🎯 优先级分布</span>}
                  style={{ 
                    background: '#121212', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* 数据说明 */}
            <Card 
              style={{ 
                marginTop: '24px',
                background: '#121212', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              <Title level={4} style={{ color: '#ffffff', marginBottom: '16px' }}>
                📋 数据说明
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    <strong>数据来源:</strong> 每日凌晨自动创建的数据快照
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    <strong>更新频率:</strong> 每日一次（凌晨0点）
                  </Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    <strong>AI分析:</strong> 基于历史数据趋势进行智能分析
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    <strong>数据链路:</strong> 计划 → 快照 → 分析 → 建议
                  </Text>
                </Col>
              </Row>
            </Card>
          </>
        )}

        {/* AI分析Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RobotOutlined style={{ color: '#1890ff' }} />
              <span style={{ color: '#ffffff' }}>AI智能分析</span>
            </div>
          }
          open={aiAnalysisVisible}
          onCancel={() => {
            setAiAnalysisVisible(false)
            setAiAnalysisResult('')
          }}
          footer={null}
          width={800}
          style={{ top: 20 }}
          styles={{
            header: { background: '#0f0f0f', borderBottom: '1px solid rgba(255,255,255,0.08)' },
            body: { background: '#0f0f0f' },
            footer: { background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)' }
          }}
        >
          <div style={{ 
            background: '#141414', 
            padding: '20px', 
            borderRadius: '12px',
            minHeight: '400px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {!aiAnalysisResult ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <Text style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                    🤖 AI智能分析
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
                    我们将使用AI分析您的计划完成情况，并提供专业的优化建议
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    loading={aiAnalysisLoading}
                    onClick={performAiAnalysis}
                    style={{
                      background: '#1890ff',
                      borderColor: '#1890ff',
                      borderRadius: '8px',
                      padding: '0 32px',
                      height: '40px'
                    }}
                  >
                    {!aiAnalysisLoading && (
                      <>
                        <RobotOutlined />
                        <span style={{ marginLeft: '8px' }}>开始分析</span>
                      </>
                    )}
                    {aiAnalysisLoading && (
                      <span>AI分析中...</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <Text style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                    🎯 AI分析结果
                  </Text>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  minHeight: '200px'
                }}>
                  <Text style={{ 
                    color: '#ffffff', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {aiAnalysisResult}
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setAiAnalysisResult('')
                    }}
                    style={{
                      background: '#52c41a',
                      borderColor: '#52c41a',
                      borderRadius: '8px',
                      marginRight: '12px'
                    }}
                  >
                    重新分析
                  </Button>
                  <Button
                    onClick={() => {
                      setAiAnalysisVisible(false)
                      setAiAnalysisResult('')
                    }}
                    style={{
                      background: '#1a1a1a',
                      borderColor: '#333',
                      color: '#fff',
                      borderRadius: '8px'
                    }}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* AI分析结果对话框 */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
              <RobotOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              AI智能分析结果
            </div>
          }
          open={aiResultModalVisible}
          onCancel={() => setAiResultModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setAiResultModalVisible(false)}
              style={{
                background: '#1a1a1a',
                borderColor: '#333',
                color: '#fff',
                borderRadius: '8px'
              }}
            >
              关闭
            </Button>,
            <Button
              key="reanalyze"
              type="primary"
              onClick={() => {
                setAiResultModalVisible(false)
                setAiAnalysisVisible(true)
              }}
              style={{
                background: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '8px'
              }}
            >
              重新分析
            </Button>
          ]}
          width={800}
          style={{ top: 20 }}
          styles={{
            body: { background: '#0f0f0f', color: '#ffffff', maxHeight: '70vh', overflowY: 'auto' },
            header: { background: '#0f0f0f', borderBottom: '1px solid rgba(255,255,255,0.08)' },
            footer: { background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)' }
          }}
        >
          <div style={{ padding: '0' }}>
            {/* 聊天消息区域 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              height: '450px',
              overflowY: 'auto',
              marginBottom: '20px',
              position: 'relative'
            }} ref={chatContainerRef}>
              {/* 消息列表 */}
              <div style={{ minHeight: '100%' }}>
                {chatMessages.map((message, index) => (
                  <div key={index} className="chat-message" style={{
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    {/* 头像 */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: message.role === 'user' ? 'linear-gradient(135deg, #1890ff, #40a9ff)' : 'linear-gradient(135deg, #722ed1, #9254de)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '16px',
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}>
                      {message.role === 'user' ? '我' : 'AI'}
                    </div>
                    
                    {/* 消息内容 */}
                    <div style={{
                      maxWidth: '75%',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: message.role === 'user' 
                          ? 'linear-gradient(135deg, #1890ff, #40a9ff)' 
                          : 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        padding: '16px 20px',
                        borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        fontSize: '14px',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxShadow: message.role === 'user' 
                          ? '0 4px 12px rgba(24, 144, 255, 0.3)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: message.role === 'user' 
                          ? 'none' 
                          : '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {message.content}
                      </div>
                      
                      {/* 时间戳 */}
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginTop: '4px',
                        textAlign: message.role === 'user' ? 'right' : 'left',
                        padding: '0 8px'
                      }}>
                        {new Date().toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 加载状态 */}
                {chatLoading && (
                  <div className="ai-loading" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #722ed1, #9254de)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '16px',
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}>
                      AI
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px 20px 20px 4px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}>
                      <LoadingOutlined style={{ 
                        color: '#1890ff',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span>AI正在思考中...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 输入区域 */}
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              alignItems: 'flex-end',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ flex: 1 }}>
                <Input.TextArea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="继续与AI讨论分析结果..."
                  rows={3}
                  className="chat-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    resize: 'none',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    padding: '12px 16px'
                  }}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return
                    e.preventDefault()
                    sendChatMessage()
                  }}
                />
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  Enter发送，Shift+Enter换行
                </div>
              </div>
              
              <Button
                type="primary"
                onClick={sendChatMessage}
                loading={chatLoading}
                disabled={!chatInput.trim()}
                className="chat-send-button"
                style={{
                  background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  width: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)'
                }}
              >
                {!chatLoading && (
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>发送</span>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}