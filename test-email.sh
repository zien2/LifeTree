#!/bin/bash
echo "🧪 测试邮箱验证功能"
echo ""
echo "📧 请访问以下地址注册新用户："
echo "http://localhost:3000/register"
echo ""
echo "或使用API测试："
echo ""
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "Test123456",
    "name": "测试用户"
  }' | jq '.'
