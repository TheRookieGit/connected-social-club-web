#!/bin/bash

# 用户照片存储系统一键设置脚本
echo "🚀 用户照片存储系统一键设置"
echo "================================"

echo ""
echo "📋 这个脚本将自动完成以下操作："
echo "1. 在 Supabase SQL Editor 中运行自动化设置脚本"
echo "2. 创建存储桶和权限策略"
echo "3. 设置数据库字段和索引"
echo "4. 验证设置结果"
echo ""

echo "🛠️ 操作步骤："
echo ""

echo "步骤 1: 打开 Supabase 控制台"
echo "   - 访问: https://supabase.com/dashboard"
echo "   - 选择您的项目"
echo ""

echo "步骤 2: 运行自动化脚本"
echo "   - 点击左侧菜单 'SQL Editor'"
echo "   - 点击 'New query'"
echo "   - 复制以下内容到编辑器中："
echo ""

echo "=========================================="
echo "复制以下内容到 SQL Editor："
echo "=========================================="

# 读取并显示 SQL 脚本内容
if [ -f "setup_user_photos_storage_auto.sql" ]; then
    cat setup_user_photos_storage_auto.sql
else
    echo "错误：找不到 setup_user_photos_storage_auto.sql 文件"
    exit 1
fi

echo "=========================================="
echo ""

echo "步骤 3: 执行脚本"
echo "   - 点击 'Run' 按钮执行脚本"
echo "   - 等待执行完成"
echo ""

echo "步骤 4: 验证结果"
echo "   - 检查执行结果，应该看到："
echo "     * 'Storage bucket created successfully!'"
echo "     * 'Storage policies created successfully!'"
echo "     * 'Database setup completed!'"
echo ""

echo "步骤 5: 测试功能"
echo "   - 访问: http://localhost:3000/test-photo-upload"
echo "   - 尝试上传照片"
echo ""

echo "✅ 完成！现在照片上传功能应该可以正常工作了！"
echo ""

echo "📚 如果遇到问题，请检查："
echo "   - SQL 脚本是否执行成功"
echo "   - 是否有错误信息"
echo "   - 存储桶是否在 Storage 页面中显示"
echo ""

echo "🔗 有用的链接："
echo "   - Supabase SQL Editor: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql"
echo "   - Storage 页面: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/storage"
echo ""

echo "📝 注意："
echo "   - 这个脚本会自动创建存储桶和权限策略"
echo "   - 不需要手动在 UI 中设置"
echo "   - 如果存储桶已存在，会更新其设置"
echo "   - 如果策略已存在，会先删除再重新创建"
echo "" 