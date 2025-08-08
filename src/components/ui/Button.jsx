import React from 'react'
import { cn } from '../../lib/utils'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500',
    secondary: 'bg-green-600 text-white hover:bg-green-500 focus:ring-green-400',
    outline: 'border border-green-700 text-green-700 hover:bg-green-50 focus:ring-green-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}