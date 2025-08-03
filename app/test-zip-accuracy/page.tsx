'use client'

import { useState } from 'react'
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react'

export default function TestZipAccuracy() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const testZipAccuracy = async () => {
    setIsLoading(true)
    setError('')
    setResults([])

    try {
      // 获取当前位置
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude: lat, longitude: lng } = position.coords
      console.log('测试坐标:', { lat, lng })

      // 测试不同的查询参数
      const testQueries = [
        { name: '高精度 (zoom=20)', zoom: 20 },
        { name: '中高精度 (zoom=18)', zoom: 18 },
        { name: '中等精度 (zoom=16)', zoom: 16 },
        { name: '低精度 (zoom=14)', zoom: 14 },
        { name: '最低精度 (zoom=10)', zoom: 10 }
      ]

      const testResults = []

      for (const query of testQueries) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=${query.zoom}&accept-language=en-US&addressdetails=1`
          )
          
          if (response.ok) {
            const data = await response.json()
            testResults.push({
              query: query.name,
              data: data,
              hasCity: !!(data.address?.city || data.address?.town || data.address?.village || data.address?.suburb),
              hasPostcode: !!data.address?.postcode,
              postcode: data.address?.postcode,
              addresstype: data.addresstype,
              display_name: data.display_name
            })
          }
        } catch (error) {
          console.error(`查询失败 ${query.name}:`, error)
        }
      }

      setResults(testResults)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const validLasVegasZipCodes = [
    '89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110',
    '89111', '89112', '89113', '89114', '89115', '89116', '89117', '89118', '89119', '89120',
    '89121', '89122', '89123', '89124', '89125', '89126', '89127', '89128', '89129', '89130',
    '89131', '89132', '89133', '89134', '89135', '89136', '89137', '89138', '89139', '89140',
    '89141', '89142', '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89150',
    '89151', '89152', '89153', '89154', '89155', '89156', '89157', '89158', '89159', '89160',
    '89161', '89162', '89163', '89164', '89165', '89166', '89167', '89168', '89169', '89170',
    '89171', '89172', '89173', '89174', '89175', '89176', '89177', '89178', '89179', '89180',
    '89181', '89182', '89183', '89185', '89186', '89187', '89188', '89189', '89190', '89191',
    '89193', '89194', '89195', '89196', '89197', '89198', '89199'
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-blue-500" />
            邮编准确性测试
          </h1>
          
          <p className="text-gray-600 mb-6">
            测试不同查询参数对邮编准确性的影响，帮助找到最佳的查询策略。
          </p>
          
          <button
            onClick={testZipAccuracy}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            测试不同查询参数
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-900 font-medium mb-2">错误信息</h3>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h2>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{result.query}</h3>
                    <div className="flex items-center space-x-2">
                      {result.hasCity && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">有城市</span>
                      )}
                      {result.hasPostcode && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">有邮编</span>
                      )}
                      {result.postcode && !validLasVegasZipCodes.includes(result.postcode) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          可疑邮编
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">地址类型:</div>
                      <div className="font-medium">{result.addresstype}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">邮编:</div>
                      <div className="font-medium">
                        {result.postcode ? (
                          <span className={validLasVegasZipCodes.includes(result.postcode) ? 'text-green-600' : 'text-red-600'}>
                            {result.postcode}
                          </span>
                        ) : (
                          <span className="text-gray-400">无</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-600 mb-1">完整地址:</div>
                      <div className="font-medium text-xs bg-gray-50 p-2 rounded">
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">分析结果</h3>
              <div className="text-blue-800 space-y-1 text-sm">
                <p>• 绿色标签：包含城市信息</p>
                <p>• 蓝色标签：包含邮编信息</p>
                <p>• 红色标签：邮编可能不准确</p>
                <p>• 有效拉斯维加斯邮编范围：89101-89199（除89184）</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 