'use client'

import { useState, useEffect, useCallback } from 'react'
import { Layout, Avatar, Dropdown, Space, Typography, Badge, Empty } from 'antd'
import {
  UserOutlined,
  DashboardOutlined,
  CheckSquareOutlined,
  BranchesOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  IdcardOutlined,
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import type { MenuProps } from 'antd'
import axios from 'axios'
import { getAuthUser, logout as authLogout, type AuthUser } from '@/lib/auth'

const { Header, Content } = Layout
const { Text } = Typography

interface Notification {
  id: string
  title: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const router = useRouter()

  const redirectToLogin = useCallback(() => {
    router.push('/login')
  }, [router])

  useEffect(() => {
    // 检查用户是否已登录
    const authUser = getAuthUser()
    
    if (!authUser) {
      // 用户未登录，重定向到登录页
      redirectToLogin()
      return
    }
    
    setUser(authUser)
    
    // 获取通知
    fetchNotifications()
    
    // 每30秒刷新一次通知
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [redirectToLogin])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        // 只显示系统类通知，过滤掉计划类通知
        const systemNotifications = response.data.data.notifications.filter(
          (n: Notification) => n.type === 'SYSTEM' || n.type === 'REMINDER' || n.type === 'ANALYSIS'
        )
        setNotifications(systemNotifications)
        
        // 只统计系统类未读通知
        const systemUnreadCount = systemNotifications.filter((n: Notification) => !n.isRead).length
        setUnreadCount(systemUnreadCount)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `/api/notifications/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (error) {
      console.error('全部标记已读失败:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNotifications()
    } catch (error) {
      console.error('删除通知失败:', error)
    }
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      onClick: () => router.push('/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: '个人信息',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      key: 'plans',
      icon: <CheckSquareOutlined />,
      label: '计划管理',
      onClick: () => router.push('/dashboard/plans'),
    },
    {
      key: 'tree',
      icon: <BranchesOutlined />,
      label: '生命树',
      onClick: () => router.push('/dashboard/tree'),
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
      onClick: () => router.push('/dashboard/analytics'),
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => router.push('/dashboard/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        authLogout()
        router.push('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: '#000000' }}>
      {/* 顶部导航栏 - 深色极简风格 */}
      <Header
        style={{
          padding: '0 48px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '64px',
        }}
      >
        {/* 左侧：Logo */}
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          onClick={() => router.push('/dashboard')}
        >
          <span style={{ fontSize: '24px' }}>🌳</span>
          <Text
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#fff',
              letterSpacing: '0.5px',
            }}
          >
            LifeTree
          </Text>
        </div>

        {/* 右侧：通知 + 用户信息 */}
        <Space size="large">
          {/* 通知按钮 */}
          <Dropdown
            open={notificationOpen}
            onOpenChange={setNotificationOpen}
            placement="bottomRight"
            overlayStyle={{
              marginTop: '8px',
              minWidth: '360px',
              maxHeight: '500px',
            }}
            dropdownRender={() => (
              <div
                style={{
                  background: '#000000',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px',
                }}
              >
                {/* 通知头部 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                    通知中心
                  </Text>
                  {unreadCount > 0 && (
                    <div
                      onClick={markAllAsRead}
                      style={{
                        cursor: 'pointer',
                        color: '#52c41a',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckOutlined />
                      全部已读
                    </div>
                  )}
                </div>

                {/* 通知列表 */}
                <div
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {notifications.length === 0 ? (
                    <Empty
                      description={<span style={{ color: '#999' }}>暂无通知</span>}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '40px 0' }}
                    />
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: notification.isRead ? 'transparent' : 'rgba(82, 196, 26, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = notification.isRead
                            ? 'transparent'
                            : 'rgba(82, 196, 26, 0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Text
                            style={{
                              color: notification.isRead ? '#bbb' : '#fff',
                              fontSize: '14px',
                              fontWeight: notification.isRead ? 400 : 600,
                            }}
                          >
                            {notification.title}
                          </Text>
                          <DeleteOutlined
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            style={{
                              color: 'rgba(255, 255, 255, 0.3)',
                              fontSize: '12px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ff4d4f'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <Text style={{ color: '#999', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                          {notification.content}
                        </Text>
                        <Text style={{ color: '#666', fontSize: '12px' }}>
                          {new Date(notification.createdAt).toLocaleString('zh-CN')}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined
                style={{
                  fontSize: '20px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              />
            </Badge>
          </Dropdown>

          {/* 用户菜单 */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            overlayStyle={{
              marginTop: '8px',
              minWidth: '200px',
            }}
            dropdownRender={(menu) => (
              <div
                style={{
                  background: '#000000',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px',
                }}
              >
                {menu}
              </div>
            )}
          >
            <Space
              style={{
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '24px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ background: '#1890ff' }}
              />
              <Text
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                }}
              >
                {user?.name || user?.email?.split('@')[0] || '用户'}
              </Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      {/* 主内容区 - 全屏铺满 */}
      <Content
        style={{
          padding: '16px 16px 16px 48px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Content>
    </Layout>
  )
}

