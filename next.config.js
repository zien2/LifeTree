/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd'],
  output: 'standalone',
  trailingSlash: false,
}

module.exports = nextConfig
