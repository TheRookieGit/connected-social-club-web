'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Star, Zap, Crown, Eye, MessageCircle, Filter, UserCheck } from 'lucide-react'
import { CurrencyProduct } from '@/types/currency'

interface CurrencyShopProps {
  userId: number
  userBalance: number
  onPurchase: (productId: number) => void
  className?: string
}

export default function CurrencyShop({ 
  userId, 
  userBalance, 
  onPurchase, 
  className = '' 
}: CurrencyShopProps) {
  const [products, setProducts] = useState<CurrencyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/currency/purchase')
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      setError('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (product: CurrencyProduct) => {
    if (userBalance < product.price) {
      alert('余额不足，无法购买此商品')
      return
    }

    try {
      const response = await fetch('/api/currency/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          user_id: userId
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        onPurchase(product.id)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('购买失败:', error)
      alert('购买失败，请重试')
    }
  }

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'feature':
        return <Star className="h-5 w-5" />
      case 'boost':
        return <Zap className="h-5 w-5" />
      case 'premium':
        return <Crown className="h-5 w-5" />
      default:
        return <Heart className="h-5 w-5" />
    }
  }

  const getProductColor = (productType: string) => {
    switch (productType) {
      case 'feature':
        return 'bg-blue-100 text-blue-600'
      case 'boost':
        return 'bg-yellow-100 text-yellow-600'
      case 'premium':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-red-100 text-red-600'
    }
  }

  const getProductNameIcon = (productName: string) => {
    if (productName.includes('超级喜欢')) return <Heart className="h-4 w-4" />
    if (productName.includes('重新匹配')) return <UserCheck className="h-4 w-4" />
    if (productName.includes('查看谁喜欢我')) return <Eye className="h-4 w-4" />
    if (productName.includes('无限滑动')) return <Zap className="h-4 w-4" />
    if (productName.includes('优先展示')) return <Star className="h-4 w-4" />
    if (productName.includes('消息提醒')) return <MessageCircle className="h-4 w-4" />
    if (productName.includes('高级筛选')) return <Filter className="h-4 w-4" />
    if (productName.includes('隐身模式')) return <Eye className="h-4 w-4" />
    return <Heart className="h-4 w-4" />
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.product_type === selectedCategory)

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="text-center text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      {/* 商店标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">桃花币商店</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-900">
            {userBalance.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setSelectedCategory('feature')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedCategory === 'feature'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          功能
        </button>
        <button
          onClick={() => setSelectedCategory('boost')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedCategory === 'boost'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          加速
        </button>
        <button
          onClick={() => setSelectedCategory('premium')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedCategory === 'premium'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          高级
        </button>
      </div>

      {/* 商品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {/* 商品类型标签 */}
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getProductColor(product.product_type)}`}>
                  {getProductIcon(product.product_type)}
                  <span>{product.product_type === 'feature' ? '功能' : product.product_type === 'boost' ? '加速' : '高级'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {product.price.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* 商品信息 */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getProductNameIcon(product.product_name)}
                  <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                </div>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>

              {/* 购买按钮 */}
              <button
                onClick={() => handlePurchase(product)}
                disabled={userBalance < product.price}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  userBalance >= product.price
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {userBalance >= product.price ? '立即购买' : '余额不足'}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>暂无商品</p>
          </div>
        )}
      </div>
    </div>
  )
} 