import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Alert({ type = 'success', message, isVisible, onClose, duration = 5000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800 shadow-lg',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={cn(
        'w-full rounded-lg border p-4 shadow-lg transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        alertStyles[type]
      )}>
        <div className="flex items-start">
          <Icon className={cn('w-5 h-5 mr-3 mt-0.5 flex-shrink-0', iconStyles[type])} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}