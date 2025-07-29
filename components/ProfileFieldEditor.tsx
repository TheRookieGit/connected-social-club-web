'use client'

import { useState, useEffect } from 'react'
import { X, Check, ChevronLeft } from 'lucide-react'

interface ProfileFieldEditorProps {
  isOpen: boolean
  onClose: () => void
  field: {
    label: string
    value: any
    type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number'
    options?: string[]
    required?: boolean
  }
  onSave: (value: any) => Promise<boolean>
}

export default function ProfileFieldEditor({ isOpen, onClose, field, onSave }: ProfileFieldEditorProps) {
  const [value, setValue] = useState<any>(field.value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(field.value)
    setError(null)
  }, [field.value])

  const handleSave = async () => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      setError('此字段为必填项')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const success = await onSave(value)
      if (success) {
        onClose()
      } else {
        setError('保存失败，请重试')
      }
    } catch (error) {
      setError('保存时发生错误')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(field.value)
    setError(null)
    onClose()
  }

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={`输入${field.label}`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => setValue(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={`输入${field.label}`}
          />
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => setValue(e.target.value || null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">请选择</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {item}
                  <button
                    onClick={() => setValue(selectedValues.filter(v => v !== item))}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                const newValue = e.target.value
                if (newValue && !selectedValues.includes(newValue)) {
                  setValue([...selectedValues, newValue])
                }
                e.target.value = ''
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">添加选项</option>
              {field.options?.filter(option => !selectedValues.includes(option)).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )

      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === true}
                onChange={() => setValue(true)}
                className="mr-2"
              />
              是
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === false}
                onChange={() => setValue(false)}
                className="mr-2"
              />
              否
            </label>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{field.label}</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-red-500 font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {renderInput()}
          </div>

          {field.required && (
            <p className="mt-2 text-sm text-gray-500">* 此字段为必填项</p>
          )}
        </div>
      </div>
    </div>
  )
} 