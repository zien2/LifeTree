'use client'

import { useEffect, useRef, useState } from 'react'

// 稳定哈希：将字符串映射为非负整数，用于稳定分配叶子到不同枝点
function stableHash(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i)
    hash |= 0 // 转为 32 位整数
  }
  return Math.abs(hash)
}

interface Plan {
  id: string
  title: string
  status: string
  priority?: string
}

interface Leaf {
  id: string
  x: number
  y: number
  anchorX: number
  anchorY: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  status: 'growing' | 'completed' | 'falling'
  alpha: number
  fallSpeed: number
  baseRadius: number
  phase: number
}

interface LifeTreeCanvasProps {
  plans?: Plan[]
}

export default function LifeTreeCanvas({ plans = [] }: LifeTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const leavesRef = useRef<Leaf[]>([])
  const branchPositions = useRef<{ x: number; y: number }[]>([])

  // 按画布尺寸计算潜在叶子附着点
  const computeBranchPositions = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const centerX = width / 2
    const bottomY = height
    const positions: { x: number; y: number }[] = []

    const trunkHeight = Math.max(180, height * 0.52)
    const baseLength = Math.max(110, height * 0.22)
    const maxDepth = 4

    const generate = (
      startX: number,
      startY: number,
      length: number,
      angle: number,
      depth: number
    ) => {
      if (depth === 0 || length < 14) return

      const endX = startX + length * Math.cos(angle)
      const endY = startY + length * Math.sin(angle)

    for (let i = 0.25; i <= 1; i += 0.25) {
        positions.push({
          x: startX + (endX - startX) * i,
          y: startY + (endY - startY) * i,
        })
      }

      const nextLen = length * 0.78
      generate(endX, endY, nextLen, angle - 0.35, depth - 1)
      generate(endX, endY, nextLen, angle + 0.35, depth - 1)
    }

    generate(centerX, bottomY - trunkHeight, baseLength, -Math.PI / 2 - 0.4, maxDepth)
    generate(centerX, bottomY - trunkHeight, baseLength, -Math.PI / 2 + 0.4, maxDepth)
    branchPositions.current = positions
  }

  // 初始化枝位置
  useEffect(() => {
    computeBranchPositions()
  }, [])

  // 根据计划数据更新叶子
  useEffect(() => {
    if (!plans || plans.length === 0) {
      setLeaves([])
      return
    }

    if (!branchPositions.current.length) {
      computeBranchPositions()
    }

    const newLeaves: Leaf[] = plans.map((plan, index) => {
      const existingLeaf = leaves.find((l) => l.id === plan.id)
      
      if (existingLeaf) {
        // 更新现有叶子的状态
        return {
          ...existingLeaf,
          color: plan.status === 'COMPLETED' ? '#52c41a' : '#f1c40f',
          status: plan.status === 'COMPLETED' ? 'completed' : 'growing',
        }
      }

      // 创建新叶子
      const count = branchPositions.current.length
      const hashed = count ? stableHash(plan.id) : 0
      // 结合索引做扰动，进一步分散
      const chosenIndex = count ? (hashed + index * 7) % count : 0
      const position = branchPositions.current[chosenIndex] || {
        x: 400,
        y: 300,
      }

      const anchorX = position.x + (Math.random() - 0.5) * 16
      const anchorY = position.y + (Math.random() - 0.5) * 16
      const baseRadius = 10 + Math.random() * 14
      const phase = Math.random() * Math.PI * 2

      return {
        id: plan.id,
        x: anchorX,
        y: anchorY,
        anchorX,
        anchorY,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 14 + Math.random() * 8,
        color: plan.status === 'COMPLETED' ? '#52c41a' : '#f1c40f',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: plan.status === 'COMPLETED' ? 0 : (Math.random() - 0.5) * 0.015,
        status: plan.status === 'COMPLETED' ? 'completed' : 'growing',
        alpha: 1,
        fallSpeed: 0,
        baseRadius,
        phase,
      }
    })

    setLeaves(newLeaves)
    leavesRef.current = newLeaves
  }, [plans])

  // Canvas 渲染
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const resizeCanvas = () => {
      const cssW = canvas.offsetWidth
      const cssH = canvas.offsetHeight
      if (cssW === 0 || cssH === 0) return
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      computeBranchPositions()
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 绘制树干和树枝
    const drawTree = () => {
      const cssWidth = canvas.width / dpr
      const cssHeight = canvas.height / dpr
      const centerX = cssWidth / 2
      const bottomY = cssHeight

      const trunkHeight = Math.max(180, cssHeight * 0.52)

      const trunkGradient = ctx.createLinearGradient(centerX, bottomY, centerX, bottomY - trunkHeight)
      trunkGradient.addColorStop(0, 'rgba(101, 67, 33, 0.8)')
      trunkGradient.addColorStop(1, 'rgba(160, 110, 60, 0.6)')

      ctx.strokeStyle = trunkGradient
      ctx.lineWidth = Math.max(18, cssHeight * 0.032)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(centerX, bottomY)
      ctx.lineTo(centerX, bottomY - trunkHeight)
      ctx.stroke()

      const drawBranchBezier = (
        startX: number,
        startY: number,
        length: number,
        angle: number,
        depth: number
      ) => {
        if (depth === 0 || length < 10) return

        const endX = startX + length * Math.cos(angle)
        const endY = startY + length * Math.sin(angle)

        const cpOffset = length * 0.4
        const perpAngle = angle + Math.PI / 2
        const cp1x = startX + (length * 0.3) * Math.cos(angle) + cpOffset * 0.25 * Math.cos(perpAngle)
        const cp1y = startY + (length * 0.3) * Math.sin(angle) + cpOffset * 0.25 * Math.sin(perpAngle)
        const cp2x = startX + (length * 0.7) * Math.cos(angle) - cpOffset * 0.2 * Math.cos(perpAngle)
        const cp2y = startY + (length * 0.7) * Math.sin(angle) - cpOffset * 0.2 * Math.sin(perpAngle)

        const alpha = 0.55 - depth * 0.07
        ctx.strokeStyle = `rgba(160, 110, 60, ${Math.max(0.18, alpha)})`
        ctx.lineWidth = Math.max(2, depth * 2.6)
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
        ctx.stroke()

        const nextLen = length * 0.75
        drawBranchBezier(endX, endY, nextLen, angle - 0.33, depth - 1)
        drawBranchBezier(endX, endY, nextLen, angle + 0.33, depth - 1)
      }

      drawBranchBezier(centerX, bottomY - trunkHeight, Math.max(120, cssHeight * 0.22), -Math.PI / 2 - 0.38, 4)
      drawBranchBezier(centerX, bottomY - trunkHeight, Math.max(120, cssHeight * 0.22), -Math.PI / 2 + 0.38, 4)
    }

    // 绘制叶子
    const drawLeaf = (leaf: Leaf) => {
      ctx.save()
      const renderYOffset = Math.max(24, (canvas.height / dpr) * 0.06)
      ctx.translate(leaf.x, leaf.y + renderYOffset)
      ctx.rotate(leaf.rotation)
      ctx.globalAlpha = leaf.alpha

      // 叶子形状（渐变与阴影，高级质感）
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, leaf.size * 1.6)
      const base = leaf.color
      grd.addColorStop(0, base + 'cc')
      grd.addColorStop(1, base + '66')
      ctx.fillStyle = grd
      ctx.shadowColor = leaf.status === 'completed' ? '#52c41a88' : '#f1c40f66'
      ctx.shadowBlur = 8

      ctx.beginPath()
      ctx.moveTo(0, -leaf.size * 1.6)
      ctx.quadraticCurveTo(leaf.size, 0, 0, leaf.size * 1.6)
      ctx.quadraticCurveTo(-leaf.size, 0, 0, -leaf.size * 1.6)
      ctx.fill()

      // 发光效果
      if (leaf.status === 'completed') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, leaf.size * 2.5)
        gradient.addColorStop(0, `${leaf.color}60`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, leaf.size * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    // 动画循环
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawTree()

      // 使用 ref 进行逐帧更新，避免触发 React 重渲染
      const updatedLeaves: Leaf[] = []
      for (const leaf of leavesRef.current) {
        const t = Date.now() * 0.001
        if (leaf.status === 'completed') {
          // 围绕锚点轻微摆动（更小振幅，避免越界）
          leaf.x = leaf.anchorX + Math.sin(t + leaf.phase) * (leaf.baseRadius * 0.3)
          leaf.y = leaf.anchorY + Math.cos(t * 0.9 + leaf.phase) * (leaf.baseRadius * 0.2)
        } else if (leaf.status === 'falling') {
          leaf.y += leaf.fallSpeed
          leaf.fallSpeed += 0.2
          leaf.rotation += leaf.rotationSpeed * 2
          leaf.alpha -= 0.01
        } else {
          // 围绕锚点的摆动（未完成），振幅适中
          leaf.x = leaf.anchorX + Math.sin(t * 1.2 + leaf.phase) * (leaf.baseRadius * 0.5)
          leaf.y = leaf.anchorY + Math.cos(t * 1.0 + leaf.phase) * (leaf.baseRadius * 0.4)
          leaf.rotation += leaf.rotationSpeed
        }

        // 位置钳制：不允许飘出屏幕
        const cssWidth = canvas.width / dpr
        const cssHeight = canvas.height / dpr
        const margin = 16
        const bottomKeep = 100 // 离底部预留一些空间
        if (leaf.x < margin) leaf.x = margin
        if (leaf.x > cssWidth - margin) leaf.x = cssWidth - margin
        if (leaf.y < margin) leaf.y = margin
        if (leaf.y > cssHeight - bottomKeep) leaf.y = cssHeight - bottomKeep

        if (leaf.alpha > 0 && leaf.y < canvas.height + 50) {
          updatedLeaves.push(leaf)
        }

        drawLeaf(leaf)
      }
      leavesRef.current = updatedLeaves

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [leaves])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  )
}

