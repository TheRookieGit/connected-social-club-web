'use client'

import { useState, useEffect } from 'react'
import { Heart, Link as LinkIcon, Sparkles, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function News() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)
  
  // 媒体评价数据
  const testimonials = [
    {
      title: "最佳社交平台",
      content: "ConnectEd Elite Social Club 为年轻人提供了一个安全、真实的社交环境",
      source: "科技日报"
    },
    {
      title: "创新社交体验",
      content: "通过智能匹配算法，ConnectEd 让寻找真爱变得更加简单高效",
      source: "互联网周刊"
    },
    {
      title: "用户满意度高",
      content: "ConnectEd Elite Social Club 的用户满意度达到95%，是行业内的佼佼者",
      source: "用户评价网"
    },
    {
      title: "安全可靠",
      content: "ConnectEd 严格的安全措施和实名认证系统，让用户放心交友",
      source: "网络安全报"
    }
  ]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // 自动轮播效果
  useEffect(() => {
    if (isAutoPlayPaused || isAnimating) return // 如果暂停了自动播放或正在动画中，则不执行

    const interval = setInterval(() => {
      setSlideDirection('right')
      setIsAnimating(true)
      
      // 先执行淡出动画
      setTimeout(() => {
        setCurrentTestimonialIndex((prevIndex) => {
          return prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        })
        setIsAnimating(false)
      }, 350) // 淡出动画的一半时间
    }, 3000) // 每3秒切换一次

    // 清理定时器
    return () => clearInterval(interval)
  }, [testimonials.length, isAutoPlayPaused, isAnimating])

  const nextTestimonial = () => {
    if (isAnimating) return // 如果正在动画中，忽略点击
    setIsAutoPlayPaused(true) // 暂停自动播放
    setSlideDirection('right')
    setIsAnimating(true)
    
    // 先执行淡出动画
    setTimeout(() => {
      const nextIndex = currentTestimonialIndex === testimonials.length - 1 ? 0 : currentTestimonialIndex + 1
      setCurrentTestimonialIndex(nextIndex)
      setIsAnimating(false)
    }, 350) // 淡出动画的一半时间
  }

  const prevTestimonial = () => {
    if (isAnimating) return // 如果正在动画中，忽略点击
    setIsAutoPlayPaused(true) // 暂停自动播放
    setSlideDirection('left')
    setIsAnimating(true)
    
    // 先执行淡出动画
    setTimeout(() => {
      const prevIndex = currentTestimonialIndex === 0 ? testimonials.length - 1 : currentTestimonialIndex - 1
      setCurrentTestimonialIndex(prevIndex)
      setIsAnimating(false)
    }, 350) // 淡出动画的一半时间
  }

  const goToTestimonial = (index: number) => {
    if (isAnimating) return // 如果正在动画中，忽略点击
    setIsAutoPlayPaused(true) // 暂停自动播放
    setSlideDirection(index > currentTestimonialIndex ? 'right' : 'left')
    setIsAnimating(true)
    
    // 先执行淡出动画
    setTimeout(() => {
      setCurrentTestimonialIndex(index)
      setIsAnimating(false)
    }, 350) // 淡出动画的一半时间
  }

  // 恢复自动播放
  useEffect(() => {
    if (!isAutoPlayPaused) return

    const timer = setTimeout(() => {
      setIsAutoPlayPaused(false)
    }, 5000) // 5秒后恢复自动播放

    return () => clearTimeout(timer)
  }, [isAutoPlayPaused])

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
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
            </div>
          </div>
        </div>
      </nav>

      {/* 新闻与媒体 部分 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* 媒体报道部分 */}
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                关于我们的媒体报道
              </h1>
            </div>
          </div>
        </div>
        
        {/* 媒体报道轮播部分 */}
        <div className="relative">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 py-16 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center overflow-hidden">
                <div 
                  className={`${
                    isAnimating 
                      ? slideDirection === 'right' 
                        ? 'slide-out-left' 
                        : 'slide-out-right'
                      : slideDirection === 'right' 
                        ? 'slide-in-right' 
                        : 'slide-in-left'
                  }`}
                  key={currentTestimonialIndex} // 强制重新渲染
                >
                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    "{testimonials[currentTestimonialIndex]?.title || '加载中...'}"
                  </p>
                  <p className="text-xl text-gray-600 italic mb-6 leading-relaxed">
                    "{testimonials[currentTestimonialIndex]?.content || '加载中...'}"
                  </p>
                  <p className="text-xl font-semibold text-gray-800">
                    — {testimonials[currentTestimonialIndex]?.source || '加载中...'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 导航按钮 */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer z-50"
              aria-label="上一个评价"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer z-50"
              aria-label="下一个评价"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* 计数器 */}
            <div className="absolute top-6 right-4 sm:right-6 lg:right-8 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full z-10 shadow-lg">
              {currentTestimonialIndex + 1} / {testimonials.length}
            </div>
            

          </div>
          
          {/* 指示器 */}
          <div className="flex justify-center mt-6 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
                  index === currentTestimonialIndex 
                    ? 'bg-red-500 scale-125 shadow-md' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`切换到第${index + 1}个评价`}
              />
            ))}
          </div>
        </div>
        
        {/* 媒体联系部分 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <LinkIcon className="h-12 w-12 text-red-500" />
                    <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1" />
                    <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-2 right-6" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  媒体合作？联系我们
                </h2>
              </div>

              {/* 合作类型列表 */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {/* 合作咨询 */}
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    合作咨询
                  </h3>
                  <p className="text-lg text-gray-600">
                    填写
                    <Link 
                      href="/contact" 
                      className="text-red-500 hover:text-red-600 underline font-medium"
                    >
                      这个表单
                    </Link>
                    ，我们会尽快回复您。
                  </p>
                </div>

                {/* 媒体咨询 */}
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    媒体咨询
                  </h3>
                  <p className="text-lg text-gray-600">
                    请联系我们的媒体团队：
                    <a 
                      href="mailto:admin@connect-edu.org" 
                      className="text-red-500 hover:text-red-600 underline font-medium"
                    >
                      admin@connect-edu.org
                    </a>
                  </p>
                </div>

                {/* 品牌资源 */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    品牌资源
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">
                    我们的标志、图形和图片都整理在媒体包中，方便您使用。
                  </p>
                  <button className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>下载媒体包</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 返回按钮 */}
            <div className="text-center mt-16">
              <Link 
                href="/"
                className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}