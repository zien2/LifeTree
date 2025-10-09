/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd'],
  // 禁用静态优化，强制动态渲染
  output: 'standalone',
  experimental: {
    // 禁用静态生成
    staticGenerationRetryCount: 0,
  },
  // 强制所有页面动态渲染
  trailingSlash: false,
}

module.exports = nextConfig

