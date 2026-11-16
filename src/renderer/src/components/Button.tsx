import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Desktop accounting software button styling: flat, 4px radius, 32px height standard
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[13px] border'

  const variantClasses = {
    primary: 'bg-[#0F766E] text-white hover:bg-[#115E59] border-[#0F766E]',
    secondary: 'bg-white text-[#1F2937] hover:bg-[#F3F4F6] border-[#D9DDE3]',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] border-[#B91C1C]',
    outline: 'bg-transparent border-[#0F766E] text-[#0F766E] hover:bg-[#F0FDFA]',
    ghost:
      'bg-transparent border-transparent text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6]'
  }

  const sizeClasses = {
    sm: 'h-[28px] px-2.5 gap-1.5 text-[12px]',
    md: 'h-[32px] px-3.5 gap-1.5 text-[13px]', // standard 32px height
    lg: 'h-[36px] px-4 gap-2 text-[14px]'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={14} className="animate-spin shrink-0" />}
      {!isLoading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  )
}
