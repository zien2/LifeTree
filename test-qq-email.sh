#!/bin/bash
: "${TEST_RECIPIENT_EMAIL:?Set TEST_RECIPIENT_EMAIL to the QQ inbox used for this test}"
: "${TEST_USER_PASSWORD:?Set TEST_USER_PASSWORD to a non-production test password}"

echo "🧪 测试QQ邮箱发送功能"
echo ""
echo "📧 发送测试邮件到：$TEST_RECIPIENT_EMAIL"
echo ""

TEST_EMAIL="$TEST_RECIPIENT_EMAIL"

echo "注册测试账号：$TEST_EMAIL"
echo ""

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_USER_PASSWORD\",
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
