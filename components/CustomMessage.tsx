'use client'

import React from 'react'

interface CustomMessageProps {
  message: any
  isOwnMessage: boolean
}

export default function CustomMessage({ message, isOwnMessage }: CustomMessageProps) {
  const messageText = message.text || ''
  const timestamp = message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-pink-500 text-white rounded-br-sm' 
            : 'bg-gray-200 text-gray-800 rounded-bl-sm'
        }`}
        style={{
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
          direction: 'ltr',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          textAlign: 'left',
          verticalAlign: 'baseline',
          textTransform: 'none',
          letterSpacing: 'normal',
          wordSpacing: 'normal',
          lineHeight: '1.4',
          fontSize: '14px'
        }}
      >
        <div 
          className="break-words"
          style={{
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed',
            direction: 'ltr',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {messageText}
        </div>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
          {timestamp}
        </div>
      </div>
    </div>
  )
} 