'use client'

import { Heart, Circle, Share2, Gift, Star, Users, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleFooter from '@/components/SimpleFooter'
import { useState } from 'react'

export default function Couples() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    coupleName: '',
    story: '',
    contactInfo: '',
    photos: [] as File[],
    videos: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, [type]: [...prev[type], ...files] }))
  }

  const removeFile = (type: 'photos' | 'videos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 这里可以添加实际的提交逻辑
    console.log('提交的故事数据:', formData)
    
    // 模拟提交延迟
    setTimeout(() => {
      setIsSubmitting(false)
      setShowForm(false)
      setFormData({
        coupleName: '',
        story: '',
        contactInfo: '',
        photos: [],
        videos: []
      })
      alert('感谢分享你们的故事！我们会尽快联系你们。')
    }, 2000)
  }

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-red-500 flex items-center">
                <Heart className="mr-2 text-red-500" size={24} />
                ConnectEd Elite Social Club
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
                首页
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-red-500 transition-colors">
                关于我们
              </Link>
              <Link href="/join-us" className="text-gray-600 hover:text-red-500 transition-colors">
                加入我们
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-red-500 transition-colors">
                媒体合作
              </Link>
              <Link href="/couples" className="text-red-500 font-medium">
                ConnectEd 情侣
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 祝贺内容 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative">
                  <Circle className="h-12 w-12 text-red-500" />
                  <Star className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                恭喜你们找到了彼此！
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                既然我们非常反对"幽灵"行为，我们希望你们在离开我们的应用后仍然感到被支持。此外，我们喜欢成为情侣们令人兴奋的新未来的一部分。看看你们如何将ConnectEd融入你们的关系里程碑中。
              </p>
            </div>

            {/* 右侧图片 */}
            <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/b85532fbed291e13b225ae6ff3f6c3bc.png"
                alt="ConnectEd 情侣 - 恭喜找到彼此"
                fill
                className="object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 两个功能区域 */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* 分享故事 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <Share2 className="h-12 w-12 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  分享你们的ConnectEd故事
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  我们喜欢听到情侣们是如何找到彼此的。如果你们愿意，你们的故事可能会在我们的社交媒体上展示！
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  分享我们的故事
                </button>
              </div>
            </div>

            {/* 情侣套件 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <Gift className="h-12 w-12 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ConnectEd 情侣套件
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  从纪念品到贴纸再到拍照道具，我们拥有你们可能需要的所有ConnectEd主题好物。
                </p>
                <button className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium">
                  打开套件
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 奖励活动 */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            赢得100元约会津贴
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            制作一个可以被我们用户广告宣传的，关于你们ConnectEd故事的公众号文章、抖音或小红书。我们将为你们的下一次约会买单！
          </p>
          <button className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium">
            提交视频
          </button>
        </div>
      </section>

      {/* 成功故事 */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🍿</span>
            </div>
          </div>
          
          <blockquote className="text-xl text-gray-700 italic mb-8 leading-relaxed">
            "在我们的第一次约会中，我们分享了一个超大爆米花和冰沙，这让我们说出了'要么做大要么回家'。在我们在一起的第一周后，我们再也没有回头。两年后，我们买了我们的第一套房子，我求婚时说'是时候做大并回家了'。"
          </blockquote>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">王小明 & 李小红</p>
            </div>
          </div>
        </div>
      </section>

      {/* 分享故事表单模态框 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">分享你们的ConnectEd故事</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 情侣姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    你们的名字 *
                  </label>
                  <input
                    type="text"
                    name="coupleName"
                    value={formData.coupleName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="例如：王小明 & 李小红"
                  />
                </div>

                {/* 故事内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    你们的故事 *
                  </label>
                  <textarea
                    name="story"
                    value={formData.story}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="请分享你们是如何通过ConnectEd相遇、相知、相爱的故事..."
                  />
                </div>

                {/* 联系方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系方式 *
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="微信号、手机号或邮箱"
                  />
                </div>

                {/* 照片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传照片
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'photos')}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-red-500 font-medium">点击上传照片</span>
                      <span className="text-gray-500 text-sm block">支持 JPG、PNG 格式</span>
                    </label>
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.photos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile('photos', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 视频上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传视频
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'videos')}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <span className="text-red-500 font-medium">点击上传视频</span>
                      <span className="text-gray-500 text-sm block">支持 MP4、MOV 格式</span>
                    </label>
                  </div>
                  {formData.videos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.videos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile('videos', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 提交按钮 */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '提交中...' : '提交故事'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 