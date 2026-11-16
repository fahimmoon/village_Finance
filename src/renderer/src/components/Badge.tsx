import React from 'react'

export type BadgeVariant =
  | 'active'
  | 'posted'
  | 'completed'
  | 'balanced'
  | 'pending'
  | 'draft'
  | 'inactive'
  | 'exited'
  | 'reversed'
  | 'defaulted'
  | 'unbalanced'
  | 'danger'
  | 'info'
  | 'neutral'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  // Professional desktop accounting badges: 12px text, 4px radius, subtle light tint, flat 1px border
  const styles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    active: { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
    posted: { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
    completed: { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
    balanced: { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },

    pending: { bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },
    draft: { bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },

    inactive: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', border: 'border-[#E5E7EB]' },
    exited: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', border: 'border-[#E5E7EB]' },
    reversed: { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', border: 'border-[#D1D5DB]' },
    neutral: { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', border: 'border-[#E5E7EB]' },

    defaulted: { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]' },
    unbalanced: { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]' },
    danger: { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]' },

    info: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]' }
  }

  const s = styles[variant] || styles.neutral

  return (
    <span
      className={`inline-flex items-center text-[12px] font-medium leading-none px-2 py-1 rounded-[4px] border ${s.bg} ${s.text} ${s.border} select-none ${className}`}
    >
      {children}
    </span>
  )
}
