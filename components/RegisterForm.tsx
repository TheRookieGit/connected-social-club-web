'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Calendar, Phone, Send, ChevronDown } from 'lucide-react'

const countryCodes = [
  { code: '+86', name: '中国', flag: '🇨🇳' },
  { code: '+1', name: '美国', flag: '🇺🇸' },
  { code: '+44', name: '英国', flag: '🇬🇧' },
  { code: '+81', name: '日本', flag: '🇯🇵' },
  { code: '+82', name: '韩国', flag: '🇰🇷' },
  { code: '+65', name: '新加坡', flag: '🇸🇬' },
  { code: '+852', name: '香港', flag: '🇭🇰' },
  { code: '+886', name: '台湾', flag: '🇹🇼' },
  { code: '+91', name: '印度', flag: '🇮🇳' },
  { code: '+49', name: '德国', flag: '🇩🇪' },
  { code: '+33', name: '法国', flag: '🇫🇷' },
  { code: '+39', name: '意大利', flag: '🇮🇹' },
  { code: '+34', name: '西班牙', flag: '🇪🇸' },
  { code: '+31', name: '荷兰', flag: '🇳🇱' },
  { code: '+46', name: '瑞典', flag: '🇸🇪' },
  { code: '+47', name: '挪威', flag: '🇳🇴' },
  { code: '+45', name: '丹麦', flag: '🇩🇰' },
  { code: '+358', name: '芬兰', flag: '🇫🇮' },
  { code: '+41', name: '瑞士', flag: '🇨🇭' },
  { code: '+43', name: '奥地利', flag: '🇦🇹' },
  { code: '+32', name: '比利时', flag: '🇧🇪' },
  { code: '+351', name: '葡萄牙', flag: '🇵🇹' },
  { code: '+30', name: '希腊', flag: '🇬🇷' },
  { code: '+48', name: '波兰', flag: '🇵🇱' },
  { code: '+420', name: '捷克', flag: '🇨🇿' },
  { code: '+36', name: '匈牙利', flag: '🇭🇺' },
  { code: '+380', name: '乌克兰', flag: '🇺🇦' },
  { code: '+7', name: '俄罗斯', flag: '🇷🇺' },
  { code: '+90', name: '土耳其', flag: '🇹🇷' },
  { code: '+971', name: '阿联酋', flag: '🇦🇪' },
  { code: '+966', name: '沙特阿拉伯', flag: '🇸🇦' },
  { code: '+972', name: '以色列', flag: '🇮🇱' },
  { code: '+20', name: '埃及', flag: '🇪🇬' },
  { code: '+27', name: '南非', flag: '🇿🇦' },
  { code: '+234', name: '尼日利亚', flag: '🇳🇬' },
  { code: '+254', name: '肯尼亚', flag: '🇰🇪' },
  { code: '+55', name: '巴西', flag: '🇧🇷' },
  { code: '+54', name: '阿根廷', flag: '🇦🇷' },
  { code: '+56', name: '智利', flag: '🇨🇱' },
  { code: '+57', name: '哥伦比亚', flag: '🇨🇴' },
  { code: '+58', name: '委内瑞拉', flag: '🇻🇪' },
  { code: '+593', name: '厄瓜多尔', flag: '🇪🇨' },
  { code: '+51', name: '秘鲁', flag: '🇵🇪' },
  { code: '+52', name: '墨西哥', flag: '🇲🇽' },
  { code: '+503', name: '萨尔瓦多', flag: '🇸🇻' },
  { code: '+504', name: '洪都拉斯', flag: '🇭🇳' },
  { code: '+505', name: '尼加拉瓜', flag: '🇳🇮' },
  { code: '+506', name: '哥斯达黎加', flag: '🇨🇷' },
  { code: '+507', name: '巴拿马', flag: '🇵🇦' },
  { code: '+595', name: '巴拉圭', flag: '🇵🇾' },
  { code: '+598', name: '乌拉圭', flag: '🇺🇾' },
  { code: '+61', name: '澳大利亚', flag: '🇦🇺' },
  { code: '+64', name: '新西兰', flag: '🇳🇿' },
  { code: '+60', name: '马来西亚', flag: '🇲🇾' },
  { code: '+66', name: '泰国', flag: '🇹🇭' },
  { code: '+84', name: '越南', flag: '🇻🇳' },
  { code: '+62', name: '印度尼西亚', flag: '🇮🇩' },
  { code: '+63', name: '菲律宾', flag: '🇵🇭' },
  { code: '+880', name: '孟加拉国', flag: '🇧🇩' },
  { code: '+94', name: '斯里兰卡', flag: '🇱🇰' },
  { code: '+95', name: '缅甸', flag: '🇲🇲' },
  { code: '+856', name: '老挝', flag: '🇱🇦' },
  { code: '+855', name: '柬埔寨', flag: '🇰🇭' },
  { code: '+977', name: '尼泊尔', flag: '🇳🇵' },
  { code: '+93', name: '阿富汗', flag: '🇦🇫' },
  { code: '+98', name: '伊朗', flag: '🇮🇷' },
  { code: '+964', name: '伊拉克', flag: '🇮🇶' },
  { code: '+962', name: '约旦', flag: '🇯🇴' },
  { code: '+961', name: '黎巴嫩', flag: '🇱🇧' },
  { code: '+963', name: '叙利亚', flag: '🇸🇾' },
  { code: '+967', name: '也门', flag: '🇾🇪' },
  { code: '+968', name: '阿曼', flag: '🇴🇲' },
  { code: '+974', name: '卡塔尔', flag: '🇶🇦' },
  { code: '+973', name: '巴林', flag: '🇧🇭' },
  { code: '+965', name: '科威特', flag: '🇰🇼' },
]

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: ''
  })
  
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [verificationCodes, setVerificationCodes] = useState({
    emailCode: '',
    phoneCode: ''
  })
  
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false)
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false)
  const [countdown, setCountdown] = useState({ email: 0, phone: 0 })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCodes({
      ...verificationCodes,
      [e.target.name]: e.target.value
    })
  }

  const sendEmailCode = async () => {
    if (!formData.email) {
      alert('请先输入邮箱地址')
      return
    }

    setIsSendingEmailCode(true)
    try {
      const response = await fetch('/api/auth/send-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (data.success) {
        alert('邮箱验证码已发送')
        setCountdown(prev => ({ ...prev, email: 60 }))
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev.email <= 1) {
              clearInterval(timer)
              return { ...prev, email: 0 }
            }
            return { ...prev, email: prev.email - 1 }
          })
        }, 1000)
      } else {
        alert(data.error || '发送失败')
      }
    } catch (error) {
      alert('发送失败，请稍后重试')
    } finally {
      setIsSendingEmailCode(false)
    }
  }

  const sendPhoneCode = async () => {
    if (!formData.phone) {
      alert('请先输入手机号')
      return
    }

    setIsSendingPhoneCode(true)
    try {
      const response = await fetch('/api/auth/send-sms-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: formData.phone,
          countryCode: selectedCountry.code
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('手机验证码已发送')
        setCountdown(prev => ({ ...prev, phone: 60 }))
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev.phone <= 1) {
              clearInterval(timer)
              return { ...prev, phone: 0 }
            }
            return { ...prev, phone: prev.phone - 1 }
          })
        }, 1000)
      } else {
        alert(data.error || '发送失败')
      }
    } catch (error) {
      alert('发送失败，请稍后重试')
    } finally {
      setIsSendingPhoneCode(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!verificationCodes.emailCode) {
      alert('请输入邮箱验证码')
      return
    }

    try {
      const response = await fetch('/api/auth/send-email-code', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          code: verificationCodes.emailCode 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationStatus(prev => ({ ...prev, emailVerified: true }))
        alert('邮箱验证成功')
      } else {
        alert(data.error || '验证失败')
      }
    } catch (error) {
      alert('验证失败，请稍后重试')
    }
  }

  const verifyPhoneCode = async () => {
    if (!verificationCodes.phoneCode) {
      alert('请输入手机验证码')
      return
    }

    try {
      const response = await fetch('/api/auth/send-sms-code', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: formData.phone,
          countryCode: selectedCountry.code,
          code: verificationCodes.phoneCode 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationStatus(prev => ({ ...prev, phoneVerified: true }))
        alert('手机验证成功')
      } else {
        alert(data.error || '验证失败')
      }
    } catch (error) {
      alert('验证失败，请稍后重试')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    if (formData.password.length < 6) {
      setError('密码至少需要6位字符')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: selectedCountry.code + formData.phone,
          password: formData.password,
          birthDate: formData.birthDate,
          gender: formData.gender
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 跳转到仪表板
        router.push('/dashboard')
      } else {
        setError(data.error || '注册失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          姓名
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="请输入真实姓名"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          邮箱地址
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="请输入邮箱地址"
            required
          />
        </div>
        
        {/* 暂时取消邮箱验证环节 - 保留代码以便之后使用 */}
        {/*
        <div className="mt-3 flex space-x-2">
          <input
            name="emailCode"
            type="text"
            value={verificationCodes.emailCode}
            onChange={handleCodeChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="邮箱验证码"
            maxLength={6}
          />
          <button
            type="button"
            onClick={sendEmailCode}
            disabled={isSendingEmailCode || countdown.email > 0 || !formData.email}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown.email > 0 ? `${countdown.email}s` : '发送验证码'}
          </button>
          <button
            type="button"
            onClick={verifyEmailCode}
            disabled={!verificationCodes.emailCode || verificationStatus.emailVerified}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationStatus.emailVerified ? '已验证' : '验证'}
          </button>
        </div>
        */}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          手机号
        </label>
        <div className="flex space-x-2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center space-x-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[120px]"
            >
              <span>{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.code}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {countryCodes.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country)
                      setShowCountryDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 text-left"
                  >
                    <span>{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    <span className="text-sm text-gray-500 ml-auto">{country.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="请输入手机号"
              required
            />
          </div>
        </div>
        
        {/* 暂时取消手机验证环节 - 保留代码以便之后使用 */}
        {/*
        <div className="mt-3 flex space-x-2">
          <input
            name="phoneCode"
            type="text"
            value={verificationCodes.phoneCode}
            onChange={handleCodeChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="手机验证码"
            maxLength={6}
          />
          <button
            type="button"
            onClick={sendPhoneCode}
            disabled={isSendingPhoneCode || countdown.phone > 0 || !formData.phone}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown.phone > 0 ? `${countdown.phone}s` : '发送验证码'}
          </button>
          <button
            type="button"
            onClick={verifyPhoneCode}
            disabled={!verificationCodes.phoneCode || verificationStatus.phoneVerified}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationStatus.phoneVerified ? '已验证' : '验证'}
          </button>
        </div>
        */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
            出生日期
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            性别
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">请选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          密码
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="请输入密码（至少8位）"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          确认密码
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="请再次输入密码"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="agree-terms"
          type="checkbox"
          className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
          required
        />
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
          我同意
          <a href="#" className="text-red-500 hover:text-red-600">服务条款</a>
          和
          <a href="#" className="text-red-500 hover:text-red-600">隐私政策</a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '注册中...' : '立即注册'}
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-600">已有账号？</span>
        <button
          type="button"
          onClick={() => window.location.href = '/?login=true'}
          className="text-sm text-red-500 hover:text-red-600 ml-1 bg-transparent border-none cursor-pointer"
        >
          立即登录
        </button>
      </div>
    </form>
  )
} 