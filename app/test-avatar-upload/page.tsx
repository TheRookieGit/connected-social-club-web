'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, Check, X, AlertCircle } from 'lucide-react'

export default function TestAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 创建预览URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError(null)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('请先选择文件')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('未找到登录令牌，请先登录')
        return
      }

      console.log('开始上传头像...')
      console.log('文件信息:', { name: file.name, size: file.size, type: file.type })

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        console.log('上传成功:', data)
      } else {
        setError(data.error || '上传失败')
        console.error('上传失败:', data)
      }
    } catch (error) {
      setError('上传过程中发生错误')
      console.error('上传错误:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearResults = () => {
    setUploadResult(null)
    setError(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            头像上传测试
          </h1>

          {/* 文件选择区域 */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={triggerFileInput}
                className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Camera className="h-5 w-5 mr-2" />
                选择头像图片
              </button>
              
              <p className="text-gray-500 mt-4">
                支持 JPEG、PNG、WebP 格式，最大 5MB
              </p>
            </div>
          </div>

          {/* 预览区域 */}
          {previewUrl && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">图片预览</h3>
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="预览"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={clearResults}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 上传按钮 */}
          {previewUrl && (
            <div className="mb-8 text-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    上传头像
                  </>
                )}
              </button>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 成功结果 */}
          {uploadResult && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-4">
                <Check className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">上传成功！</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-green-700">头像URL:</span>
                  <p className="text-green-600 break-all">{uploadResult.avatar_url}</p>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">上传ID:</span>
                  <p className="text-green-600">{uploadResult.upload_id}</p>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">服务器时间:</span>
                  <p className="text-green-600">{new Date(uploadResult.server_time).toLocaleString()}</p>
                </div>
              </div>

              {/* 显示上传的头像 */}
              <div className="mt-6">
                <h4 className="font-medium text-green-700 mb-3">上传的头像:</h4>
                <div className="flex justify-center">
                  <Image
                    src={uploadResult.avatar_url}
                    alt="上传的头像"
                    width={150}
                    height={150}
                    className="rounded-full object-cover border-4 border-green-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 测试说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">测试说明</h3>
            <ul className="text-blue-700 space-y-2">
              <li>• 选择一张图片文件（JPEG、PNG、WebP格式）</li>
              <li>• 文件大小不能超过5MB</li>
              <li>• 点击"上传头像"按钮进行测试</li>
              <li>• 上传成功后会在数据库中更新用户的avatar_url字段</li>
              <li>• 文件会存储在Supabase Storage的user-avatars bucket中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 