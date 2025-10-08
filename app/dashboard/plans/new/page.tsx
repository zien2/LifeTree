'use client'

import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function NewPlanPage() {
  return (
    <div>
      <Title level={2}>➕ 新建计划</Title>
      <Card style={{ marginTop: '24px' }}>
        <Paragraph>计划创建功能即将上线...</Paragraph>
      </Card>
    </div>
  )
}

