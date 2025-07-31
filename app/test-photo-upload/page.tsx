'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Upload, Check, X } from 'lucide-react'

export default function TestPhotoUpload() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setError(null)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('请选择照片文件')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('photos', file)
      })

      const response = await fetch('/api/user/upload-photos-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '上传失败')
      }

      setUploadResult(result)
      console.log('上传成功:', result)
    } catch (error) {
      setError(error instanceof Error ? error.message : '上传失败')
      console.error('上传错误:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Camera className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">照片上传测试</h1>
          <p className="text-gray-600">测试新的照片上传功能</p>
        </div>

        {/* 文件选择区域 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择照片文件
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">点击选择照片文件</p>
              <p className="text-sm text-gray-500">支持 JPEG, PNG, WebP 格式，最大 5MB</p>
            </label>
          </div>
        </div>

        {/* 选中的文件列表 */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">选中的文件 ({selectedFiles.length})</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 上传按钮 */}
        <div className="mb-6">
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>上传中...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>上传照片</span>
              </>
            )}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 上传结果 */}
        {uploadResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-5 w-5 text-green-500" />
              <h3 className="text-green-700 font-semibold">上传成功！</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>上传数量:</strong> {uploadResult.photo_count} 张</p>
              <p><strong>时间:</strong> {new Date(uploadResult.timestamp).toLocaleString()}</p>
              <div>
                <strong>照片URL:</strong>
                <div className="mt-2 space-y-1">
                  {uploadResult.photos.map((url: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600 break-all">
                      {index + 1}. {url}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>
          
          {uploadResult && (
            <button
              onClick={() => router.push('/user-photos')}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              查看照片页面
            </button>
          )}
        </div>

        {/* 说明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">测试说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 选择多张照片文件进行上传测试</li>
            <li>• 支持的文件格式：JPEG, PNG, WebP</li>
            <li>• 单个文件大小限制：5MB</li>
            <li>• 照片将上传到 Supabase Storage</li>
            <li>• 上传成功后可以在用户照片页面查看</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 