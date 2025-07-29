'use client'

import LocationDisplay from '@/components/LocationDisplay'

export default function TestCityFormat() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            城市显示格式测试
          </h1>
          
          <p className="text-gray-600 mb-6">
            测试新的地址显示格式：城市+邮编+州
          </p>
          
          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <h2 className="text-lg font-medium text-blue-900 mb-2">新的显示格式</h2>
            <p className="text-blue-800 text-sm">
              • <strong>紧凑模式</strong>：Las Vegas, 89113, Nevada<br/>
              • <strong>完整模式</strong>：Las Vegas, 89113, Nevada<br/>
              • <strong>格式说明</strong>：城市名, 邮编, 州名
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 紧凑模式 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">紧凑模式</h2>
            <LocationDisplay compact={true} showRefresh={true} />
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <p className="text-gray-600">预期格式：</p>
              <p className="font-mono text-gray-800">Las Vegas, 89113, Nevada</p>
            </div>
          </div>

          {/* 完整模式 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">完整模式</h2>
            <LocationDisplay compact={false} showRefresh={true} />
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <p className="text-gray-600">预期格式：</p>
              <p className="font-mono text-gray-800">Las Vegas, 89113, Nevada</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">格式说明</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">显示规则</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 城市名：优先显示具体城市名，如 &quot;Las Vegas&quot;</li>
                <li>• 邮编：如果有邮编信息，显示在逗号后</li>
                <li>• 州名：如果有州信息，显示在邮编后</li>
                <li>• 分隔符：使用逗号和空格分隔各部分</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">示例</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <span className="font-mono">Las Vegas, 89113, Nevada</span></p>
                <p>• <span className="font-mono">New York, 10001, New York</span></p>
                <p>• <span className="font-mono">Los Angeles, 90210, California</span></p>
                <p>• <span className="font-mono">Clark County</span> (当只有县信息时)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 