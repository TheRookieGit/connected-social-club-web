# Vercel缓存问题解决方案

## 问题描述

在Vercel生产环境中，用户个人信息页面在编辑之后不会显示在前端，但在Supabase数据库中确实有保存更新。这是一个典型的Vercel缓存问题。

## 问题原因

Vercel有多层缓存机制：
1. **Edge缓存**：CDN级别的缓存
2. **函数缓存**：Serverless函数的缓存
3. **浏览器缓存**：客户端缓存

## 解决方案

### 1. API路由缓存控制

在API路由中添加强缓存控制头：

```typescript
// app/api/user/profile/route.ts
export const dynamic = 'force-dynamic'

// 在响应中添加缓存控制头
const response = new NextResponse(
  JSON.stringify(responseData),
  {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-cache',
      'Vercel-Cache-Control': 'no-cache',
      'X-Vercel-Cache': 'MISS'
    }
  }
)
```

### 2. Vercel配置文件

在 `vercel.json` 中添加路由级别的缓存控制：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/user/profile",
      "headers": {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-cache",
        "Vercel-Cache-Control": "no-cache"
      }
    },
    {
      "src": "/api/(.*)",
      "headers": {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
      }
    }
  ]
}
```

### 3. 前端请求缓存控制

在前端请求中添加缓存控制头：

```typescript
const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})
```

### 4. 环境变量检查

确保在Vercel中正确设置了所有环境变量：

```bash
# 在Vercel Dashboard中设置以下环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

### 5. 部署步骤

1. **提交代码更改**：
   ```bash
   git add .
   git commit -m "修复Vercel缓存问题"
   git push
   ```

2. **重新部署**：
   ```bash
   vercel --prod
   ```

3. **清除Vercel缓存**：
   - 在Vercel Dashboard中，进入项目设置
   - 找到"Functions"部分
   - 点击"Clear Cache"按钮

### 6. 测试验证

使用专门的测试页面验证修复效果：

1. 访问 `/test-vercel-cache` 页面
2. 测试获取和更新用户资料
3. 检查控制台日志确认缓存控制头是否正确设置

## 常见问题排查

### 问题1：更新后仍然显示旧数据

**解决方案**：
1. 检查浏览器开发者工具的网络面板
2. 确认请求头中包含正确的缓存控制
3. 检查Vercel函数日志

### 问题2：API响应被缓存

**解决方案**：
1. 在API路由中添加 `export const dynamic = 'force-dynamic'`
2. 确保响应头包含所有必要的缓存控制指令
3. 在请求URL中添加时间戳参数

### 问题3：环境变量问题

**解决方案**：
1. 在Vercel Dashboard中检查环境变量
2. 确保所有必需的环境变量都已设置
3. 重新部署项目

## 监控和调试

### 1. 添加日志

在API路由中添加详细的日志：

```typescript
console.log('API请求时间:', new Date().toISOString())
console.log('请求头:', Object.fromEntries(request.headers.entries()))
console.log('响应头:', Object.fromEntries(response.headers.entries()))
```

### 2. 使用Vercel Analytics

在Vercel Dashboard中启用Analytics功能，监控API性能。

### 3. 检查函数日志

在Vercel Dashboard中查看函数执行日志，确认缓存控制是否生效。

## 最佳实践

1. **始终使用 `export const dynamic = 'force-dynamic'`** 对于需要实时数据的API路由
2. **添加时间戳参数** 到请求URL中避免浏览器缓存
3. **使用强缓存控制头** 确保所有缓存层都被禁用
4. **定期测试** 生产环境的功能
5. **监控日志** 及时发现和解决问题

## 相关文件

- `app/api/user/profile/route.ts` - API路由
- `vercel.json` - Vercel配置
- `components/ProfileModal.tsx` - 前端组件
- `app/test-vercel-cache/page.tsx` - 测试页面 