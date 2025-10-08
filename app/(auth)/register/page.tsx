'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const { Title, Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [form] = Form.useForm()

  const onFinish = async (values: {
    email: string
    password: string
    name: string
  }) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/auth/register', {
        email: values.email,
        password: values.password,
        name: values.name,
      })

      if (response.data.success) {
        // 注意：不保存Token，因为用户需要先验证邮箱
        
        // 显示成功消息
        message.success('注册成功！请查收验证邮件')

        // 如果有邮件预览链接（开发模式）
        if (response.data.data.emailPreviewUrl) {
          console.log('📧 邮件预览:', response.data.data.emailPreviewUrl)
          message.info('开发模式：查看控制台获取邮件预览链接', 5)
        }

        // 跳转到邮箱验证提示页面
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
        }, 1500)
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      
      // 处理错误信息
      const errorMessage =
        error.response?.data?.error || '注册失败，请稍后重试'
      message.error(errorMessage)
    } finally {
      setLoading(false)
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
            🌳 注册 LifeTree
          </Title>
          <Text style={{ color: '#ffffff', opacity: 0.8, fontSize: '16px' }}>
            创建您的账号，开始成长之旅
          </Text>
        </div>

        <Form
          form={form}
          name="register"
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
            name="name"
            label={<span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500 }}>昵称</span>}
            rules={[
              { required: false },
              { min: 2, message: '昵称至少需要2个字符' },
              { max: 50, message: '昵称不能超过50个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入昵称（可选）"
              autoComplete="name"
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
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少需要8个字符' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '密码必须包含大小写字母和数字',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入密码"
              autoComplete="new-password"
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
            name="confirmPassword"
            label={<span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500 }}>确认密码</span>}
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#000000'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '12px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Text style={{ color: '#ffffff', opacity: 0.8 }}>已有账号？</Text>
              <Link href="/login">
                <Text style={{ color: '#1890ff', fontWeight: 500 }}>立即登录</Text>
              </Link>
            </Space>
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
            💡 密码要求：至少8个字符，包含大小写字母和数字
          </Text>
        </div>
      </Card>
    </div>
  )
}

