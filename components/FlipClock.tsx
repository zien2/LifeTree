'use client'

import { useEffect, useState } from 'react'

interface FlipDigitProps {
  value: string
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value }) => {
  return (
    <div
      style={{
        width: '60px',
        height: '90px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 数字显示 */}
      <div
        style={{
          color: '#fff',
          fontSize: '78px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-1.5px',
        }}
      >
        {value}
      </div>

      {/* 中间分隔线 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(0, 0, 0, 0.3)',
          transform: 'translateY(-0.5px)',
        }}
      />
      
      {/* 上半部分高光 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
          borderRadius: '8px 8px 0 0',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

const FlipClock: React.FC = () => {
  const [time, setTime] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setTime({ hours, minutes, seconds })
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* 时钟显示 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        {/* 小时 */}
        <FlipDigit value={time.hours[0]} />
        <FlipDigit value={time.hours[1]} />
        
        {/* 冒号 */}
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '48px',
            fontWeight: 700,
            margin: '0 4px',
          }}
        >
          :
        </div>

        {/* 分钟 */}
        <FlipDigit value={time.minutes[0]} />
        <FlipDigit value={time.minutes[1]} />
        
        {/* 冒号 */}
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '48px',
            fontWeight: 700,
            margin: '0 4px',
          }}
        >
          :
        </div>

        {/* 秒 */}
        <FlipDigit value={time.seconds[0]} />
        <FlipDigit value={time.seconds[1]} />
      </div>

      {/* 日期显示 */}
      <div
        style={{
          textAlign: 'left',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        {new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      </div>
    </div>
  )
}

export default FlipClock

