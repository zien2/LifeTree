'use client'

import { useState, useEffect, Suspense } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Checkbox, Alert } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const { Title, Text } = Typography

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm()

  // 检查URL参数中的验证状态
  useEffect(() => {
    const verified = searchParams?.get('verified')
    if (verified === 'success') {
      message.success('邮箱验证成功！现在可以登录了')
    } else if (verified === 'already') {
      message.info('该邮箱已经验证过了')
    }
  }, [searchParams])

  const onFinish = async (values: {
    email: string
    password: string
    remember?: boolean
  }) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/auth/login', {
        email: values.email,
        password: values.password,
      })

      if (response.data.success) {
        // 保存 Token 和用户信息到localStorage
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))

        // 同时设置cookie，供中间件使用
        document.cookie = `token=${response.data.data.token}; path=/; max-age=${response.data.data.expiresIn}; SameSite=Lax`

        message.success('登录成功！')

        // 获取重定向URL，如果没有则跳转到仪表板
        const redirectUrl = searchParams?.get('redirect') || '/dashboard'
        
        // 直接跳转，不使用setTimeout
        window.location.href = redirectUrl
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      
      // 处理错误信息
      const errorMessage =
        error.response?.data?.error || '登录失败，请稍后重试'
      const errorCode = error.response?.data?.code
      
      // 特殊处理邮箱未验证的情况
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setShowResendButton(true)
        setUserEmail(values.email)
        message.error({
          content: errorMessage,
          duration: 6,
        })
      } else {
        message.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // 快速填充测试账号
  const fillTestAccount = () => {
    form.setFieldsValue({
      email: 'zhangsan@lifetree.com',
      password: 'Test123456',
    })
    message.info('已填充测试账号')
  }

  // 重新发送验证邮件
  const handleResendVerification = async () => {
    if (!userEmail) {
      message.error('请先尝试登录')
      return
    }

    setResendingEmail(true)
    try {
      const response = await axios.post('/api/auth/resend-verification', {
        email: userEmail,
      })

      if (response.data.success) {
        message.success('验证邮件已重新发送，请查收！')
        setShowResendButton(false)
      }
    } catch (error: any) {
      console.error('重新发送失败:', error)
      message.error(error.response?.data?.error || '发送失败，请稍后重试')
    } finally {
      setResendingEmail(false)
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
          maxWidth: '450px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#ffffff' }}>
            🌳 欢迎回来
          </Title>
          <Text style={{ color: '#ffffff', opacity: 0.8, fontSize: '16px' }}>
            登录 LifeTree，继续您的成长之旅
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label={<span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500 }}>邮箱</span>}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#1890ff' }} />}
              placeholder="your@email.com"
              autoComplete="email"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#000000'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500 }}>密码</span>}
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入密码"
              autoComplete="current-password"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#000000'
              }}
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#ffffff' }}>记住我</Checkbox>
              </Form.Item>
              <Link href="/forgot-password">
                <Text style={{ fontSize: '14px', color: '#ffffff', opacity: 0.8 }}>
                  忘记密码？
                </Text>
              </Link>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: '12px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          {/* 邮箱未验证提示 */}
          {showResendButton && (
            <Alert
              message="邮箱未验证"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>您的邮箱还未验证，请先验证后再登录。</Text>
                  <Button
                    type="link"
                    onClick={handleResendVerification}
                    loading={resendingEmail}
                    style={{ padding: 0 }}
                  >
                    {resendingEmail ? '发送中...' : '重新发送验证邮件'}
                  </Button>
                </Space>
              }
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Space>
              <Text style={{ color: '#ffffff', opacity: 0.8 }}>还没有账号？</Text>
              <Link href="/register">
                <Text style={{ color: '#1890ff', fontWeight: 500 }}>立即注册</Text>
              </Link>
            </Space>
          </div>

          {/* 测试账号快速登录 */}
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={fillTestAccount} 
              size="small"
              style={{ color: '#52c41a', fontWeight: 500 }}
            >
              使用测试账号
            </Button>
          </div>
        </Form>

        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Text style={{ fontSize: '12px', color: '#ffffff', opacity: 0.9 }}>
            🧪 测试账号：zhangsan@lifetree.com / Test123456
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LoginContent />
    </Suspense>
  )
}

