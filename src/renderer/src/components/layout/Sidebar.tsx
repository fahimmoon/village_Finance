import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  HandCoins,
  ReceiptText,
  BookOpen,
  ArrowLeftRight,
  PieChart,
  FileBarChart,
  Settings
} from 'lucide-react'

interface NavItem {
  to: string
  labelKey: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [{ to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'OPERATIONS',
    items: [
      { to: '/members', labelKey: 'nav.members', icon: Users },
      { to: '/savings', labelKey: 'nav.savings', icon: PiggyBank },
      { to: '/loans', labelKey: 'nav.loans', icon: HandCoins },
      { to: '/repayments', labelKey: 'nav.repayments', icon: ReceiptText }
    ]
  },
  {
    label: 'ACCOUNTING',
    items: [
      { to: '/accounting', labelKey: 'nav.accounting', icon: BookOpen },
      { to: '/income-expenses', labelKey: 'nav.incomeExpenses', icon: ArrowLeftRight },
      { to: '/profit-distribution', labelKey: 'nav.profitDistribution', icon: PieChart }
    ]
  },
  {
    label: 'REPORTS',
    items: [{ to: '/reports', labelKey: 'nav.reports', icon: FileBarChart }]
  },
  {
    label: 'ADMIN',
    items: [{ to: '/settings', labelKey: 'nav.settings', icon: Settings }]
  }
]

export const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const filterItems = (to: string): boolean => {
    if (!user) return false
    if (user.role === 'Cashier') {
      // Cashier cannot access accounting, profit distribution, settings
      if (
        to.startsWith('/accounting') ||
        to.startsWith('/profit-distribution') ||
        to.startsWith('/settings')
      ) {
        return false
      }
    }
    return true
  }

  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => filterItems(item.to))
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="w-55 bg-[#1E293B] text-[#CBD5E1] flex flex-col h-full shrink-0 border-r border-[#334155] select-none text-[13px]">
      {/* Top organization brand row - compact 48px matching topbar */}
      <div className="h-12 px-3.5 border-b border-[#334155] flex items-center justify-between">
        <span className="font-semibold text-white tracking-wide truncate text-[14px]">
          {t('app.title')}
        </span>
        <span className="text-[10px] bg-[#334155] text-slate-300 px-1.5 py-0.5 rounded font-mono">
          OFFLINE
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-2 overflow-y-auto space-y-4">
        {filteredNavGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <div className="px-3.5 py-1 text-[10px] font-semibold tracking-wider text-[#94A3B8] uppercase">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 h-9 font-medium transition-colors text-[13px] border-l-[3px] rtl:border-l-0 rtl:border-r-[3px] ${
                      isActive
                        ? 'bg-[#334155] text-white border-[#0F766E] font-semibold'
                        : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-[#334155]/60'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.75} className="shrink-0 text-current" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom system status */}
      <div className="px-3.5 py-2.5 border-t border-[#334155] text-[11px] text-[#94A3B8] flex items-center justify-between">
        <span>Desktop Edition</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Offline Active" />
      </div>
    </aside>
  )
}
