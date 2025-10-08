'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  PlusOutlined,
  DeleteOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import { notification, Select } from 'antd'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { Plan, isPlanCompleted, fetchPlans as fetchPlansUtil, togglePlanComplete as togglePlanCompleteUtil, addPlan as addPlanUtil, deletePlan as deletePlanUtil, sortPlansByPriority, getTodayPlans } from '@/lib/planUtils'
import TodayTasksButton from '@/components/TodayTasksButton'

const LifeTreeCanvas = dynamic(() => import('@/components/LifeTreeCanvas'), {
  ssr: false,
})

const FlipClock = dynamic(() => import('@/components/FlipClock'), {
  ssr: false,
})

const Timers = dynamic(() => import('@/components/Timers'), {
  ssr: false,
})

// 使用共享的 Plan 接口和工具函数

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [newPlanTitle, setNewPlanTitle] = useState('')
  const [newPlanPriority, setNewPlanPriority] = useState('MEDIUM')
  const [isAddingPlan, setIsAddingPlan] = useState(false)
  const [api, contextHolder] = notification.useNotification()

  useEffect(() => {
    fetchUserInfo()
    fetchPlans()
  }, [])

  // 显示计划通知
  const showPlanNotification = (message: string, type: 'success' | 'info' = 'success') => {
    const icon = message.includes('🎉') ? '🎉' : message.includes('✨') ? '✨' : '📝'
    const title = message.includes('完成') ? '计划完成' : message.includes('创建') ? '计划创建' : '计划更新'
    
    api.open({
      message: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#fff',
        }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          {title}
        </div>
      ),
      description: (
        <div style={{ 
          color: '#bbb', 
          fontSize: '14px',
          marginLeft: '32px',
        }}>
          {message.replace(/🎉|✨|📝/g, '').trim()}
        </div>
      ),
      placement: 'top',
      duration: 2,
      closeIcon: <span />,
      className: 'plan-notification',
      style: {
        marginTop: '60px',
      },
    })
  }

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setUser(response.data.data.user)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const fetchPlans = async () => {
    try {
      const allPlans = await fetchPlansUtil()
      // 只显示今天创建的计划
      const todayPlans = getTodayPlans(allPlans)
      setPlans(todayPlans)
    } catch (error) {
      console.error('❌ 获取计划失败:', error)
    }
  }

  const togglePlanComplete = async (planId: string, currentStatus: string) => {
    try {
      const response = await togglePlanCompleteUtil(planId, currentStatus)
      
      // 显示通知
      if (response.message) {
        showPlanNotification(response.message)
      }
      
      await fetchPlans()
    } catch (error) {
      console.error('❌ 更新计划失败:', error)
      api.error({
        message: '操作失败',
        description: '更新计划失败，请重试',
        placement: 'top',
      })
    }
  }

  const addPlan = async () => {
    if (!newPlanTitle.trim()) {
      setIsAddingPlan(false)
      return
    }

    try {
      const response = await addPlanUtil(newPlanTitle, newPlanPriority)
      
      // 显示通知
      if (response.message) {
        showPlanNotification(response.message)
      }
      
      setNewPlanTitle('')
      setNewPlanPriority('MEDIUM')
      setIsAddingPlan(false)
      await fetchPlans()
    } catch (error) {
      console.error('创建计划失败:', error)
      api.error({
        message: '操作失败',
        description: '创建计划失败，请重试',
        placement: 'top',
      })
    }
  }

  const deletePlan = async (planId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchPlans()
      fetchUserInfo() // 更新统计数据
    } catch (error) {
      console.error('删除计划失败:', error)
    }
  }

  return (
    <React.Fragment>
      {contextHolder}
      <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 96px)' }}>
        {/* 左侧：统计信息 + 时钟 + 计划列表 */}
        <div style={{ width: '1100px', display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
          {/* 顶部：统计信息 + 时钟 */}
          <div style={{ display: 'flex', gap: '0px' }}>
            {/* 统计信息区域 */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 今日计划数 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', fontWeight: 500, letterSpacing: '0.3px' }}>今日计划</div>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {plans.length}
                  </div>
                </div>
              </div>

              {/* 已完成 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrophyOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', fontWeight: 500, letterSpacing: '0.3px' }}>已完成</div>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {plans.filter(p => isPlanCompleted(p)).length}
                  </div>
                </div>
              </div>

              {/* 完成率 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RiseOutlined style={{ color: '#faad14', fontSize: '24px' }} />
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', fontWeight: 500, letterSpacing: '0.3px' }}>完成率</div>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {plans.length > 0 ? Math.round((plans.filter(p => isPlanCompleted(p)).length / plans.length) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* 进行中 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', fontWeight: 500, letterSpacing: '0.3px' }}>进行中</div>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {plans.filter(p => !isPlanCompleted(p)).length}
                  </div>
                </div>
              </div>
            </div>

            {/* 翻页时钟 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <FlipClock />
            </div>
          </div>

          {/* 第二行：左侧计划列表 + 右侧计时器区域 */}
          <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
            {/* 计划列表 - 固定宽度，和统计信息一样宽 */}
            <div style={{ width: '320px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* 分隔线 */}
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', marginBottom: '20px' }} />
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, letterSpacing: '0.3px' }}>今日计划</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <TodayTasksButton 
                    plans={plans}
                    onToggleStatus={(plan) => togglePlanComplete(plan.id, plan.status)}
                    onDelete={deletePlan}
                    onEdit={() => {}}
                  />
                  <PlusOutlined
                    onClick={() => setIsAddingPlan(true)}
                    style={{ 
                      color: '#52c41a', 
                      fontSize: '18px', 
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2) rotate(90deg)'
                      e.currentTarget.style.color = '#73d13d'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                      e.currentTarget.style.color = '#52c41a'
                    }}
                  />
                </div>
              </div>

              {/* 添加新计划输入框 */}
              {isAddingPlan && (
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    autoFocus
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addPlan()
                      }
                      if (e.key === 'Escape') {
                        setIsAddingPlan(false)
                        setNewPlanTitle('')
                        setNewPlanPriority('MEDIUM')
                      }
                    }}
                    placeholder="输入计划标题，按 Enter 提交..."
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                  />
                  <Select
                    value={newPlanPriority}
                    onChange={setNewPlanPriority}
                    style={{ width: '100%' }}
                    size="small"
                    optionLabelProp="label"
                    options={[
                      { 
                        value: 'HIGH',
                        label: '高优先级',
                        children: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ff4d4f', flexShrink: 0 }} />
                            <span>高优先级</span>
                          </div>
                        )
                      },
                      { 
                        value: 'MEDIUM',
                        label: '中优先级',
                        children: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#faad14', flexShrink: 0 }} />
                            <span>中优先级</span>
                          </div>
                        )
                      },
                      { 
                        value: 'LOW',
                        label: '低优先级',
                        children: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#52c41a', flexShrink: 0 }} />
                            <span>低优先级</span>
                          </div>
                        )
                      },
                    ]}
                    optionRender={(option) => option.data.children}
                    dropdownStyle={{
                      background: 'rgba(44, 62, 80, 0.95)',
                      backdropFilter: 'blur(20px)',
                    }}
                  />
                </div>
              )}

              {/* 计划列表滚动区域 */}
              <div 
                className="plan-list-scroll"
                style={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px',
                }}
              >
                <style jsx>{`
                  .plan-list-scroll::-webkit-scrollbar {
                    width: 6px;
                  }
                  .plan-list-scroll::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                  }
                  .plan-list-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                  }
                  .plan-list-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                  }
                `}</style>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    {/* 复选框 */}
                    <div
                      onClick={() => togglePlanComplete(plan.id, plan.status)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: `2px solid ${isPlanCompleted(plan) ? '#52c41a' : 'rgba(255, 255, 255, 0.3)'}`,
                        background: isPlanCompleted(plan) ? '#52c41a' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.15)'
                        if (!isPlanCompleted(plan)) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        if (!isPlanCompleted(plan)) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      {isPlanCompleted(plan) && (
                        <CheckCircleOutlined style={{ color: '#fff', fontSize: '12px' }} />
                      )}
                    </div>

                    {/* 标题和优先级 */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          color: isPlanCompleted(plan) ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                          fontSize: '14px',
                          fontWeight: 500,
                          textDecoration: isPlanCompleted(plan) ? 'line-through' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        {plan.title}
                      </div>
                      {/* 优先级标签 */}
                      {plan.priority && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: 
                              plan.priority === 'HIGH' ? '#ff4d4f' : 
                              plan.priority === 'MEDIUM' ? '#faad14' : 
                              '#52c41a',
                            opacity: isPlanCompleted(plan) ? 0.4 : 1,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    {/* 删除按钮 */}
                    <DeleteOutlined
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePlan(plan.id)
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

                {plans.length === 0 && !isAddingPlan && (
                  <div style={{ 
                    textAlign: 'center', 
                    color: 'rgba(255, 255, 255, 0.4)', 
                    fontSize: '14px',
                    fontWeight: 500,
                    marginTop: '40px',
                    letterSpacing: '0.3px'
                  }}>
                    暂无计划，点击 + 添加
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：蓝色区域（加入正计时 + 倒计时） */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1,
                padding: '12px',
              }}>
                <Timers />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：生命树铺满 */}
        <div style={{ flex: 1 }}>
          <LifeTreeCanvas plans={plans} />
        </div>
      </div>
    </React.Fragment>
  )
}