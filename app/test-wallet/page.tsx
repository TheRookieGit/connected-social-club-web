'use client'

import { useState } from 'react'
import WalletDisplay from '@/components/WalletDisplay'

export default function TestWalletPage() {
  const [userId, setUserId] = useState(7) // 默认使用用户ID 7

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            钱包测试页面
          </h1>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户ID:
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 7)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <p className="text-sm text-gray-600">
            当前测试用户ID: {userId}
          </p>
        </div>

        <WalletDisplay userId={userId} />
      </div>
    </div>
  )
} 