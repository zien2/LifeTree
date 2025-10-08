'use client'

import { Button, Radio, Typography } from 'antd'
import { LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { Title } = Typography

interface CalendarHeaderProps {
  value: Dayjs
  onChange: (date: Dayjs) => void
  calendarMode: 'month' | 'year'
  setCalendarMode: (mode: 'month' | 'year') => void
  showAddModal: (date?: Dayjs) => void
  showTodayTasks: () => void
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  value,
  onChange,
  calendarMode,
  setCalendarMode,
  showAddModal,
  showTodayTasks
}) => {
  const currentMonth = value.format('YYYY年MM月')
  const currentYear = value.format('YYYY年')
  
  const onPrevious = () => {
    const newValue = calendarMode === 'month' ? value.subtract(1, 'month') : value.subtract(1, 'year')
    onChange(newValue)
  }
  
  const onNext = () => {
    const newValue = calendarMode === 'month' ? value.add(1, 'month') : value.add(1, 'year')
    onChange(newValue)
  }
  
  const onToday = () => {
    onChange(dayjs())
    showTodayTasks()
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '16px',
      padding: '16px',
      background: '#121212',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
    }}>
      <div>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          计划日历
        </Title>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          icon={<LeftOutlined />} 
          onClick={onPrevious} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff' 
          }} 
        />
        <Title level={4} style={{ margin: 0, color: '#fff', minWidth: '150px', textAlign: 'center' }}>
          {calendarMode === 'month' ? currentMonth : currentYear}
        </Title>
        <Button 
          icon={<RightOutlined />} 
          onClick={onNext} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff' 
          }} 
        />
        <Button 
          onClick={onToday} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff' 
          }}
        >
          今天
        </Button>
        <Radio.Group 
          value={calendarMode} 
          onChange={(e) => setCalendarMode(e.target.value)}
          buttonStyle="solid"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '2px'
          }}
        >
          <Radio.Button value="month">月</Radio.Button>
          <Radio.Button value="year">年</Radio.Button>
        </Radio.Group>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showAddModal(value)}
          style={{
            background: '#1890ff',
            borderColor: 'transparent',
            fontWeight: 500,
          }}
        >
          新增计划
        </Button>
      </div>
    </div>
  )
}

export default CalendarHeader
