import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader, StatCard, Card, Button, Badge } from '../components'
import { dashboardService, DashboardSummary } from '../services/dashboardService'
import { savingsService } from '../services/savingsService'
import { loanService } from '../services/loanService'
import { formatMoney, formatDate } from '../utils/formatters'
import { SavingsTransaction, Loan } from '@shared/types'

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [recentTx, setRecentTx] = useState<SavingsTransaction[]>([])
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      try {
        setIsLoading(true)
        const [sumData, txData, loansData] = await Promise.all([
          dashboardService.getSummary(),
          savingsService.getTransactions(),
          loanService.getAll()
        ])
        setSummary(sumData)
        setRecentTx(txData.slice(0, 8))
        setActiveLoans(loansData.filter((l) => l.status === 'active').slice(0, 8))
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.quickStats')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={<Plus size={14} strokeWidth={1.75} />}
              onClick={() => navigate('/members')}
            >
              {t('dashboard.newMember')}
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Plus size={14} strokeWidth={1.75} />}
              onClick={() => navigate('/savings')}
            >
              {t('dashboard.newDeposit')}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={14} strokeWidth={1.75} />}
              onClick={() => navigate('/repayments')}
            >
              {t('dashboard.newRepayment')}
            </Button>
          </div>
        }
      />

      {/* Row of 4-5 compact summary tiles (white, 1px border, small grey label above, 22px semibold number below, NO icons in coloured circles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title={t('dashboard.totalMembers')}
          value={isLoading ? '...' : (summary?.totalMembers ?? 0)}
          subtext="Active registered members"
          onClick={() => navigate('/members')}
        />

        <StatCard
          title={t('dashboard.totalSavings')}
          value={isLoading ? '...' : formatMoney(summary?.totalSavingsPaisa ?? 0)}
          subtext="Total member deposits"
          onClick={() => navigate('/savings')}
        />

        <StatCard
          title={t('dashboard.activeLoans')}
          value={isLoading ? '...' : formatMoney(summary?.totalLoansOutstandingPaisa ?? 0)}
          subtext={`${summary?.activeLoansCount ?? 0} active loans`}
          onClick={() => navigate('/loans')}
        />

        <StatCard
          title={t('dashboard.cashInHand')}
          value={isLoading ? '...' : formatMoney(summary?.cashInHandPaisa ?? 0)}
          subtext="Safe cash register"
          onClick={() => navigate('/accounting')}
        />
      </div>

      {/* Simple professional bar chart in accent color with grey gridlines */}
      <Card
        title="Weekly Collections & Repayments (PKR)"
        subtitle="Current month cash inflow summary"
      >
        <div className="h-36 w-full flex items-end gap-6 pt-6 pb-2 px-4 border-b border-[#D9DDE3]">
          {[
            { label: 'Week 1', amount: 85000, height: '55%' },
            { label: 'Week 2', amount: 120000, height: '80%' },
            { label: 'Week 3', amount: 95000, height: '65%' },
            { label: 'Week 4', amount: 154000, height: '95%' }
          ].map((bar) => (
            <div
              key={bar.label}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            >
              <span className="text-[11px] text-[#6B7280] tabular-nums font-medium">
                Rs {bar.amount.toLocaleString()}
              </span>
              <div
                style={{ height: bar.height }}
                className="w-full max-w-[54px] bg-[#0F766E] rounded-t-[3px] transition-all hover:bg-[#115E59]"
              />
              <span className="text-[12px] font-medium text-[#1F2937]">{bar.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Two dense side-by-side tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Collections (Recent Transactions) */}
        <Card
          title="Recent Savings Transactions"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/savings')}>
              View all
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6] text-[#374151] text-[12px] font-semibold border-b border-[#D9DDE3]">
                  <th className="py-2 px-3">Receipt</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#6B7280]">
                      No transactions recorded
                    </td>
                  </tr>
                ) : (
                  recentTx.map((tx) => (
                    <tr key={tx.id} className="h-[34px] hover:bg-[#F9FAFB]">
                      <td className="py-1.5 px-3 font-mono text-[12px] text-[#1F2937]">
                        {tx.receiptNo}
                      </td>
                      <td className="py-1.5 px-3 capitalize font-medium text-[#1F2937]">
                        {tx.type}
                      </td>
                      <td className="py-1.5 px-3 text-[#6B7280] text-[12px]">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-medium tabular-nums text-[#1F2937]">
                        {formatMoney(tx.amountPaisa)}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <Badge variant={tx.status}>{tx.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Active & Overdue Loans */}
        <Card
          title="Active Loans"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/loans')}>
              View all
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6] text-[#374151] text-[12px] font-semibold border-b border-[#D9DDE3]">
                  <th className="py-2 px-3">Loan No</th>
                  <th className="py-2 px-3">Member</th>
                  <th className="py-2 px-3 text-right">Installment</th>
                  <th className="py-2 px-3 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6B7280]">
                      No active loans
                    </td>
                  </tr>
                ) : (
                  activeLoans.map((loan) => (
                    <tr key={loan.id} className="h-[34px] hover:bg-[#F9FAFB]">
                      <td className="py-1.5 px-3 font-mono text-[12px] text-[#1F2937]">
                        {loan.loanNo}
                      </td>
                      <td className="py-1.5 px-3 font-medium text-[#1F2937]">{loan.memberName}</td>
                      <td className="py-1.5 px-3 text-right font-medium tabular-nums text-[#1F2937]">
                        {formatMoney(loan.monthlyInstallmentPaisa)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-semibold tabular-nums text-[#B91C1C]">
                        {formatMoney(loan.outstandingPaisa)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
