# 城市显示格式示例

## 新的显示格式

### 标准格式
**城市名, 邮编, 州名**

### 示例

#### 拉斯维加斯地区
- `Las Vegas, 89113, Nevada`
- `Las Vegas, 89102, Nevada`
- `Las Vegas, 89117, Nevada`

#### 其他城市
- `New York, 10001, New York`
- `Los Angeles, 90210, California`
- `Chicago, 60601, Illinois`
- `Miami, 33101, Florida`

#### 特殊情况
- `Clark County` (当只有县信息，没有具体城市和邮编时)

## 显示规则

### 1. 城市名优先级
1. `city` - 城市
2. `town` - 城镇
3. `village` - 村庄
4. `suburb` - 郊区
5. `city_district` - 城区

### 2. 邮编显示
- 如果有邮编信息，显示在逗号后
- 验证邮编的有效性（拉斯维加斯地区：89101-89199，除89184）

### 3. 州名显示
- 如果有州信息，显示在邮编后
- 使用标准的州名缩写或全名

### 4. 分隔符
- 使用逗号和空格分隔各部分
- 格式：`城市, 邮编, 州`

## 组件使用

### LocationDisplay 组件
```tsx
// 紧凑模式
<LocationDisplay compact={true} />

// 完整模式
<LocationDisplay compact={false} />
```

### 显示效果
- **紧凑模式**：`Las Vegas, 89113, Nevada`
- **完整模式**：显示在卡片中，包含更多详细信息

## 技术实现

### 地址解析逻辑
```typescript
const parts = []
parts.push(addressInfo.city)
if (addressInfo.postal_code) {
  parts.push(addressInfo.postal_code)
}
if (addressInfo.state) {
  parts.push(addressInfo.state)
}
return parts.join(', ')
```

### API 查询策略
1. **高精度查询**（zoom=20）- 优先使用
2. **中等精度查询**（zoom=18）- 备用
3. **低精度查询**（zoom=16）- 最后备用

### 缓存机制
- 位置信息缓存：5分钟
- 地址信息缓存：1小时
- 支持手动清除缓存

## 测试页面

### 测试地址
- `/test-city-format` - 测试新的显示格式
- `/test-address-debug` - 调试地址解析
- `/test-zip-accuracy` - 测试邮编准确性

### 预期结果
所有页面都应该显示统一的格式：`城市名, 邮编, 州名` 