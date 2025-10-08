'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Form, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import 'dayjs/locale/zh-cn'
import { Plan } from '@/types/plan'

// 导入拆分后的组件
import CalendarHeader from '@/components/plans/CalendarHeader'
import DateCell from '@/components/plans/DateCell'
import MonthCell from '@/components/plans/MonthCell'
import PlanForm from '@/components/plans/PlanForm'
import PlanDetail from '@/components/plans/PlanDetail'
import TodayTasksList from '@/components/plans/TodayTasksList'
import DateDetailModal from '@/components/plans/DateDetailModal'

// 设置 dayjs 语言为中文
dayjs.locale('zh-cn')

export default function PlansPage() {
  // 状态管理
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false)
  const [todayTasksVisible, setTodayTasksVisible] = useState<boolean>(false)
  const [dateDetailVisible, setDateDetailVisible] = useState<boolean>(false)
  const [selectedDatePlans, setSelectedDatePlans] = useState<Plan[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month')
  const [form] = Form.useForm()

  // 获取计划列表（统一真实数据源）
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/plans', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setPlans(response.data.data.plans)
      }
    } catch (error) {
      console.error('获取计划列表失败:', error)
      message.error('获取计划列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchPlans()
  }, [])

  // 打开新增计划模态框
  const showAddModal = (date?: Dayjs) => {
    setEditingPlan(null)
    form.resetFields()
    
    // 如果有选定日期，则设置为开始日期
    if (date) {
      form.setFieldsValue({
        startDate: date,
      })
    }
    
    setModalVisible(true)
  }

  // 显示某一天的详情弹窗
  const showDateDetailModal = (date: Dayjs, dailyPlans: Plan[]) => {
    setSelectedDate(date)
    setSelectedDatePlans(dailyPlans)
    setDateDetailVisible(true)
  }

  // 刷新日期详情弹窗的数据
  const refreshDateDetailModal = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/plans', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        const updatedPlans = response.data.data.plans
        setPlans(updatedPlans)
        
        // 重新计算选中日期的计划
        if (selectedDate) {
          const dateStr = selectedDate.format('YYYY-MM-DD')
          const dailyPlans = updatedPlans.filter((plan: Plan) => {
            return dayjs(plan.createdAt).format('YYYY-MM-DD') === dateStr
          })
          setSelectedDatePlans(dailyPlans)
        }
      }
    } catch (error) {
      console.error('刷新计划数据失败:', error)
    }
  }

  // 简化的年份视图样式设置 - 主要依靠CSS
  useEffect(() => {
    if (calendarMode === 'year') {
      console.log('useEffect: 年份视图模式，CSS样式应该自动生效')
    }
  }, [calendarMode])

  // 强制设置年份视图高度的函数
  const forceSetYearViewHeight = () => {
    if (calendarMode === 'year') {
      console.log('强制设置年份视图高度...')
      
    // 尝试多种可能的选择器来找到年份面板
    let yearPanel = document.querySelector('.ant-picker-month-panel') as HTMLElement
    if (!yearPanel) {
      yearPanel = document.querySelector('.ant-picker-year-panel') as HTMLElement
    }
    if (!yearPanel) {
      yearPanel = document.querySelector('.ant-picker-calendar-year-panel') as HTMLElement
    }
    if (!yearPanel) {
      // 尝试更通用的选择器
      yearPanel = document.querySelector('.ant-picker-panel') as HTMLElement
    }
    if (!yearPanel) {
      // 最后尝试找到任何包含年份视图的元素
      yearPanel = document.querySelector('[class*="picker"][class*="panel"]') as HTMLElement
    }
      if (yearPanel) {
        yearPanel.style.setProperty('height', '80vh', 'important')
        yearPanel.style.setProperty('min-height', '600px', 'important')
        yearPanel.style.setProperty('max-height', 'none', 'important')
        console.log('设置年份面板高度:', yearPanel.style.height)
      } else {
        console.log('未找到年份面板元素')
      }
      
      // 设置年份面板内的表格行高度为33.33%（3行，一行4个月份）
    const yearTableRows = yearPanel ? yearPanel.querySelectorAll('tbody tr') : ([] as any)
      console.log('找到年份表格行数量:', yearTableRows.length)
      yearTableRows.forEach((row: any, index: number) => {
        row.style.setProperty('height', '33.33%', 'important')
        row.style.setProperty('max-height', 'none', 'important')
        console.log(`设置第${index + 1}行高度:`, row.style.height)
      })
      
      // 设置年份面板内的表格单元格高度和宽度
    const yearTableCells = yearPanel ? yearPanel.querySelectorAll('tbody td') : ([] as any)
      console.log('找到年份表格单元格数量:', yearTableCells.length)
      yearTableCells.forEach((cell: any, index: number) => {
        cell.style.setProperty('height', '100%', 'important')
        cell.style.setProperty('min-height', '200px', 'important')
        cell.style.setProperty('max-height', 'none', 'important')
        cell.style.setProperty('width', '25%', 'important')
        console.log(`设置第${index + 1}个单元格高度:`, cell.style.height, '宽度:', cell.style.width)
      })
      
      // 设置年份面板内的单元格高度
    const yearCells = yearPanel ? yearPanel.querySelectorAll('.ant-picker-cell') : ([] as any)
      console.log('找到年份单元格数量:', yearCells.length)
      yearCells.forEach((cell: any, index: number) => {
        cell.style.setProperty('height', '100%', 'important')
        cell.style.setProperty('min-height', '200px', 'important')
        cell.style.setProperty('max-height', 'none', 'important')
        console.log(`设置第${index + 1}个年份单元格高度:`, cell.style.height)
      })
      
    const yearCellInners = yearPanel ? yearPanel.querySelectorAll('.ant-picker-cell-inner') : ([] as any)
      console.log('找到年份单元格内部数量:', yearCellInners.length)
      yearCellInners.forEach((inner: any, index: number) => {
        inner.style.setProperty('height', 'calc(100% - 8px)', 'important')
        inner.style.setProperty('min-height', '190px', 'important')
        inner.style.setProperty('max-height', 'none', 'important')
        inner.style.setProperty('overflow', 'visible', 'important')
        inner.style.setProperty('padding', '8px', 'important')
        inner.style.setProperty('display', 'flex', 'important')
        inner.style.setProperty('flex-direction', 'column', 'important')
        inner.style.setProperty('justify-content', 'space-between', 'important')
        console.log(`设置第${index + 1}个年份单元格内部高度:`, inner.style.height)
      })
      
    const yearDates = yearPanel ? yearPanel.querySelectorAll('.ant-picker-calendar-date') : ([] as any)
      console.log('找到年份日期数量:', yearDates.length)
      yearDates.forEach((date: any, index: number) => {
        date.style.setProperty('height', 'calc(100% - 8px)', 'important')
        date.style.setProperty('min-height', '190px', 'important')
        date.style.setProperty('max-height', 'none', 'important')
        date.style.setProperty('overflow', 'visible', 'important')
        date.style.setProperty('padding', '8px', 'important')
        date.style.setProperty('display', 'flex', 'important')
        date.style.setProperty('flex-direction', 'column', 'important')
        date.style.setProperty('justify-content', 'space-between', 'important')
        console.log(`设置第${index + 1}个年份日期高度:`, date.style.height)
      })
      
      // 强制设置年份面板内所有相关元素
    const allYearElements = yearPanel ? yearPanel.querySelectorAll('*') : ([] as any)
      allYearElements.forEach((element: any) => {
        element.style.setProperty('max-height', 'none', 'important')
      })
      
      console.log('年份视图高度设置完成')
    }
  }

  // 打开编辑计划模态框
  const showEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    
    // 处理开始日期
    let startDate = undefined
    if (plan.startDate) {
      startDate = dayjs(plan.startDate)
    }
    
    // 分离日期和时间
    let dueDate = undefined
    let dueTime = undefined
    
    if (plan.dueDate) {
      const dueDateObj = dayjs(plan.dueDate)
      dueDate = dueDateObj
      dueTime = dueDateObj.hour() || dueDateObj.minute() ? dueDateObj : undefined
    }
    
    form.setFieldsValue({
      title: plan.title,
      description: plan.description || '',
      priority: plan.priority,
      startDate,
      dueDate,
      dueTime,
    })
    
    setModalVisible(true)
  }

  // 显示计划详情
  const showPlanDetail = (plan: Plan) => {
    setSelectedPlan(plan)
    setDetailModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false)
    form.resetFields()
  }

  // 关闭详情模态框
  const handleDetailCancel = () => {
    setDetailModalVisible(false)
    setSelectedPlan(null)
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const token = localStorage.getItem('token')
      
      // 处理开始日期
      let startDate: string | undefined = undefined
      if (values.startDate) {
        const dt = dayjs(values.startDate).hour(0).minute(0).second(0).millisecond(0)
        startDate = dt.toDate().toISOString()
      }
      
      // 合并日期和时间（转为 ISO 字符串，避免后端解析失败）
      let dueDate: string | undefined = undefined
      if (values.dueDate) {
        let dt = dayjs(values.dueDate)
        if (values.dueTime) {
          dt = dt.hour(values.dueTime.hour()).minute(values.dueTime.minute()).second(0).millisecond(0)
        } else {
          dt = dt.hour(0).minute(0).second(0).millisecond(0)
        }
        dueDate = dt.toDate().toISOString()
      }
      
      const planData: any = {
        title: values.title,
        description: values.description,
        priority: values.priority || 'MEDIUM',
      }
      // 仅当选择了日期时才发送相应字段，避免覆盖为 null 触发 500
      if (startDate !== undefined) planData.startDate = startDate
      if (dueDate !== undefined) planData.dueDate = dueDate
      
      console.log('➡️ 提交计划数据:', planData)
      if (editingPlan) {
        // 更新计划
        await axios.patch(`/api/plans/${editingPlan.id}`, planData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        message.success('计划已更新')
      } else {
        // 创建计划
        await axios.post('/api/plans', planData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        message.success('计划已创建')
      }
      
      setModalVisible(false)
      form.resetFields()
      fetchPlans()
    } catch (error: any) {
      console.error('提交计划失败:', error)
      const msg = error?.response?.data?.message || error?.message || '提交计划失败'
      message.error(msg)
    }
  }

  // 删除计划
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      message.success('计划已删除')
      fetchPlans()
      setDetailModalVisible(false)
    } catch (error) {
      console.error('删除计划失败:', error)
      message.error('删除计划失败')
    }
  }

  // 切换计划状态
  const togglePlanStatus = async (plan: Plan) => {
    try {
      const token = localStorage.getItem('token')
      const newCompleted = plan.status !== 'COMPLETED'
      await axios.patch(
        `/api/plans/${plan.id}`,
        { completed: newCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      message.success(newCompleted ? '计划已完成' : '计划已重新激活')
      fetchPlans()
      
      // 如果在详情模态框中，更新选中的计划
      if (selectedPlan && selectedPlan.id === plan.id) {
        setSelectedPlan({
          ...selectedPlan,
          status: newCompleted ? 'COMPLETED' : 'PENDING',
          completedAt: newCompleted ? new Date().toISOString() : undefined
        })
      }
    } catch (error) {
      console.error('更新计划状态失败:', error)
      message.error('更新计划状态失败')
    }
  }

  // 获取某天的计划列表
  const getPlansForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    
    return plans.filter(plan => {
      // 所有日期都按createdAt字段来展示
      return dayjs(plan.createdAt).format('YYYY-MM-DD') === dateStr
    })
  }

  // 日历单元格渲染
  const dateCellRender = (date: Dayjs) => {
    const dailyPlans = getPlansForDate(date)
    return (
      <div 
        style={{ 
          height: '100%', 
          width: '100%', 
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (dailyPlans.length > 0) {
            // 如果有计划，显示详情弹窗
            showDateDetailModal(date, dailyPlans)
          } else {
            // 如果没有计划，显示新增计划模态框
            showAddModal(date)
          }
        }}
      >
        <DateCell 
          date={date} 
          plans={dailyPlans} 
          showPlanDetail={showPlanDetail}
          showTodayTasks={() => setTodayTasksVisible(true)}
        />
      </div>
    )
  }

  // 月份单元格渲染
  const monthCellRender = (date: Dayjs) => {
    // 获取当月所有计划（基于createdAt字段）
    const monthStr = date.format('YYYY-MM')
    
    const monthPlans = plans.filter(plan => {
      const planMonthStr = dayjs(plan.createdAt).format('YYYY-MM')
      return planMonthStr === monthStr
    })
    
    return <MonthCell date={date} plans={monthPlans} />
  }

  // 自定义日历头部
  const headerRender = (props: any) => {
    return (
      <CalendarHeader
        value={props.value}
        onChange={props.onChange}
        calendarMode={calendarMode}
        setCalendarMode={setCalendarMode}
        showAddModal={showAddModal}
        showTodayTasks={props.showTodayTasks}
      />
    )
  }

  // 获取优先级标签颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ff4d4f'
      case 'MEDIUM':
        return '#faad14'
      case 'LOW':
        return '#52c41a'
      default:
        return '#1890ff'
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Calendar
        headerRender={(props) => headerRender({
          ...props,
          showTodayTasks: () => setTodayTasksVisible(true)
        })}
        value={selectedDate}
        onSelect={(date, { source }) => {
          setSelectedDate(date)
          // 点击逻辑现在在 dateCellRender 中处理
        }}
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
        mode={calendarMode}
        onPanelChange={(date, mode) => {
          setSelectedDate(date)
          setCalendarMode(mode === 'month' ? 'month' : 'year')
          // 当切换到年份视图时，立即设置高度
          if (mode === 'year') {
            setTimeout(() => {
              forceSetYearViewHeight()
            }, 100)
          }
        }}
        // 只显示当月日期，隐藏上月和下月的日期
        validRange={[
          selectedDate.startOf('month'),
          selectedDate.endOf('month')
        ]}
        // 禁用上月和下月日期的显示
        disabledDate={(current) => {
          if (!current) return false
          const startOfMonth = selectedDate.startOf('month')
          const endOfMonth = selectedDate.endOf('month')
          return current.isBefore(startOfMonth) || current.isAfter(endOfMonth)
        }}
      />

      {/* 计划表单模态框 */}
      <PlanForm
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        editingPlan={editingPlan}
      />

      {/* 计划详情模态框 */}
      <PlanDetail
        visible={detailModalVisible}
        onCancel={handleDetailCancel}
        plan={selectedPlan}
        onEdit={showEditModal}
        onDelete={handleDelete}
        onToggleStatus={togglePlanStatus}
      />

      {/* 今日任务列表抽屉 */}
      <TodayTasksList
        visible={todayTasksVisible}
        onClose={() => setTodayTasksVisible(false)}
        plans={plans}
        onToggleStatus={togglePlanStatus}
        onDelete={handleDelete}
        onEdit={showEditModal}
        onAdd={(date) => {
          showAddModal(date)
        }}
        maskClosable={!modalVisible && !detailModalVisible}
      />
      {todayTasksVisible ? <>{console.log('Today tasks visible, plans:', plans)}</> : null}

      {/* 某一天详情弹窗 */}
      <DateDetailModal
        visible={dateDetailVisible}
        date={selectedDate}
        plans={selectedDatePlans}
        onClose={() => setDateDetailVisible(false)}
        onToggleStatus={togglePlanStatus}
        onEdit={showEditModal}
        onDelete={handleDelete}
        onAdd={showAddModal}
        onRefresh={refreshDateDetailModal}
      />

      <style jsx global>{`
        /* 浅色主题 Ant Design 日历样式 */
        
        /* 日历整体容器 */
        .ant-picker-calendar {
          background: #2c2c2c;
          border: 1px solid #404040;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        /* 日历面板 */
        .ant-picker-calendar .ant-picker-panel {
          background: #2c2c2c;
        }
        
        /* 表头样式 */
        .ant-picker-calendar .ant-picker-content th {
          background: #404040;
          color: #ffffff;
          font-weight: 600;
          border-bottom: 1px solid #555555;
          padding: 12px 8px;
        }
        
        /* 日期单元格 */
        .ant-picker-calendar .ant-picker-cell {
          background: #2c2c2c;
          border: 1px solid #404040;
          min-height: 100px;
        }
        
        /* 日期格子 */
        .ant-picker-calendar-date {
          background: #404040 !important;
          border: 1px solid #555555;
          border-radius: 4px;
          margin: 1px;
          height: calc(100% - 2px);
          padding: 4px;
          transition: all 0.3s;
        }
        
        /* 悬停效果 */
        .ant-picker-calendar-date:hover {
          background: #555555 !important;
          border-color: #666666;
        }
        
        /* 今天日期 */
        .ant-picker-calendar-date-today {
          background: #1a365d !important;
          border-color: #3182ce !important;
        }
        
        /* 选中日期 */
        .ant-picker-calendar-date-selected {
          background: #3182ce !important;
          border-color: #3182ce !important;
          color: #ffffff !important;
        }
        
        /* 其他月份日期 */
        .ant-picker-calendar-date-other-month {
          background: #333333 !important;
          color: #888888 !important;
        }
        
        /* 日期数字 */
        .ant-picker-calendar-date-value {
          color: #ffffff;
          font-weight: 500;
        }
        
        .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
          color: #63b3ed;
          font-weight: 600;
        }
        
        .ant-picker-calendar-date-selected .ant-picker-calendar-date-value {
          color: #ffffff !important;
        }
        
        .ant-picker-calendar-date-other-month .ant-picker-calendar-date-value {
          color: #888888 !important;
        }
        
        /* 计划项目样式 */
        .plan-item {
          background: #1a365d;
          border: 1px solid #3182ce;
          border-radius: 4px;
          padding: 4px 6px;
          margin: 2px 0;
          color: #63b3ed;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .plan-item:hover {
          background: #3182ce;
          border-color: #63b3ed;
        }
        
        /* 更多计划按钮 */
        .more-plans {
          background: #555555;
          border: 1px solid #666666;
          border-radius: 4px;
          padding: 2px 6px;
          margin: 2px 0;
          color: #ffffff;
          font-size: 11px;
          text-align: center;
          cursor: pointer;
        }
        
        .more-plans:hover {
          background: #666666;
          color: #ffffff;
        }
        
        /* 月份计划总结 */
        .month-plans-summary {
          background: #404040;
          border: 1px solid #555555;
          border-radius: 6px;
          padding: 8px;
          margin: 4px 0;
          color: #ffffff;
        }
        
        /* 隐藏被禁用的日期（上月和下月的日期） */
        .ant-picker-calendar-date.ant-picker-calendar-date-disabled {
          display: none !important;
        }
        
        /* 确保只显示当月日期 */
        .ant-picker-calendar-date:not(.ant-picker-calendar-date-disabled) {
          display: block !important;
        }
        
        /* 日历头部按钮 */
        .ant-picker-calendar-header .ant-radio-group .ant-radio-button-wrapper {
          background: #ffffff;
          border-color: #d9d9d9;
          color: #595959;
        }
        
        .ant-picker-calendar-header .ant-radio-group .ant-radio-button-wrapper-checked {
          background: #1890ff;
          border-color: #1890ff;
          color: #ffffff;
        }
        
        .ant-picker-calendar-header .ant-radio-group .ant-radio-button-wrapper:hover {
          color: #1890ff;
          border-color: #1890ff;
        }
        
        /* 年份月份选择器 */
        .ant-picker-calendar-header .ant-picker-year-select,
        .ant-picker-calendar-header .ant-picker-month-select {
          color: #262626;
        }
        
        .ant-picker-calendar-header .ant-picker-year-select .ant-select-selector,
        .ant-picker-calendar-header .ant-picker-month-select .ant-select-selector {
          background: #ffffff !important;
          border-color: #d9d9d9 !important;
          color: #262626 !important;
        }
        
        /* 年份视图样式 - 一行显示4个月份，增加高度 */
        .ant-picker-calendar-year-panel {
          height: 80vh !important;
          min-height: 600px !important;
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-content {
          height: calc(100% - 60px) !important;
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-content table {
          height: 100% !important;
          table-layout: fixed !important;
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-content tbody {
          height: 100% !important;
          max-height: none !important;
        }
        
        /* 一行显示4个月份，所以是3行 */
        .ant-picker-calendar-year-panel .ant-picker-content tbody tr {
          height: 33.33% !important;
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-content tbody td {
          height: 100% !important;
          min-height: 200px !important;
          max-height: none !important;
          vertical-align: top !important;
          padding: 4px !important;
          width: 25% !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-cell,
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-cell {
          height: 100% !important;
          min-height: 200px !important;
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-cell-inner,
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-cell-inner {
          height: calc(100% - 8px) !important;
          min-height: 190px !important;
          max-height: none !important;
          padding: 12px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: flex-start !important;
          overflow: visible !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-calendar-date {
          height: calc(100% - 8px) !important;
          min-height: 190px !important;
          max-height: none !important;
          padding: 12px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: flex-start !important;
          overflow: visible !important;
        }
        
        /* 强制所有年份视图相关元素 */
        .ant-picker-calendar-year-panel * {
          max-height: none !important;
        }
        
        /* 年份视图中的月份名称 */
        .ant-picker-calendar-year-panel .ant-picker-calendar-date-value {
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
          color: #ffffff !important;
        }
        
        /* 年份视图中的月份计划总结 */
        .ant-picker-calendar-year-panel .month-plans-summary {
          flex: 1 !important;
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          gap: 4px !important;
        }
        
        .ant-picker-calendar-year-panel .month-plans-summary .ant-badge {
          margin: 2px 0 !important;
        }
        
        .ant-picker-calendar-year-panel .month-plans-summary .ant-badge .ant-badge-status-text {
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        
        /* 确保年份视图中的内容不被截断 */
        .ant-picker-calendar-year-panel .ant-picker-calendar-date-content {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
        }
        
        /* 年份视图表格行高度 */
        .ant-picker-calendar-year-panel .ant-picker-content tbody tr {
          height: 300px !important;
        }
        
        /* 年份视图表格单元格 */
        .ant-picker-calendar-year-panel .ant-picker-content tbody td {
          height: 300px !important;
          vertical-align: top !important;
        }
        
        /* 更强制的高度设置 */
        .ant-picker-calendar-year-panel .ant-picker-content tbody td .ant-picker-cell {
          height: 300px !important;
          min-height: 300px !important;
        }
        
        /* 强制所有年份视图相关元素的高度 */
        .ant-picker-calendar-year-panel * {
          max-height: none !important;
        }
        
        .ant-picker-calendar-year-panel .ant-picker-cell-inner,
        .ant-picker-calendar-year-panel .ant-picker-calendar-date,
        .ant-picker-calendar-year-panel .ant-picker-calendar-date-content {
          height: auto !important;
          min-height: 280px !important;
          max-height: none !important;
        }
        
        /* 确保月份计划总结有足够空间 */
        .ant-picker-calendar-year-panel .month-plans-summary {
          min-height: 200px !important;
          height: auto !important;
        }
        
        /* 年份视图的通用样式覆盖 */
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-cell-inner,
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-calendar-date,
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-calendar-date-content {
          height: auto !important;
          min-height: 280px !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* 强制年份视图单元格高度 */
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-cell-inner {
          height: 300px !important;
          min-height: 300px !important;
        }
        
        /* 年份视图中的月份名称样式 */
        .ant-picker-calendar-year-panel .ant-picker-content .ant-picker-calendar-date-value {
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
          color: #ffffff !important;
        }
        
        /* 下拉菜单 */
        .ant-select-dropdown {
          background-color: #ffffff !important;
          border: 1px solid #d9d9d9 !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
        }
        
        .ant-select-item {
          color: #262626 !important;
        }
        
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #e6f7ff !important;
          color: #1890ff !important;
        }
        
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #f5f5f5 !important;
        }
      `}</style>
    </div>
  )
}