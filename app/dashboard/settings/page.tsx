'use client'

import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function SettingsPage() {
  return (
    <div>
      <Title level={2}>⚙️ 系统设置</Title>
      <Card style={{ marginTop: '24px' }}>
        <Paragraph>系统设置功能即将上线...</Paragraph>
      </Card>
    </div>
  )
}

