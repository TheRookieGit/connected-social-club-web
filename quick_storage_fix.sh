#!/bin/bash

# 快速修复 Supabase Storage 问题
echo "🔧 Supabase Storage 快速修复脚本"
echo "=================================="

echo ""
echo "🚨 问题：存储桶创建失败"
echo "原因：Supabase Storage 的 RLS 策略阻止了程序自动创建存储桶"
echo ""

echo "📋 解决方案："
echo "1. 手动在 Supabase 控制台创建存储桶"
echo "2. 设置正确的权限策略"
echo "3. 运行数据库设置脚本"
echo ""

echo "🛠️ 立即操作步骤："
echo ""

echo "步骤 1: 登录 Supabase 控制台"
echo "   - 访问: https://supabase.com/dashboard"
echo "   - 选择您的项目"
echo ""

echo "步骤 2: 创建存储桶"
echo "   - 点击左侧菜单 'Storage'"
echo "   - 点击 'Create a new bucket'"
echo "   - 存储桶名称: user-photos"
echo "   - 勾选 'Public bucket'"
echo "   - 文件大小限制: 5MB"
echo "   - 允许的文件类型: image/jpeg, image/jpg, image/png, image/webp"
echo ""

echo "步骤 3: 设置权限策略"
echo "   - 点击刚创建的 'user-photos' 存储桶"
echo "   - 点击 'Policies' 标签页"
echo "   - 创建以下三个策略："
echo ""

echo "   策略 1 (INSERT):"
echo "   - 名称: Users can upload their own photos"
echo "   - 操作: INSERT"
echo "   - 条件: (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])"
echo ""

echo "   策略 2 (SELECT):"
echo "   - 名称: Anyone can view photos"
echo "   - 操作: SELECT"
echo "   - 条件: (bucket_id = 'user-photos')"
echo ""

echo "   策略 3 (DELETE):"
echo "   - 名称: Users can delete their own photos"
echo "   - 操作: DELETE"
echo "   - 条件: (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])"
echo ""

echo "步骤 4: 运行数据库脚本"
echo "   - 在 Supabase SQL Editor 中运行 setup_supabase_storage.sql"
echo ""

echo "步骤 5: 测试功能"
echo "   - 访问: http://localhost:3000/test-photo-upload"
echo "   - 尝试上传照片"
echo ""

echo "✅ 完成以上步骤后，照片上传功能应该可以正常工作！"
echo ""

echo "📚 详细文档："
echo "   - SUPABASE_STORAGE_SETUP.md"
echo "   - setup_supabase_storage.sql"
echo ""

echo "🔗 有用的链接："
echo "   - Supabase Storage 文档: https://supabase.com/docs/guides/storage"
echo "   - RLS 策略文档: https://supabase.com/docs/guides/auth/row-level-security"
echo "" 