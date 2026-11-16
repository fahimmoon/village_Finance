import React from 'react'

export interface CardProps {
  children: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  noPadding?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  noPadding = false
}) => {
  return (
    <div className={`bg-white border border-[#D9DDE3] rounded-md overflow-hidden ${className}`}>
      {(title || actions) && (
        <div
          className={`px-4 py-2.5 border-b border-[#D9DDE3] bg-white flex items-center justify-between gap-3 ${headerClassName}`}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-[15px] font-semibold text-[#1F2937] leading-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4'} ${bodyClassName}`}>{children}</div>
    </div>
  )
}
