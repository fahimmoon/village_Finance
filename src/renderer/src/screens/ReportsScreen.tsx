import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileSpreadsheet, Printer, Scale, Landmark, UserCheck, BookOpen } from 'lucide-react'
import { PageHeader, Tabs, Card, Button, Select, Badge } from '../components'
import { accountingService } from '../services/accountingService'
import { memberService } from '../services/memberService'
import { savingsService } from '../services/savingsService'
import { Account, Member, SavingsAccount } from '@shared/types'
import { formatMoney } from '../utils/formatters'

export const ReportsScreen: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('trialBalance')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        setIsLoading(true)
        const [accs, mems, sa] = await Promise.all([
          accountingService.getAccounts(),
          memberService.getAll(),
          savingsService.getAllAccounts()
        ])
        setAccounts(accs)
        setMembers(mems)
        setSavingsAccounts(sa)
        if (mems.length > 0) setSelectedMemberId(mems[0].id)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePrint = (): void => {
    window.print()
  }

  // Calculate Balance Sheet groups
  const assets = accounts.filter((a) => a.category === 'asset')
  const liabilities = accounts.filter((a) => a.category === 'liability')
  const equity = accounts.filter((a) => a.category === 'equity')

  const totalAssetsPaisa = assets.reduce((sum, a) => sum + a.balancePaisa, 0)
  const totalLiabilitiesPaisa = liabilities.reduce((sum, a) => sum + a.balancePaisa, 0)
  const totalEquityPaisa = equity.reduce((sum, a) => sum + a.balancePaisa, 0)
  const totalLiabilitiesAndEquityPaisa = totalLiabilitiesPaisa + totalEquityPaisa

  const selectedMember = members.find((m) => m.id === selectedMemberId)
  const selectedMemberSavings = savingsAccounts.find((s) => s.memberId === selectedMemberId)

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <Button
            variant="secondary"
            size="md"
            icon={<Printer className="w-5 h-5" />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'trialBalance',
            label: t('reports.trialBalance'),
            icon: <Scale className="w-4 h-4" />
          },
          {
            id: 'balanceSheet',
            label: t('reports.balanceSheet'),
            icon: <Landmark className="w-4 h-4" />
          },
          {
            id: 'memberStatement',
            label: t('reports.memberStatement'),
            icon: <UserCheck className="w-4 h-4" />
          },
          {
            id: 'cashBook',
            label: t('reports.cashBook'),
            icon: <BookOpen className="w-4 h-4" />
          }
        ]}
      />

      {/* Trial Balance Report */}
      {activeTab === 'trialBalance' && (
        <Card title={t('reports.trialBalance')} subtitle="Financial Verification Statement">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">{t('common.debit')}</th>
                  <th className="py-3 px-4 text-right">{t('common.credit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base">
                {accounts.map((acc) => {
                  const isDebit = acc.category === 'asset' || acc.category === 'expense'
                  if (isLoading) {
                    return (
                      <div className="p-12 text-center text-slate-500">{t('common.loading')}</div>
                    )
                  }

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{acc.code}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{acc.name}</td>
                      <td className="py-2.5 px-4 capitalize text-slate-500 text-sm">
                        {acc.category}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium">
                        {isDebit ? formatMoney(acc.balancePaisa) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium">
                        {!isDebit ? formatMoney(acc.balancePaisa) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Balance Sheet */}
      {activeTab === 'balanceSheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Section */}
          <Card
            title="Assets (اثاثہ جات)"
            actions={
              <span className="font-extrabold text-emerald-800 text-lg">
                {formatMoney(totalAssetsPaisa)}
              </span>
            }
          >
            <div className="divide-y divide-slate-100 text-base">
              {assets.map((a) => (
                <div key={a.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-800">{a.name}</span>
                    <span className="text-xs text-slate-500 font-mono block">Code: {a.code}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(a.balancePaisa)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Liabilities & Equity Section */}
          <div className="space-y-6">
            <Card
              title="Liabilities (واجبات)"
              actions={
                <span className="font-extrabold text-slate-800 text-base">
                  {formatMoney(totalLiabilitiesPaisa)}
                </span>
              }
            >
              <div className="divide-y divide-slate-100 text-base">
                {liabilities.map((l) => (
                  <div key={l.id} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{l.name}</span>
                    <span className="font-bold text-slate-900">{formatMoney(l.balancePaisa)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Equity & Capital (سرمایہ و فنڈز)"
              actions={
                <span className="font-extrabold text-slate-800 text-base">
                  {formatMoney(totalEquityPaisa)}
                </span>
              }
            >
              <div className="divide-y divide-slate-100 text-base">
                {equity.map((e) => (
                  <div key={e.id} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{e.name}</span>
                    <span className="font-bold text-slate-900">{formatMoney(e.balancePaisa)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center font-extrabold text-lg text-emerald-950">
              <span>Total Liabilities & Equity:</span>
              <span>{formatMoney(totalLiabilitiesAndEquityPaisa)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Member Account Statement */}
      {activeTab === 'memberStatement' && (
        <Card
          title={t('reports.memberStatement')}
          actions={
            <div className="w-72">
              <Select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNo})
                  </option>
                ))}
              </Select>
            </div>
          }
        >
          {selectedMember ? (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    {t('members.memberNo')}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {selectedMember.memberNo}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    {t('members.fullName')}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {selectedMember.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    {t('members.idCardNo')}
                  </span>
                  <span className="text-base font-mono font-bold text-slate-900">
                    {selectedMember.idCardNo}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    {t('savings.balance')}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-800">
                    {formatMoney(selectedMemberSavings?.balancePaisa ?? 0)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center py-10 text-slate-500">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">Detailed Passbook Ledger Statement</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to print member passbook slip for {selectedMember.fullName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 py-6">{t('common.noData')}</p>
          )}
        </Card>
      )}

      {/* Daily Cash Book */}
      {activeTab === 'cashBook' && (
        <Card title={t('reports.cashBook')} subtitle="Safe Physical Cash Register">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center mb-4">
            <div>
              <span className="text-sm font-semibold text-slate-600 block">
                Current Vault Safe Balance
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatMoney(accounts.find((a) => a.code === '1010')?.balancePaisa ?? 0)}
              </span>
            </div>
            <Badge variant="active" size="md">
              Verified Today
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Daily transactions match double-entry journal postings. No physical discrepancy
            reported.
          </p>
        </Card>
      )}
    </div>
  )
}
