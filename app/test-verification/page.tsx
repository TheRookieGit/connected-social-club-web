'use client'

import { useState } from 'react'

export default function TestVerification() {
  const [email, setEmail] = useState('test@example.com')
  const [phone, setPhone] = useState('13800138000')
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [status, setStatus] = useState('')

  const sendEmailCode = async () => {
    setStatus('发送邮箱验证码中...')
    try {
      const response = await fetch('/api/auth/send-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (data.success) {
        setStatus('邮箱验证码已发送，请检查控制台')
        console.log('📧 邮箱验证码已发送到:', email)
      } else {
        setStatus('发送失败: ' + data.error)
      }
    } catch (error) {
      setStatus('发送失败: ' + error)
    }
  }

  const sendPhoneCode = async () => {
    setStatus('发送手机验证码中...')
    try {
      const response = await fetch('/api/auth/send-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode: '+86' })
      })
      const data = await response.json()
      if (data.success) {
        setStatus('手机验证码已发送，请检查控制台')
        console.log('📱 手机验证码已发送到:', phone)
      } else {
        setStatus('发送失败: ' + data.error)
      }
    } catch (error) {
      setStatus('发送失败: ' + error)
    }
  }

  const verifyEmailCode = async () => {
    setStatus('验证邮箱验证码中...')
    try {
      const response = await fetch('/api/auth/send-email-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: emailCode })
      })
      const data = await response.json()
      if (data.success) {
        setStatus('✅ 邮箱验证成功!')
      } else {
        setStatus('❌ 邮箱验证失败: ' + data.error)
      }
    } catch (error) {
      setStatus('验证失败: ' + error)
    }
  }

  const verifyPhoneCode = async () => {
    setStatus('验证手机验证码中...')
    try {
      const response = await fetch('/api/auth/send-sms-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode: '+86', code: phoneCode })
      })
      const data = await response.json()
      if (data.success) {
        setStatus('✅ 手机验证成功!')
      } else {
        setStatus('❌ 手机验证失败: ' + data.error)
      }
    } catch (error) {
      setStatus('验证失败: ' + error)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">验证码测试页面</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 提示：在开发环境中，验证码会打印到浏览器控制台，请打开开发者工具查看
        </p>
      </div>

      <div className="space-y-6">
        {/* 邮箱验证测试 */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">邮箱验证测试</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="输入邮箱地址"
              />
            </div>
            <button
              onClick={sendEmailCode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              发送邮箱验证码
            </button>
            <div className="flex space-x-2">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="输入6位验证码"
                maxLength={6}
              />
              <button
                onClick={verifyEmailCode}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                验证
              </button>
            </div>
          </div>
        </div>

        {/* 手机验证测试 */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">手机验证测试</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">手机号码</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="输入手机号码"
              />
            </div>
            <button
              onClick={sendPhoneCode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              发送手机验证码
            </button>
            <div className="flex space-x-2">
              <input
                type="text"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="输入6位验证码"
                maxLength={6}
              />
              <button
                onClick={verifyPhoneCode}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                验证
              </button>
            </div>
          </div>
        </div>

        {/* 状态显示 */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">状态</h3>
          <p className="text-sm">{status || '等待操作...'}</p>
        </div>

        {/* 调试链接 */}
        <div className="border p-4 rounded-lg bg-yellow-50">
          <h3 className="font-semibold mb-2">调试工具</h3>
          <a
            href="/debug-verification-codes"
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            查看验证码存储状态 →
          </a>
        </div>
      </div>
    </div>
  )
} 