'use client'

import { Button, Card, Typography, Space } from 'antd'
import { RocketOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import styles from './page.module.css'

const { Title, Paragraph } = Typography

export default function Home() {
  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={1} style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              🌳 LifeTree
            </Title>
            <Title level={3} type="secondary">
              让成长看得见
            </Title>
            <Paragraph style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
              通过计划管理与可视化，让抽象的自我提升过程变得直观可感知
            </Paragraph>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <CheckCircleOutlined style={{ fontSize: '3rem', color: '#52c41a' }} />
                  <Title level={4}>计划管理</Title>
                  <Paragraph type="secondary">
                    创建每日计划，设置优先级，跟踪执行进度
                  </Paragraph>
                </Space>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <RocketOutlined style={{ fontSize: '3rem', color: '#1890ff' }} />
                  <Title level={4}>生命树可视化</Title>
                  <Paragraph type="secondary">
                    计划状态转化为树木生长状态，直观展示成长
                  </Paragraph>
                </Space>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card hoverable>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <BarChartOutlined style={{ fontSize: '3rem', color: '#fa8c16' }} />
                  <Title level={4}>AI 成长分析</Title>
                  <Paragraph type="secondary">
                    智能分析计划数据，提供个性化成长建议
                  </Paragraph>
                </Space>
              </Card>
            </motion.div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Space size="middle">
              <Button type="primary" size="large" href="/register">
                立即注册
              </Button>
              <Button size="large" href="/login">
                登录
              </Button>
            </Space>
          </div>

          <Card style={{ marginTop: '2rem', background: 'rgba(255, 255, 255, 0.8)' }}>
            <Title level={5}>✨ 核心功能</Title>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>✅ 用户注册/登录，安全管理个人数据</li>
              <li>✅ 三级优先级（高/中/低）管理计划</li>
              <li>✅ 计划状态同步到生命树可视化</li>
              <li>✅ AI 自动分析计划成长性</li>
              <li>✅ 周期性完成率与趋势报告</li>
              <li>✅ 系统通知提醒重要事项</li>
            </ul>
          </Card>
        </Space>
      </motion.div>
    </div>
  )
}

