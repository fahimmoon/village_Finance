import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiggyBank, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react'
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
  useToast
} from '../components'
import { savingsService } from '../services/savingsService'
import { SavingsAccount, SavingsTransaction } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

export const SavingsScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState('accounts')
  const [accounts, setAccounts] = useState<SavingsAccount[]>([])
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Transaction Modal State
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amountPaisa, setAmountPaisa] = useState<number>(0)
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptNo, setReceiptNo] = useState('')
  const [narration, setNarration] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reversal Confirmation
  const [reversalTxId, setReversalTxId] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [accs, txs] = await Promise.all([
        savingsService.getAllAccounts(),
        savingsService.getTransactions()
      ])
      setAccounts(accs)
      setTransactions(txs)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenTxModal = (type: 'deposit' | 'withdrawal'): void => {
    setTxType(type)
    setSelectedAccountId(accounts[0]?.id || '')
    setAmountPaisa(0)
    setTxDate(new Date().toISOString().split('T')[0])
    setReceiptNo(`${type === 'deposit' ? 'DEP' : 'WTH'}-${Date.now().toString().slice(-4)}`)
    setNarration('')
    setIsTxModalOpen(true)
  }

  const handleSaveTransaction = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedAccountId) {
      toastError('Please select a savings account')
      return
    }
    if (amountPaisa <= 0) {
      toastError('Please enter a valid amount greater than zero')
      return
    }

    const acc = accounts.find((a) => a.id === selectedAccountId)
    if (!acc) return

    if (txType === 'withdrawal' && acc.balancePaisa < amountPaisa) {
      toastError(`Insufficient funds. Current balance is ${formatMoney(acc.balancePaisa)}`)
      return
    }

    try {
      setIsSubmitting(true)
      await savingsService.recordTransaction({
        savingsAccountId: selectedAccountId,
        memberId: acc.memberId,
        type: txType,
        amountPaisa,
        date: txDate,
        receiptNo: receiptNo.trim() || `TX-${Date.now()}`,
        narration: narration.trim()
      })
      success(
        t('common.success'),
        `${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} posted successfully.`
      )
      setIsTxModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReversal = async (): Promise<void> => {
    if (!reversalTxId) return
    try {
      await savingsService.reverseTransaction(reversalTxId)
      success(t('common.success'), 'Transaction reversed successfully')
      setReversalTxId(null)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to reverse transaction')
    }
  }

  const accountColumns: Column<SavingsAccount>[] = [
    {
      key: 'accountNo',
      header: t('savings.accountNo'),
      sortable: true,
      render: (a) => <span className="font-mono font-bold text-emerald-800">{a.accountNo}</span>
    },
    {
      key: 'memberName',
      header: t('members.fullName'),
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.memberName}</span>
          <span className="text-xs text-slate-500 font-mono">{a.memberNo}</span>
        </div>
      )
    },
    {
      key: 'balancePaisa',
      header: t('savings.balance'),
      sortable: true,
      align: 'right',
      render: (a) => (
        <span className="font-bold text-lg text-emerald-800">{formatMoney(a.balancePaisa)}</span>
      )
    },
    {
      key: 'openedOn',
      header: t('members.joinedOn'),
      sortable: true,
      render: (a) => formatDate(a.openedOn)
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (a) => (
        <Badge variant={a.status === 'active' ? 'active' : 'inactive'} size="sm" dot>
          {t(`common.${a.status}`)}
        </Badge>
      )
    }
  ]

  const transactionColumns: Column<SavingsTransaction>[] = [
    {
      key: 'receiptNo',
      header: t('repayments.receiptNo'),
      sortable: true,
      render: (t) => <span className="font-mono font-bold text-slate-800">{t.receiptNo}</span>
    },
    {
      key: 'date',
      header: t('common.date'),
      sortable: true,
      render: (t) => formatDate(t.date)
    },
    {
      key: 'type',
      header: t('common.description'),
      sortable: true,
      render: (tx) => (
        <div className="flex items-center gap-2">
          <Badge variant={tx.type === 'deposit' ? 'active' : 'neutral'} size="sm">
            {tx.type === 'deposit' ? t('savings.deposit') : t('savings.withdraw')}
          </Badge>
          <span className="text-xs text-slate-500 truncate max-w-xs">{tx.narration || '—'}</span>
        </div>
      )
    },
    {
      key: 'amountPaisa',
      header: t('common.amount'),
      sortable: true,
      align: 'right',
      render: (tx) => (
        <span
          className={`font-black text-base ${
            tx.type === 'deposit' ? 'text-emerald-700' : 'text-slate-800'
          }`}
        >
          {tx.type === 'deposit' ? '+' : '-'}
          {formatMoney(tx.amountPaisa)}
        </span>
      )
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (tx) => (
        <Badge variant={tx.status} size="sm">
          {t(`common.${tx.status}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (tx) =>
        tx.status === 'posted' ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setReversalTxId(tx.id)}
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
        title={t('savings.title')}
        subtitle={t('savings.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<ArrowUpRight className="w-5 h-5" />}
              onClick={() => handleOpenTxModal('withdrawal')}
            >
              {t('savings.withdraw')}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<ArrowDownLeft className="w-5 h-5" />}
              onClick={() => handleOpenTxModal('deposit')}
            >
              {t('savings.deposit')}
            </Button>
          </div>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'accounts',
            label: t('savings.title'),
            badge: accounts.length,
            icon: <PiggyBank className="w-4 h-4" />
          },
          {
            id: 'history',
            label: t('savings.history'),
            badge: transactions.length,
            icon: <ArrowDownLeft className="w-4 h-4" />
          }
        ]}
      />

      {activeTab === 'accounts' ? (
        <DataTable
          data={accounts}
          columns={accountColumns}
          keyExtractor={(a) => a.id}
          searchableFields={['accountNo', 'memberName', 'memberNo']}
          defaultSortKey="balancePaisa"
          defaultSortOrder="desc"
          isLoading={isLoading}
        />
      ) : (
        <DataTable
          data={transactions}
          columns={transactionColumns}
          keyExtractor={(tx) => tx.id}
          searchableFields={['receiptNo', 'narration']}
          defaultSortKey="date"
          defaultSortOrder="desc"
          isLoading={isLoading}
        />
      )}

      {/* Transaction Modal (Deposit / Withdrawal) */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={txType === 'deposit' ? t('savings.deposit') : t('savings.withdraw')}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsTxModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={txType === 'deposit' ? 'primary' : 'danger'}
              onClick={handleSaveTransaction}
              isLoading={isSubmitting}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <FormField label={t('savings.title')} required>
            <Select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.memberName} ({a.memberNo}) — Balance: {formatMoney(a.balancePaisa)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label={t('common.amount')}
            required
            hint="Enter amount in Rupees. Will be safely stored in Paisa."
          >
            <MoneyInput valuePaisa={amountPaisa} onChangePaisa={setAmountPaisa} autoFocus />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('common.date')} required>
              <DatePicker value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </FormField>

            <FormField label={t('repayments.receiptNo')} required>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="DEP-001"
              />
            </FormField>
          </div>

          <FormField label={t('common.notes')}>
            <Input
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Monthly savings contribution"
            />
          </FormField>
        </form>
      </Modal>

      {/* Reversal Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!reversalTxId}
        onClose={() => setReversalTxId(null)}
        onConfirm={handleConfirmReversal}
        title={t('common.reverse')}
        message={t('common.confirmReverseText')}
        confirmText={t('common.reverse')}
        variant="danger"
      />
    </div>
  )
}
