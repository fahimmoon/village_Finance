import React from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  badge,
  className = ''
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 pb-3 mb-3 border-b border-[#D9DDE3] ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[20px] font-semibold text-[#1F2937] leading-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
