import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, TrendingDown, TrendingUp, RotateCcw } from 'lucide-react'
import {
  PageHeader,
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
  StatCard,
  useToast
} from '../components'
import { incomeExpenseService } from '../services/incomeExpenseService'
import { accountingService } from '../services/accountingService'
import { IncomeExpenseItem, Account } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

export const IncomeExpensesScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [items, setItems] = useState<IncomeExpenseItem[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Voucher Modal State
  const [voucherType, setVoucherType] = useState<'income' | 'expense'>('expense')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [voucherNo, setVoucherNo] = useState('')
  const [category, setCategory] = useState('Rent')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amountPaisa, setAmountPaisa] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidToOrReceivedFrom, setPaidToOrReceivedFrom] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reversal State
  const [reversalId, setReversalId] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [ieData, accs] = await Promise.all([
        incomeExpenseService.getAll(),
        accountingService.getAccounts()
      ])
      setItems(ieData)
      setAccounts(accs)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (type: 'income' | 'expense'): void => {
    setVoucherType(type)
    setVoucherNo(`VCH-${type === 'income' ? 'INC' : 'EXP'}-${Date.now().toString().slice(-4)}`)
    setCategory(type === 'expense' ? 'Office Rent' : 'Membership Fee')
    const matchingAccounts = accounts.filter((a) =>
      type === 'expense' ? a.category === 'expense' : a.category === 'income'
    )
    setSelectedAccountId(matchingAccounts[0]?.id || accounts[0]?.id || '')
    setAmountPaisa(0)
    setDate(new Date().toISOString().split('T')[0])
    setPaidToOrReceivedFrom('')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleSaveVoucher = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (amountPaisa <= 0) {
      toastError('Please specify an amount greater than zero')
      return
    }

    const acc = accounts.find((a) => a.id === selectedAccountId)

    try {
      setIsSubmitting(true)
      await incomeExpenseService.create({
        voucherNo: voucherNo.trim() || `VCH-${Date.now()}`,
        type: voucherType,
        category,
        accountId: selectedAccountId,
        accountName: acc?.name || 'General Account',
        amountPaisa,
        date,
        paidToOrReceivedFrom: paidToOrReceivedFrom.trim() || 'Cashier',
        description: description.trim()
      })

      success(
        t('common.success'),
        `${voucherType === 'income' ? 'Income' : 'Expense'} voucher saved.`
      )
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to save voucher')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReversal = async (): Promise<void> => {
    if (!reversalId) return
    try {
      await incomeExpenseService.reverse(reversalId)
      success(t('common.success'), 'Voucher reversed successfully')
      setReversalId(null)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to reverse voucher')
    }
  }

  const totalIncomePaisa = items
    .filter((i) => i.type === 'income' && i.status === 'posted')
    .reduce((sum, i) => sum + i.amountPaisa, 0)

  const totalExpensePaisa = items
    .filter((i) => i.type === 'expense' && i.status === 'posted')
    .reduce((sum, i) => sum + i.amountPaisa, 0)

  const columns: Column<IncomeExpenseItem>[] = [
    {
      key: 'voucherNo',
      header: t('incomeExpenses.voucherNo'),
      sortable: true,
      render: (i) => <span className="font-mono font-bold text-slate-800">{i.voucherNo}</span>
    },
    {
      key: 'date',
      header: t('common.date'),
      sortable: true,
      render: (i) => formatDate(i.date)
    },
    {
      key: 'type',
      header: t('common.description'),
      sortable: true,
      render: (i) => (
        <div className="flex items-center gap-2">
          <Badge variant={i.type === 'income' ? 'active' : 'neutral'} size="sm">
            {i.category}
          </Badge>
          <span className="text-slate-800 font-semibold">{i.description || i.accountName}</span>
        </div>
      )
    },
    {
      key: 'paidToOrReceivedFrom',
      header: t('incomeExpenses.paidToFrom'),
      sortable: true
    },
    {
      key: 'amountPaisa',
      header: t('common.amount'),
      sortable: true,
      align: 'right',
      render: (i) => (
        <span
          className={`font-black text-base ${
            i.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
          }`}
        >
          {i.type === 'income' ? '+' : '-'}
          {formatMoney(i.amountPaisa)}
        </span>
      )
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (i) => (
        <Badge variant={i.status} size="sm">
          {t(`common.${i.status}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (i) =>
        i.status === 'posted' ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setReversalId(i.id)}
            className="text-slate-600 hover:text-rose-700"
          >
            {t('common.reverse')}
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">{t('common.reversed')}</span>
        )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('incomeExpenses.title')}
        subtitle={t('incomeExpenses.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
              onClick={() => handleOpenModal('income')}
            >
              {t('incomeExpenses.recordIncome')}
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<TrendingDown className="w-5 h-5 text-rose-700" />}
              onClick={() => handleOpenModal('expense')}
            >
              {t('incomeExpenses.recordExpense')}
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Operating Income"
          value={formatMoney(totalIncomePaisa)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Total Operating Expenses"
          value={formatMoney(totalExpensePaisa)}
          icon={<TrendingDown className="w-6 h-6" />}
          iconBgColor="bg-rose-100 text-rose-800"
        />
        <StatCard
          title="Operating Surplus"
          value={formatMoney(totalIncomePaisa - totalExpensePaisa)}
          icon={<ArrowLeftRight className="w-6 h-6" />}
          iconBgColor="bg-sky-100 text-sky-800"
        />
      </div>

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(i) => i.id}
        searchableFields={['voucherNo', 'category', 'description', 'paidToOrReceivedFrom']}
        defaultSortKey="date"
        defaultSortOrder="desc"
        isLoading={isLoading}
      />

      {/* Record Voucher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          voucherType === 'income'
            ? t('incomeExpenses.recordIncome')
            : t('incomeExpenses.recordExpense')
        }
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={voucherType === 'income' ? 'primary' : 'danger'}
              onClick={handleSaveVoucher}
              isLoading={isSubmitting}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVoucher} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('incomeExpenses.voucherNo')} required>
              <Input value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} />
            </FormField>

            <FormField label={t('common.date')} required>
              <DatePicker value={date} onChange={(e) => setDate(e.target.value)} />
            </FormField>
          </div>

          <FormField label="Ledger Account" required>
            <Select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name} ({a.category})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('common.amount')} required hint="Amount in Rupees">
            <MoneyInput valuePaisa={amountPaisa} onChangePaisa={setAmountPaisa} autoFocus />
          </FormField>

          <FormField label={t('incomeExpenses.paidToFrom')}>
            <Input
              value={paidToOrReceivedFrom}
              onChange={(e) => setPaidToOrReceivedFrom(e.target.value)}
              placeholder="e.g. Landlord, Stationer, Electrician"
            />
          </FormField>

          <FormField label={t('common.description')}>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Office electricity bill for October"
            />
          </FormField>
        </form>
      </Modal>

      {/* Reversal Confirmation */}
      <ConfirmDialog
        isOpen={!!reversalId}
        onClose={() => setReversalId(null)}
        onConfirm={handleConfirmReversal}
        title={t('common.reverse')}
        message={t('common.confirmReverseText')}
        confirmText={t('common.reverse')}
        variant="danger"
      />
    </div>
  )
}
