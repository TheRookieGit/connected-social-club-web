'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, AlertCircle, Camera } from 'lucide-react'

export default function Photos() {
  const [photos, setPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  // 防止后退功能
  useEffect(() => {
    // 在页面加载时立即添加历史记录，防止直接后退
    window.history.pushState(null, '', '/photos')

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果用户已经上传了照片，就阻止离开页面
      if (photos.length >= 3) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // 如果用户已经上传了照片，阻止后退
      if (photos.length >= 3) {
        // 阻止默认的后退行为
        e.preventDefault()
        // 立即重新添加当前页面到历史记录
        window.history.pushState(null, '', '/photos')
        // 显示提示信息
        alert('请完成当前页面的选择后再继续')
        // 强制阻止导航
        return false
      }
    }

    // 监听浏览器后退按钮
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && photos.length >= 3) {
        e.preventDefault()
        alert('请完成当前页面的选择后再继续')
        return false
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [photos])

  const handlePhotoUpload = (index: number) => {
    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setPhotos(prev => {
            const newPhotos = [...prev]
            newPhotos[index] = result
            return newPhotos
          })
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev]
      newPhotos[index] = ''
      return newPhotos
    })
  }

  const handleConfirm = async () => {
    if (photos.filter(photo => photo).length < 3) {
      return // 至少需要3张照片
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户照片信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            photos: photos.filter(photo => photo)
          })
        })

        if (!response.ok) {
          console.error('更新照片信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理照片上传时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoTips = () => {
    // 这里可以打开照片提示弹窗或跳转到提示页面
    alert('照片提示：\n1. 使用清晰、高质量的照片\n2. 展示您的真实面貌\n3. 包含一些生活场景\n4. 避免过度滤镜')
  }

  const photoCount = photos.filter(photo => photo).length
  const canProceed = photoCount >= 3

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center">
          {/* 左侧留空 */}
        </div>
        <div className="flex items-center">
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ConnectEd Elite Social Club
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1 bg-gray-200">
        <div className="w-[100%] h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            是时候为你的名片添加照片了
          </h1>
                     <p className="text-sm text-gray-600 leading-relaxed">
             做你自己！至少添加3张照片，无论是你和宠物的合照、吃你最喜欢的食物，还是在你喜欢的地方。
           </p>
        </div>

        {/* 照片网格 */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={`relative aspect-square border-2 border-gray-300 rounded-lg cursor-pointer transition-all ${
                  photos[index] ? 'border-black' : 'hover:border-gray-400'
                }`}
                onClick={() => handlePhotoUpload(index)}
              >
                {photos[index] ? (
                  <>
                    <img
                      src={photos[index]}
                      alt={`照片 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePhotoRemove(index)
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* 红色警告图标（前3个位置） */}
                {index < 3 && !photos[index] && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                    !
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

                 {/* 错误提示 */}
         {!canProceed && (
           <div className="mb-6 flex items-center space-x-2 text-red-500">
             <AlertCircle className="w-4 h-4" />
             <span className="text-sm">请至少添加3张照片以继续</span>
           </div>
         )}
      </div>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* 照片提示 */}
                     <button
             onClick={handlePhotoTips}
             className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
           >
             <Camera className="w-4 h-4" />
             <span>想要确保您挑选到合适的照片？</span>
             <span className="underline">查看我们的照片提示</span>
           </button>

          {/* 下一步按钮 */}
          <button
            onClick={handleConfirm}
            disabled={!canProceed || isConfirmed}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canProceed && !isConfirmed
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 确认状态 */}
      {isConfirmed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ChevronRight className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">
              照片已保存，正在跳转...
            </p>
          </div>
        </div>
      )}

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 