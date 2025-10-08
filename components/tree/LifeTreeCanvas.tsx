'use client'

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Card, Typography, Modal, Tag, Space, Button, message, Tooltip } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Plan } from '@/types/plan'
import dayjs from 'dayjs'

const { Text } = Typography

interface LifeTreeCanvasProps {
  plans: Plan[]
  onPlanToggle?: (planId: string) => void
  onPlanEdit?: (plan: Plan) => void
  onPlanDelete?: (planId: string) => void
}

interface Leaf {
  id: string
  x: number
  y: number
  plan: Plan
  angle: number
  branchIndex: number
  animationPhase: number
  isHovered: boolean
}

interface Branch {
  startX: number
  startY: number
  endX: number
  endY: number
  angle: number
  thickness: number
}

export type LifeTreeCanvasHandle = {
  getSnapshotDataUrl: () => string | null
}

function LifeTreeCanvas({ 
  plans, 
  onPlanToggle, 
  onPlanEdit, 
  onPlanDelete 
}: LifeTreeCanvasProps, ref: React.Ref<LifeTreeCanvasHandle>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastFrameDataUrlRef = useRef<string>('')
  const [selectedLeaf, setSelectedLeaf] = useState<Leaf | null>(null)
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)

  // 生成树枝
  const generateBranches = useCallback((canvasWidth: number, canvasHeight: number): Branch[] => {
    const trunkWidth = 40
    const trunkHeight = canvasHeight * 0.6
    const trunkX = canvasWidth / 2
    const trunkY = canvasHeight - 50

    const mainBranches: Branch[] = []
    
    // 主树干
    mainBranches.push({
      startX: trunkX,
      startY: trunkY,
      endX: trunkX,
      endY: trunkY - trunkHeight,
      angle: -Math.PI / 2,
      thickness: trunkWidth
    })

    // 生成主要分支
    const branchCount = 6
    for (let i = 0; i < branchCount; i++) {
      const branchHeight = trunkHeight * (0.3 + Math.random() * 0.4)
      const branchAngle = -Math.PI / 2 + (i - branchCount / 2) * 0.3
      const branchLength = 80 + Math.random() * 60
      
      const startX = trunkX + Math.cos(branchAngle) * branchHeight
      const startY = trunkY - branchHeight
      const endX = startX + Math.cos(branchAngle + Math.PI / 6) * branchLength
      const endY = startY + Math.sin(branchAngle + Math.PI / 6) * branchLength

      mainBranches.push({
        startX,
        startY,
        endX,
        endY,
        angle: branchAngle + Math.PI / 6,
        thickness: 8 + Math.random() * 4
      })
    }

    return mainBranches
  }, [])

  // 生成叶子位置
  const generateLeaves = useCallback((plans: Plan[], branches: Branch[]): Leaf[] => {
    return plans.map((plan, index) => {
      const branchIndex = index % branches.length
      const branch = branches[branchIndex]
      
      // 在树枝上随机分布叶子
      const t = 0.3 + Math.random() * 0.4 // 在树枝的30%-70%位置
      const leafX = branch.startX + (branch.endX - branch.startX) * t
      const leafY = branch.startY + (branch.endY - branch.startY) * t
      
      // 添加一些随机偏移，让叶子看起来更自然
      const offsetX = (Math.random() - 0.5) * 20
      const offsetY = (Math.random() - 0.5) * 20

      return {
        id: plan.id,
        x: leafX + offsetX,
        y: leafY + offsetY,
        plan,
        angle: branch.angle + (Math.random() - 0.5) * 0.5,
        branchIndex,
        animationPhase: Math.random() * Math.PI * 2,
        isHovered: false
      }
    })
  }, [])

  // 绘制树干和树枝
  const drawBranches = useCallback((ctx: CanvasRenderingContext2D, branches: Branch[]) => {
    ctx.strokeStyle = '#8B4513'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    branches.forEach(branch => {
      ctx.lineWidth = branch.thickness
      ctx.beginPath()
      ctx.moveTo(branch.startX, branch.startY)
      ctx.lineTo(branch.endX, branch.endY)
      ctx.stroke()
    })
  }, [])

  // 绘制叶子
  const drawLeaves = useCallback((ctx: CanvasRenderingContext2D, leaves: Leaf[], time: number) => {
    leaves.forEach(leaf => {
      const { x, y, plan, angle, animationPhase } = leaf
      
      // 叶子摆动动画
      const sway = Math.sin(time * 0.002 + animationPhase) * 0.1
      const currentAngle = angle + sway
      
      // 根据计划状态确定叶子颜色
      let color = '#90EE90' // 默认绿色（新计划）
      if (plan.status === 'COMPLETED') {
        color = '#32CD32' // 深绿色（已完成）
      } else if (plan.status === 'IN_PROGRESS') {
        color = '#FFD700' // 金色（进行中）
      } else if (plan.dueDate && dayjs(plan.dueDate).isBefore(dayjs(), 'day')) {
        color = '#FF6B6B' // 红色（逾期）
      }

      // 根据优先级调整叶子大小
      let size = 8
      if (plan.priority === 'HIGH') size = 12
      else if (plan.priority === 'MEDIUM') size = 10
      else size = 8

      // 绘制叶子
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(currentAngle)
      
      // 叶子形状（椭圆形）
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // 叶子边框
      ctx.strokeStyle = '#228B22'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // 如果是高优先级，添加发光效果
      if (plan.priority === 'HIGH') {
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.fill()
      }
      
      ctx.restore()
    })
  }, [])

  // 动画循环
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制树枝
    drawBranches(ctx, branches)

    // 绘制叶子
    drawLeaves(ctx, leaves, time)

    // 保存最近一帧的DataURL（用于截图上传）
    try {
      lastFrameDataUrlRef.current = canvas.toDataURL('image/png')
    } catch {}

    animationRef.current = requestAnimationFrame(animate)
  }, [branches, leaves, drawBranches, drawLeaves])

  // 处理鼠标点击
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 检查是否点击了叶子
    const clickedLeaf = leaves.find(leaf => {
      const distance = Math.sqrt((x - leaf.x) ** 2 + (y - leaf.y) ** 2)
      return distance < 15 // 点击范围
    })

    if (clickedLeaf) {
      setSelectedLeaf(clickedLeaf)
      setIsModalVisible(true)
    }
  }, [leaves])

  // 处理计划状态切换
  const handlePlanToggle = useCallback((planId: string) => {
    if (onPlanToggle) {
      onPlanToggle(planId)
    }
    setIsModalVisible(false)
    setSelectedLeaf(null)
  }, [onPlanToggle])

  // 处理计划编辑
  const handlePlanEdit = useCallback((plan: Plan) => {
    if (onPlanEdit) {
      onPlanEdit(plan)
    }
    setIsModalVisible(false)
    setSelectedLeaf(null)
  }, [onPlanEdit])

  // 处理计划删除
  const handlePlanDelete = useCallback((planId: string) => {
    if (onPlanDelete) {
      onPlanDelete(planId)
    }
    setIsModalVisible(false)
    setSelectedLeaf(null)
  }, [onPlanDelete])

  // 初始化画布和生成树枝、叶子
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 生成树枝和叶子
    const newBranches = generateBranches(canvas.width, canvas.height)
    const newLeaves = generateLeaves(plans, newBranches)
    
    setBranches(newBranches)
    setLeaves(newLeaves)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [plans, generateBranches, generateLeaves])

  // 启动动画
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // 暴露快照方法给父组件
  useImperativeHandle(ref, () => ({
    getSnapshotDataUrl: () => {
      const dataUrl = lastFrameDataUrlRef.current || canvasRef.current?.toDataURL('image/png') || ''
      return dataUrl || null
    }
  }), [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: 'pointer',
          borderRadius: '8px'
        }}
      />

      {/* 保存今日树图按钮 */}
      <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 2 }}>
        <Tooltip title="保存今日树图（PNG）">
          <Button
            size="small"
            onClick={async () => {
              try {
                const dataUrl = lastFrameDataUrlRef.current || canvasRef.current?.toDataURL('image/png') || ''
                if (!dataUrl) {
                  message.error('当前画面不可用')
                  return
                }
                const res = await fetch('/api/tree-snapshots', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageData: dataUrl })
                })
                if (res.ok) {
                  const j = await res.json()
                  message.success('已保存今日树图')
                } else {
                  message.error('保存失败')
                }
              } catch (e) {
                message.error('保存失败')
              }
            }}
          >保存树图</Button>
        </Tooltip>
      </div>
      
      {/* 计划详情模态框 */}
      <Modal
        title="计划详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => selectedLeaf && handlePlanEdit(selectedLeaf.plan)}>
            编辑
          </Button>,
          <Button 
            key="toggle" 
            type={selectedLeaf?.plan.status === 'COMPLETED' ? 'default' : 'primary'}
            onClick={() => selectedLeaf && handlePlanToggle(selectedLeaf.plan.id)}
          >
            {selectedLeaf?.plan.status === 'COMPLETED' ? '标记未完成' : '标记完成'}
          </Button>,
          <Button 
            key="delete" 
            danger 
            onClick={() => selectedLeaf && handlePlanDelete(selectedLeaf.plan.id)}
          >
            删除
          </Button>
        ]}
        style={{ top: 20 }}
      >
        {selectedLeaf && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>标题：</Text>
                <Text>{selectedLeaf.plan.title}</Text>
              </div>
              
              {selectedLeaf.plan.description && (
                <div>
                  <Text strong>描述：</Text>
                  <Text>{selectedLeaf.plan.description}</Text>
                </div>
              )}
              
              <div>
                <Text strong>状态：</Text>
                <Tag 
                  color={selectedLeaf.plan.status === 'COMPLETED' ? 'green' : 'blue'}
                  icon={selectedLeaf.plan.status === 'COMPLETED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  {selectedLeaf.plan.status === 'COMPLETED' ? '已完成' : '进行中'}
                </Tag>
              </div>
              
              <div>
                <Text strong>优先级：</Text>
                <Tag 
                  color={
                    selectedLeaf.plan.priority === 'HIGH' ? 'red' :
                    selectedLeaf.plan.priority === 'MEDIUM' ? 'orange' : 'green'
                  }
                  icon={selectedLeaf.plan.priority === 'HIGH' ? <ExclamationCircleOutlined /> : undefined}
                >
                  {selectedLeaf.plan.priority === 'HIGH' ? '高' :
                   selectedLeaf.plan.priority === 'MEDIUM' ? '中' : '低'}
                </Tag>
              </div>
              
              {selectedLeaf.plan.dueDate && (
                <div>
                  <Text strong>截止日期：</Text>
                  <Text>{dayjs(selectedLeaf.plan.dueDate).format('YYYY-MM-DD HH:mm')}</Text>
                </div>
              )}
              
              <div>
                <Text strong>创建时间：</Text>
                <Text>{dayjs(selectedLeaf.plan.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default forwardRef(LifeTreeCanvas)
