import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReceiptText, RotateCcw } from 'lucide-react'
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
  useToast
} from '../components'
import { repaymentService } from '../services/repaymentService'
import { loanService } from '../services/loanService'
import { Repayment, Loan } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

export const RepaymentsScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [repayments, setRepayments] = useState<Repayment[]>([])
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Collect Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLoanId, setSelectedLoanId] = useState('')
  const [amountPaisa, setAmountPaisa] = useState<number>(0)
  const [receiptNo, setReceiptNo] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reversal State
  const [reversalId, setReversalId] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [repData, loansData] = await Promise.all([
        repaymentService.getAll(),
        loanService.getAll()
      ])
      setRepayments(repData)
      setActiveLoans(loansData.filter((l) => l.status === 'active'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (): void => {
    const firstLoan = activeLoans[0]
    setSelectedLoanId(firstLoan?.id || '')
    setAmountPaisa(firstLoan ? firstLoan.monthlyInstallmentPaisa : 0)
    setReceiptNo(`REP-${Date.now().toString().slice(-4)}`)
    setPaymentDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setIsModalOpen(true)
  }

  const handleLoanChange = (loanId: string): void => {
    setSelectedLoanId(loanId)
    const loan = activeLoans.find((l) => l.id === loanId)
    if (loan) {
      setAmountPaisa(loan.monthlyInstallmentPaisa)
    }
  }

  const handleCollect = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedLoanId) {
      toastError('Please select a loan')
      return
    }
    if (amountPaisa <= 0) {
      toastError('Please specify repayment amount greater than zero')
      return
    }

    const loan = activeLoans.find((l) => l.id === selectedLoanId)
    if (!loan) return

    // Rough calculation of principal vs profit portion based on loan's profit rate
    const profitRatio = loan.profitPaisa / loan.totalPayablePaisa
    const profitPortionPaisa = Math.round(amountPaisa * profitRatio)
    const principalPortionPaisa = amountPaisa - profitPortionPaisa

    try {
      setIsSubmitting(true)
      await repaymentService.create({
        receiptNo: receiptNo.trim() || `REP-${Date.now()}`,
        loanId: loan.id,
        loanNo: loan.loanNo,
        memberId: loan.memberId,
        memberName: loan.memberName,
        amountPaisa,
        principalPortionPaisa,
        profitPortionPaisa,
        paymentDate,
        notes: notes.trim()
      })

      success(t('common.success'), `Repayment receipt ${receiptNo} recorded.`)
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to record repayment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReversal = async (): Promise<void> => {
    if (!reversalId) return
    try {
      await repaymentService.reverse(reversalId)
      success(t('common.success'), 'Repayment reversed successfully')
      setReversalId(null)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to reverse repayment')
    }
  }

  const columns: Column<Repayment>[] = [
    {
      key: 'receiptNo',
      header: t('repayments.receiptNo'),
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-slate-800">{r.receiptNo}</span>
    },
    {
      key: 'loanNo',
      header: t('loans.loanNo'),
      sortable: true,
      render: (r) => <span className="font-mono text-emerald-800 font-semibold">{r.loanNo}</span>
    },
    {
      key: 'memberName',
      header: t('members.fullName'),
      sortable: true
    },
    {
      key: 'amountPaisa',
      header: t('common.amount'),
      sortable: true,
      align: 'right',
      render: (r) => (
        <span className="font-bold text-base text-slate-900">{formatMoney(r.amountPaisa)}</span>
      )
    },
    {
      key: 'principalPortionPaisa',
      header: t('repayments.principalPortion'),
      align: 'right',
      render: (r) => (
        <span className="text-slate-600 font-medium">{formatMoney(r.principalPortionPaisa)}</span>
      )
    },
    {
      key: 'profitPortionPaisa',
      header: t('repayments.profitPortion'),
      align: 'right',
      render: (r) => (
        <span className="text-emerald-700 font-medium">{formatMoney(r.profitPortionPaisa)}</span>
      )
    },
    {
      key: 'paymentDate',
      header: t('common.date'),
      sortable: true,
      render: (r) => formatDate(r.paymentDate)
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (r) => (
        <Badge variant={r.status} size="sm">
          {t(`common.${r.status}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (r) =>
        r.status === 'posted' ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setReversalId(r.id)}
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
        title={t('repayments.title')}
        subtitle={t('repayments.subtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<ReceiptText className="w-5 h-5" />}
            onClick={handleOpenModal}
          >
            {t('repayments.recordPayment')}
          </Button>
        }
      />

      <DataTable
        data={repayments}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchableFields={['receiptNo', 'loanNo', 'memberName', 'notes']}
        defaultSortKey="paymentDate"
        defaultSortOrder="desc"
        isLoading={isLoading}
      />

      {/* Collect Repayment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('repayments.recordPayment')}
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
            <Button variant="primary" onClick={handleCollect} isLoading={isSubmitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCollect} className="space-y-4">
          <FormField label={t('loans.title')} required>
            <Select value={selectedLoanId} onChange={(e) => handleLoanChange(e.target.value)}>
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.memberName} ({l.loanNo}) — Remaining: {formatMoney(l.outstandingPaisa)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label={t('common.amount')}
            required
            hint="Enter collected installment in Rupees"
          >
            <MoneyInput valuePaisa={amountPaisa} onChangePaisa={setAmountPaisa} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('common.date')} required>
              <DatePicker value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </FormField>

            <FormField label={t('repayments.receiptNo')} required>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="REP-104"
              />
            </FormField>
          </div>

          <FormField label={t('common.notes')}>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Installment # 3"
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
