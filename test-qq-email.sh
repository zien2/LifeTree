#!/bin/bash
echo "🧪 测试QQ邮箱发送功能"
echo ""
echo "📧 发送测试邮件到：1561588898@qq.com"
echo ""

# 生成随机邮箱避免重复注册
TEST_EMAIL="test$(date +%s)@example.com"

echo "注册测试账号：$TEST_EMAIL"
echo ""

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test123456\",
    \"name\": \"邮件测试\"
  }" 2>/dev/null | jq '.'

echo ""
echo "✅ 如果看到 \"emailVerificationSent\": true"
echo "   说明邮件发送成功，请检查您的QQ邮箱收件箱！"
echo ""
echo "❌ 如果看到错误信息："
echo "   1. 检查授权码是否正确（16位小写字母）"
echo "   2. 确认已重启开发服务器"
echo "   3. 查看服务器控制台的错误信息"

