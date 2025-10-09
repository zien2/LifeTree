'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, Typography, Button, Space, Result } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography

function VerifyEmailContent() {
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 从URL参数获取邮箱
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // 如果没有邮箱参数，跳转到登录页
      router.push('/login')
    }
  }, [searchParams, router])

  const handleResend = async () => {
    if (!email) return

    setResending(true)
    try {
      await axios.post('/api/auth/resend-verification', { email })
      alert('验证邮件已重新发送！')
    } catch (error) {
      alert('发送失败，请稍后重试')
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Result
          icon={<MailOutlined style={{ color: '#1890ff' }} />}
          title={<span style={{ color: '#ffffff' }}>验证邮件已发送</span>}
          subTitle={
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ color: '#ffffff', opacity: 0.9 }}>
                我们已向 <strong style={{ color: '#1890ff' }}>{email}</strong> 发送了一封验证邮件
              </Text>
              <Text style={{ color: '#ffffff', opacity: 0.7 }}>
                请查收邮件并点击验证链接完成注册
              </Text>
            </Space>
          }
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleResend}
                loading={resending}
                block
              >
                重新发送验证邮件
              </Button>
              <Button size="large" onClick={() => router.push('/login')} block>
                返回登录
              </Button>
            </Space>
          }
        />

        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Title level={5} style={{ marginTop: 0, color: '#ffffff' }}>
            📧 没收到邮件？
          </Title>
          <Space direction="vertical" size="small">
            <Text style={{ color: '#ffffff', opacity: 0.8 }}>• 请检查垃圾邮件/广告邮件箱</Text>
            <Text style={{ color: '#ffffff', opacity: 0.8 }}>• 验证邮件可能需要1-2分钟送达</Text>
            <Text style={{ color: '#ffffff', opacity: 0.8 }}>• 确认邮箱地址拼写正确</Text>
            <Text style={{ color: '#ffffff', opacity: 0.8 }}>• 点击上方按钮重新发送</Text>
          </Space>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 验证后即可登录使用所有功能
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

