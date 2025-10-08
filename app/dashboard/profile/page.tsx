'use client'

import { Card, Descriptions, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Title } = Typography

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  return (
    <div>
      <Title level={2}>👤 个人信息</Title>
      <Card style={{ marginTop: '24px', background: '#121212', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <Descriptions 
          title="用户资料" 
          bordered 
          column={1} 
          labelStyle={{ color: '#ffffff', background: '#1f1f1f' }}
          contentStyle={{ color: '#ffffff', background: '#0a0a0a' }}
          style={{ color: '#ffffff' }}
        >
          <Descriptions.Item label="用户ID">{user?.id}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.name || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="邮箱验证">
            {user?.emailVerified ? '✅ 已验证' : '❌ 未验证'}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

