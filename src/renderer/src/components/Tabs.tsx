import React from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-[#D9DDE3] ${className}`}>
      <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap pb-2 pt-1 px-1 border-b-2 font-medium text-[13px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                isActive
                  ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-[#D9DDE3]'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-[3px] text-[11px] font-mono tabular-nums ${
                    isActive
                      ? 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
