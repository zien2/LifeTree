'use client'

import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function ChangePasswordPage() {
  return (
    <div>
      <Title level={2}>🔑 修改密码</Title>
      <Card style={{ marginTop: '24px' }}>
        <Paragraph>修改密码功能即将上线...</Paragraph>
      </Card>
    </div>
  )
}

