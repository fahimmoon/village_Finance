import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  onClick?: () => void
  className?: string
  trend?: {
    value: string
    isPositive?: boolean
  }
  /** Optional icon element to display */
  icon?: React.ReactNode
  /** Background color for the icon container, e.g. '#F3F4F6' */
  iconBgColor?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  onClick,
  className = '',
  trend,
  icon,
  iconBgColor = '#F3F4F6',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#D9DDE3] rounded-[6px] p-3.5 transition-colors ${
        onClick ? 'cursor-pointer hover:border-[#9CA3AF]' : ''
      } ${className}`}
    >
      {/* Optional icon */}
      {icon && (
        <div className="mb-2 flex items-center">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
        </div>
      )}
      {/* Small grey label above */}
      <div className="text-[12px] font-medium text-[#6B7280] leading-none">{title}</div>

      {/* 22px semibold number below */}
      <div className="mt-2 text-[22px] font-semibold text-[#1F2937] tabular-nums leading-tight tracking-tight">
        {value}
      </div>

      {(subtext || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          {trend && (
            <span
              className={`font-semibold tabular-nums ${
                trend.isPositive ? 'text-[#15803D]' : 'text-[#B91C1C]'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  )
}
