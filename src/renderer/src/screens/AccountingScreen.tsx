import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpenCheck,
  Plus,
  Trash2,
  RotateCcw,
  Scale,
  ListFilter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import {
  PageHeader,
  Tabs,
  DataTable,
  Column,
  Button,
  Badge,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Select,
  DatePicker,
  MoneyInput,
  Card,
  useToast
} from '../components'
import { accountingService } from '../services/accountingService'
import { Account, JournalEntry, JournalEntryLine } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

interface EntryLineState {
  id: string
  accountId: string
  debitPaisa: number
  creditPaisa: number
  description: string
}

export const AccountingScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState('journal')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [trialBalanceData, setTrialBalanceData] = useState<{
    accounts: Account[]
    totalDebitsPaisa: number
    totalCreditsPaisa: number
    isBalanced: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // New Journal Entry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [narration, setNarration] = useState('')
  const [lines, setLines] = useState<EntryLineState[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reversal State
  const [reversalEntryId, setReversalEntryId] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [accs, jEntries, tb] = await Promise.all([
        accountingService.getAccounts(),
        accountingService.getJournalEntries(),
        accountingService.getTrialBalance()
      ])
      setAccounts(accs)
      setEntries(jEntries)
      setTrialBalanceData(tb)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate live debits vs credits for validation
  const totalDebitPaisa = lines.reduce((sum, line) => sum + (line.debitPaisa || 0), 0)
  const totalCreditPaisa = lines.reduce((sum, line) => sum + (line.creditPaisa || 0), 0)
  const isBalanced = totalDebitPaisa > 0 && totalDebitPaisa === totalCreditPaisa
  const differencePaisa = Math.abs(totalDebitPaisa - totalCreditPaisa)

  const handleOpenNewEntryModal = (): void => {
    const firstAcc = accounts[0]?.id || ''
    const secondAcc = accounts[1]?.id || ''
    setEntryDate(new Date().toISOString().split('T')[0])
    setNarration('')
    setLines([
      { id: '1', accountId: firstAcc, debitPaisa: 0, creditPaisa: 0, description: '' },
      { id: '2', accountId: secondAcc, debitPaisa: 0, creditPaisa: 0, description: '' }
    ])
    setIsModalOpen(true)
  }

  const handleAddLine = (): void => {
    const firstAcc = accounts[0]?.id || ''
    setLines([
      ...lines,
      {
        id: String(Date.now()),
        accountId: firstAcc,
        debitPaisa: 0,
        creditPaisa: 0,
        description: ''
      }
    ])
  }

  const handleRemoveLine = (index: number): void => {
    if (lines.length <= 2) {
      toastError('A double-entry journal entry must have at least 2 lines')
      return
    }
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (
    index: number,
    field: keyof EntryLineState,
    value: string | number
  ): void => {
    const updated = [...lines]
    updated[index] = { ...updated[index], [field]: value }
    // If setting debit > 0, reset credit to 0
    if (field === 'debitPaisa' && Number(value) > 0) {
      updated[index].creditPaisa = 0
    }
    // If setting credit > 0, reset debit to 0
    if (field === 'creditPaisa' && Number(value) > 0) {
      updated[index].debitPaisa = 0
    }
    setLines(updated)
  }

  const handleSaveEntry = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!isBalanced) {
      toastError('Debits and Credits must be equal before saving')
      return
    }
    if (!narration.trim()) {
      toastError('Please provide a narration for the journal entry')
      return
    }

    try {
      setIsSubmitting(true)
      const entryNo = `JV-${new Date().getFullYear()}-${String(entries.length + 1).padStart(3, '0')}`

      const journalLines: JournalEntryLine[] = lines.map((l, idx) => {
        const acc = accounts.find((a) => a.id === l.accountId)
        return {
          id: `jel-${Date.now()}-${idx}`,
          accountId: l.accountId,
          accountCode: acc?.code || '0000',
          accountName: acc?.name || 'General Account',
          debitPaisa: l.debitPaisa,
          creditPaisa: l.creditPaisa,
          description: l.description.trim() || undefined
        }
      })

      await accountingService.createJournalEntry({
        entryNo,
        date: entryDate,
        narration: narration.trim(),
        lines: journalLines,
        totalDebitPaisa,
        totalCreditPaisa,
        createdBy: 'Cashier'
      })

      success(t('common.success'), `Journal entry ${entryNo} posted successfully.`)
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to post journal entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReversal = async (): Promise<void> => {
    if (!reversalEntryId) return
    try {
      await accountingService.reverseJournalEntry(reversalEntryId)
      success(t('common.success'), 'Journal entry reversed with a balancing reversal entry.')
      setReversalEntryId(null)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to reverse entry')
    }
  }

  // Columns for Journal Entries
  const entryColumns: Column<JournalEntry>[] = [
    {
      key: 'entryNo',
      header: t('accounting.entryNo'),
      sortable: true,
      render: (j) => <span className="font-mono font-bold text-slate-800">{j.entryNo}</span>
    },
    {
      key: 'date',
      header: t('common.date'),
      sortable: true,
      render: (j) => formatDate(j.date)
    },
    {
      key: 'narration',
      header: t('accounting.narration'),
      className: 'max-w-md',
      render: (j) => (
        <div>
          <span className="font-semibold text-slate-900 block">{j.narration}</span>
          <span className="text-xs text-slate-500 font-mono">
            {j.lines.length} lines • By {j.createdBy}
          </span>
          {j.reversedByEntryNo && (
            <span className="text-xs text-rose-700 block font-bold">
              Reversed by {j.reversedByEntryNo}
            </span>
          )}
          {j.reversesEntryNo && (
            <span className="text-xs text-amber-700 block font-bold">
              Reversal of {j.reversesEntryNo}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'totalDebitPaisa',
      header: t('accounting.debitTotal'),
      sortable: true,
      align: 'right',
      render: (j) => (
        <span className="font-bold text-slate-900">{formatMoney(j.totalDebitPaisa)}</span>
      )
    },
    {
      key: 'totalCreditPaisa',
      header: t('accounting.creditTotal'),
      sortable: true,
      align: 'right',
      render: (j) => (
        <span className="font-bold text-slate-900">{formatMoney(j.totalCreditPaisa)}</span>
      )
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (j) => (
        <Badge variant={j.status} size="sm">
          {t(`common.${j.status}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (j) =>
        j.status === 'posted' ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setReversalEntryId(j.id)}
            className="text-slate-600 hover:text-rose-700"
          >
            {t('common.reverse')}
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">{t('common.reversed')}</span>
        )
    }
  ]

  // Columns for Chart of Accounts
  const accountColumns: Column<Account>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (a) => <span className="font-mono font-bold text-slate-800">{a.code}</span>
    },
    {
      key: 'name',
      header: 'Account Name',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.name}</span>
          <span className="text-xs text-slate-500">{a.description}</span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (a) => (
        <Badge variant="neutral" size="sm" className="capitalize">
          {a.category}
        </Badge>
      )
    },
    {
      key: 'balancePaisa',
      header: t('common.balance'),
      sortable: true,
      align: 'right',
      render: (a) => (
        <span className="font-bold text-base text-slate-900">{formatMoney(a.balancePaisa)}</span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('accounting.title')}
        subtitle={t('accounting.subtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-5 h-5" />}
            onClick={handleOpenNewEntryModal}
          >
            {t('accounting.newEntry')}
          </Button>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'journal',
            label: t('accounting.journalEntries'),
            badge: entries.length,
            icon: <BookOpenCheck className="w-4 h-4" />
          },
          {
            id: 'accounts',
            label: t('accounting.chartOfAccounts'),
            badge: accounts.length,
            icon: <ListFilter className="w-4 h-4" />
          },
          {
            id: 'trialBalance',
            label: t('reports.trialBalance'),
            icon: <Scale className="w-4 h-4" />
          }
        ]}
      />

      {activeTab === 'journal' && (
        <DataTable
          data={entries}
          columns={entryColumns}
          keyExtractor={(j) => j.id}
          searchableFields={['entryNo', 'narration', 'createdBy']}
          defaultSortKey="date"
          defaultSortOrder="desc"
          isLoading={isLoading}
        />
      )}

      {activeTab === 'accounts' && (
        <DataTable
          data={accounts}
          columns={accountColumns}
          keyExtractor={(a) => a.id}
          searchableFields={['code', 'name', 'category', 'description']}
          defaultSortKey="code"
          defaultSortOrder="asc"
          isLoading={isLoading}
        />
      )}

      {activeTab === 'trialBalance' && trialBalanceData && (
        <Card title={t('reports.trialBalance')} subtitle="Double-Entry Balance Verification">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4 text-right">{t('common.debit')}</th>
                  <th className="py-3 px-4 text-right">{t('common.credit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base">
                {trialBalanceData.accounts.map((acc) => {
                  const isDebit = acc.category === 'asset' || acc.category === 'expense'
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{acc.code}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{acc.name}</td>
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
              <tfoot>
                <tr className="bg-emerald-50/80 border-t-2 border-slate-300 font-extrabold text-lg text-slate-900">
                  <td colSpan={2} className="py-4 px-4 text-slate-800">
                    Grand Total
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-800">
                    {formatMoney(trialBalanceData.totalDebitsPaisa)}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-800">
                    {formatMoney(trialBalanceData.totalCreditsPaisa)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {trialBalanceData.isBalanced ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-700" />
              )}
              <span className="font-bold text-base text-slate-800">
                {trialBalanceData.isBalanced ? t('common.balanced') : t('common.unbalanced')}
              </span>
            </div>
            <Badge variant={trialBalanceData.isBalanced ? 'balanced' : 'unbalanced'} size="md">
              {trialBalanceData.isBalanced ? 'Trial Balance Verified' : 'Difference Detected'}
            </Badge>
          </div>
        </Card>
      )}

      {/* New Journal Entry Modal (Strict Debits = Credits enforcement) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('accounting.newEntry')}
        maxWidth="3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Badge variant={isBalanced ? 'balanced' : 'unbalanced'} size="md" dot>
                {isBalanced
                  ? t('common.balanced')
                  : `${t('common.unbalanced')} (Diff: ${formatMoney(differencePaisa)})`}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              {/* HARD RULE: Save button stays disabled until debits = credits */}
              <Button
                variant="primary"
                onClick={handleSaveEntry}
                disabled={!isBalanced || isSubmitting}
                isLoading={isSubmitting}
                title={!isBalanced ? 'Debits must equal Credits to save' : 'Post Journal Entry'}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveEntry} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label={t('common.date')} required>
              <DatePicker value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label={t('accounting.narration')} required>
                <Input
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g. Monthly savings collected from members"
                />
              </FormField>
            </div>
          </div>

          {/* Journal Entry Lines Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                {t('accounting.lines')}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddLine}
              >
                Add Line
              </Button>
            </div>

            <div className="p-4 space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={line.id}
                  className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                >
                  {/* Account Selector */}
                  <div className="col-span-4">
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Account #{idx + 1}
                    </label>
                    <Select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Debit Input */}
                  <div className="col-span-3">
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      {t('common.debit')}
                    </label>
                    <MoneyInput
                      valuePaisa={line.debitPaisa}
                      onChangePaisa={(paisa) => handleLineChange(idx, 'debitPaisa', paisa)}
                    />
                  </div>

                  {/* Credit Input */}
                  <div className="col-span-3">
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      {t('common.credit')}
                    </label>
                    <MoneyInput
                      valuePaisa={line.creditPaisa}
                      onChangePaisa={(paisa) => handleLineChange(idx, 'creditPaisa', paisa)}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-2 flex justify-end pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleRemoveLine(idx)}
                      className="text-slate-400 hover:text-rose-700"
                      title="Remove Line"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 grid grid-cols-12 gap-3 font-bold text-base">
              <div className="col-span-4 text-right pr-4 text-slate-700">Totals:</div>
              <div className="col-span-3 text-emerald-800 font-extrabold">
                {formatMoney(totalDebitPaisa)}
              </div>
              <div className="col-span-3 text-emerald-800 font-extrabold">
                {formatMoney(totalCreditPaisa)}
              </div>
              <div className="col-span-2" />
            </div>
          </div>
        </form>
      </Modal>

      {/* Reversal Confirmation */}
      <ConfirmDialog
        isOpen={!!reversalEntryId}
        onClose={() => setReversalEntryId(null)}
        onConfirm={handleConfirmReversal}
        title={t('accounting.reverseEntry')}
        message={t('common.confirmReverseText')}
        confirmText={t('common.reverse')}
        variant="danger"
      />
    </div>
  )
}
