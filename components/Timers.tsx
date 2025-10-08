'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { message } from 'antd'

function formatHHMMSS(totalMs: number): string {
  const total = Math.max(0, Math.floor(totalMs / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Timers() {
  // Stopwatch (正计时)
  const [swRunning, setSwRunning] = useState(false)
  const [swElapsedMs, setSwElapsedMs] = useState(0)
  const swLastStartRef = useRef<number | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (swRunning) {
      // 使用 setInterval 每秒更新一次
      intervalId = setInterval(() => {
        setSwElapsedMs(prev => prev + 1000) // 每次增加1秒
      }, 1000)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [swRunning])

  const onSwStartPause = () => {
    if (!swRunning) {
      setSwRunning(true)
    } else {
      setSwRunning(false)
    }
  }
  
  const onSwReset = () => {
    setSwRunning(false)
    setSwElapsedMs(0)
  }

  // Countdown (倒计时)
  const [cdRunning, setCdRunning] = useState(false)
  const [cdTargetMs, setCdTargetMs] = useState<number>(0) // 目标剩余毫秒
  const [cdRemainMs, setCdRemainMs] = useState<number>(0)
  const [hInput, setHInput] = useState<string>('00')
  const [mInput, setMInput] = useState<string>('25')
  const [sInput, setSInput] = useState<string>('00')
  const cdEndTimeRef = useRef<number | null>(null)

  const inputTotalMs = useMemo(() => {
    const h = Math.max(0, parseInt(hInput || '0', 10) || 0)
    const m = Math.max(0, parseInt(mInput || '0', 10) || 0)
    const s = Math.max(0, parseInt(sInput || '0', 10) || 0)
    return (h * 3600 + m * 60 + s) * 1000
  }, [hInput, mInput, sInput])

  const applyCountdown = () => {
    setCdTargetMs(inputTotalMs)
    setCdRemainMs(inputTotalMs)
    setCdRunning(false)
    cdEndTimeRef.current = null
  }

  const onCdStartPause = () => {
    if (!cdRunning) {
      const base = cdRemainMs > 0 ? cdRemainMs : (cdTargetMs || inputTotalMs)
      setCdRemainMs(base)
      cdEndTimeRef.current = Date.now() + base
      setCdRunning(true)
    } else {
      setCdRunning(false)
      if (cdEndTimeRef.current) setCdRemainMs(Math.max(0, cdEndTimeRef.current - Date.now()))
      cdEndTimeRef.current = null
    }
  }

  const onCdReset = () => {
    setCdRunning(false)
    setCdRemainMs(cdTargetMs || inputTotalMs)
    cdEndTimeRef.current = null
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (cdRunning && cdEndTimeRef.current) {
      // 使用 setInterval 每秒更新一次
      intervalId = setInterval(() => {
        const remain = Math.max(0, cdEndTimeRef.current! - Date.now())
        setCdRemainMs(remain)
        
        if (remain <= 0) {
          setCdRunning(false)
          cdEndTimeRef.current = null
          message.success('倒计时结束')
          if (intervalId) clearInterval(intervalId)
        }
      }, 1000)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [cdRunning])

  const timeRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const boxStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '14px',
    padding: '16px',
    color: '#fff',
  }

  const btnStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.10)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  }

  const inputStyle: React.CSSProperties = {
    width: '52px',
    padding: '8px 10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontWeight: 600,
    textAlign: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%' }}>
      {/* 正计时 */}
      <div style={{ ...boxStyle, flex: 1 }}>
        <div style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>正计时</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '100px', fontWeight: 800, letterSpacing: '2px' }}>{formatHHMMSS(swElapsedMs)}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={btnStyle} onClick={onSwStartPause}>{swRunning ? '暂停' : '开始'}</button>
            <button style={btnStyle} onClick={onSwReset}>重置</button>
          </div>
        </div>
      </div>

      {/* 倒计时 */}
      <div style={{ ...boxStyle, flex: 1 }}>
        <div style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>倒计时</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <input value={hInput} onChange={(e) => setHInput(e.target.value.replace(/\D/g, '').slice(0, 3))} style={inputStyle} />
            <span>时</span>
            <input value={mInput} onChange={(e) => setMInput(e.target.value.replace(/\D/g, '').slice(0, 2))} style={inputStyle} />
            <span>分</span>
            <input value={sInput} onChange={(e) => setSInput(e.target.value.replace(/\D/g, '').slice(0, 2))} style={inputStyle} />
            <span>秒</span>
            <button style={btnStyle} onClick={applyCountdown}>设置</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '100px', fontWeight: 800, letterSpacing: '2px' }}>{formatHHMMSS(cdRemainMs || cdTargetMs || inputTotalMs)}</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={btnStyle} onClick={onCdStartPause}>{cdRunning ? '暂停' : '开始'}</button>
              <button style={btnStyle} onClick={onCdReset}>重置</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}