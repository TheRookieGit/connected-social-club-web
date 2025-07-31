'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, Plus, AlertCircle, Camera, Upload } from 'lucide-react'

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

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // 检查文件大小（限制为4MB，留一些余量给Vercel）
        const maxSize = 4 * 1024 * 1024 // 4MB
        if (file.size > maxSize) {
          alert(`文件过大！请选择小于4MB的图片。当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`)
          return
        }

        // 压缩图片
        try {
          const compressedFile = await compressImage(file)
          
          // 先显示本地预览
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setPhotos(prev => {
              const newPhotos = [...prev]
              newPhotos[index] = result
              return newPhotos
            })
          }
          reader.readAsDataURL(compressedFile)
        } catch (error) {
          console.error('图片压缩失败:', error)
          alert('图片处理失败，请重试')
        }
      }
    }

    input.click()
  }

  // 图片压缩函数
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      img.onload = () => {
        // 计算新的尺寸，保持宽高比
        const maxWidth = 1200
        const maxHeight = 1200
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height)

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 检查压缩后的大小
              if (blob.size > 4 * 1024 * 1024) {
                // 如果还是太大，进一步压缩
                canvas.toBlob(
                  (finalBlob) => {
                    if (finalBlob) {
                      const compressedFile = new File([finalBlob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                      })
                      resolve(compressedFile)
                    } else {
                      reject(new Error('图片压缩失败'))
                    }
                  },
                  'image/jpeg',
                  0.6 // 进一步降低质量
                )
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              }
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          'image/jpeg',
          0.8 // 压缩质量
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleAddPhoto = () => {
    // 找到第一个空的照片位置
    const emptyIndex = photos.findIndex(photo => !photo)
    if (emptyIndex !== -1) {
      handlePhotoUpload(emptyIndex)
    } else {
      // 如果所有位置都有照片，提示用户
      alert('您已经添加了所有可用的照片位置')
    }
  }

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev]
      newPhotos[index] = ''
      return newPhotos
    })
  }

  const handleConfirm = async () => {
    const validPhotos = photos.filter(photo => photo)
    if (validPhotos.length < 3) {
      return // 至少需要3张照片
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到登录令牌')
      }

      // 将base64照片转换为文件对象
      const photoFiles: File[] = []
      for (let i = 0; i < validPhotos.length; i++) {
        const photoData = validPhotos[i]
        if (photoData.startsWith('data:image/')) {
          // 从base64转换为文件
          const response = await fetch(photoData)
          const blob = await response.blob()
          
          // 检查文件大小
          if (blob.size > 4 * 1024 * 1024) {
            throw new Error(`照片 ${i + 1} 过大，请重新选择较小的图片`)
          }
          
          const file = new File([blob], `photo-${i + 1}.jpg`, { type: 'image/jpeg' })
          photoFiles.push(file)
        }
      }

      // 使用新的照片上传API
      const formData = new FormData()
      photoFiles.forEach(file => {
        formData.append('photos', file)
      })

      console.log('开始上传照片，文件数量:', photoFiles.length)
      console.log('文件大小:', photoFiles.map(f => `${f.name}: ${(f.size / 1024 / 1024).toFixed(2)}MB`))

      const response = await fetch('/api/user/upload-photos-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('API响应状态:', response.status)
      console.log('API响应头:', Object.fromEntries(response.headers.entries()))

      // 获取响应文本以便调试
      const responseText = await response.text()
      console.log('API响应内容:', responseText)

      if (!response.ok) {
        // 尝试解析JSON错误信息
        let errorMessage = '照片上传失败'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.message || '照片上传失败'
          if (errorData.details) {
            errorMessage += ` (${errorData.details})`
          }
        } catch (parseError) {
          console.error('JSON解析失败:', parseError)
          console.error('原始响应:', responseText)
          // 如果JSON解析失败，使用原始响应文本
          if (responseText.includes('Request Entity Too Large') || responseText.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
            errorMessage = '文件过大，请选择较小的图片（建议小于4MB）'
          } else {
            errorMessage = `服务器错误: ${responseText.substring(0, 100)}...`
          }
        }
        throw new Error(errorMessage)
      }

      // 尝试解析成功响应
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('成功响应JSON解析失败:', parseError)
        console.error('原始响应:', responseText)
        throw new Error('服务器返回了无效的响应格式')
      }

      console.log('照片上传成功:', result)

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理照片上传时出错:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`照片上传失败: ${errorMessage}`)
      setIsConfirmed(false)
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

        {/* 添加照片按钮 */}
        <div className="mb-6">
          <button
            onClick={handleAddPhoto}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span className="font-semibold">添加照片</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            点击上方按钮或直接点击下方照片位置来添加照片
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
                    <Image
                      src={photos[index]}
                      alt={`照片 ${index + 1}`}
                      width={300}
                      height={300}
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