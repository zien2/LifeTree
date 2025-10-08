#!/bin/bash
echo "🧪 测试邮件发送..."
echo ""
echo "📧 验证邮件将发送到：1561588898@qq.com"
echo ""

# 生成唯一邮箱
TEST_EMAIL="test$(date +%s)@example.com"

echo "正在注册测试账号：$TEST_EMAIL"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test123456\",
    \"name\": \"邮件测试用户\"
  }")

echo "$RESPONSE" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if echo "$RESPONSE" | grep -q '"emailVerificationSent": true'; then
    echo "✅ 成功！邮件已发送"
    echo "📬 请检查您的QQ邮箱：1561588898@qq.com"
    echo "📧 查看收件箱或垃圾邮件箱"
    echo ""
    echo "邮件主题：验证您的 LifeTree 邮箱"
    echo "发件人：LifeTree <1561588898@qq.com>"
elif echo "$RESPONSE" | grep -q '"success": false'; then
    echo "❌ 发送失败"
    echo ""
    echo "可能的原因："
    echo "1. 开发服务器未重启"
    echo "2. 授权码配置错误"
    echo "3. QQ邮箱SMTP服务未开启"
    echo ""
    echo "解决方法："
    echo "• 确认已重启开发服务器（Ctrl+C 后重新 npm run dev）"
    echo "• 检查 .env.local 文件中的授权码是否正确"
    echo "• 查看开发服务器控制台的详细错误信息"
else
    echo "⚠️  服务器可能未启动或未响应"
    echo "请先确保开发服务器正在运行：npm run dev"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
