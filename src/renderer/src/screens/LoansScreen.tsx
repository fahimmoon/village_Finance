import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HandCoins } from 'lucide-react'
import {
  PageHeader,
  DataTable,
  Column,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  DatePicker,
  MoneyInput,
  useToast
} from '../components'
import { loanService } from '../services/loanService'
import { memberService } from '../services/memberService'
import { Loan, Member } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

export const LoansScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [loans, setLoans] = useState<Loan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // New Loan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [principalPaisa, setPrincipalPaisa] = useState(5000000) // Rs 50,000
  const [profitRatePercent, setProfitRatePercent] = useState(8)
  const [termMonths, setTermMonths] = useState(12)
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split('T')[0])
  const [purpose, setPurpose] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [lData, mData] = await Promise.all([loanService.getAll(), memberService.getAll()])
      setLoans(lData)
      setMembers(mData.filter((m) => m.status === 'active'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculations for new loan
  const profitPaisa = Math.round(principalPaisa * (profitRatePercent / 100))
  const totalPayablePaisa = principalPaisa + profitPaisa
  const monthlyInstallmentPaisa = termMonths > 0 ? Math.round(totalPayablePaisa / termMonths) : 0

  const handleOpenModal = (): void => {
    setSelectedMemberId(members[0]?.id || '')
    setPrincipalPaisa(5000000)
    setProfitRatePercent(8)
    setTermMonths(12)
    setDisbursementDate(new Date().toISOString().split('T')[0])
    setPurpose('')
    setIsModalOpen(true)
  }

  const handleIssueLoan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedMemberId) {
      toastError('Please select a member')
      return
    }
    if (principalPaisa <= 0) {
      toastError('Please specify principal amount greater than zero')
      return
    }

    const member = members.find((m) => m.id === selectedMemberId)
    if (!member) return

    try {
      setIsSubmitting(true)
      const loanNo = `LN-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`
      await loanService.create({
        loanNo,
        memberId: member.id,
        memberName: member.fullName,
        memberNo: member.memberNo,
        principalPaisa,
        profitRatePercent,
        profitPaisa,
        totalPayablePaisa,
        termMonths,
        monthlyInstallmentPaisa,
        disbursementDate,
        status: 'active',
        purpose: purpose.trim() || 'General Community Micro-finance'
      })

      success(t('common.success'), `Loan ${loanNo} issued successfully`)
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to issue loan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Loan>[] = [
    {
      key: 'loanNo',
      header: t('loans.loanNo'),
      sortable: true,
      render: (l) => <span className="font-mono font-bold text-slate-800">{l.loanNo}</span>
    },
    {
      key: 'memberName',
      header: t('members.fullName'),
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-bold text-slate-900 block">{l.memberName}</span>
          <span className="text-xs text-slate-500 font-mono">{l.memberNo}</span>
        </div>
      )
    },
    {
      key: 'principalPaisa',
      header: t('loans.principal'),
      sortable: true,
      align: 'right',
      render: (l) => (
        <span className="font-bold text-slate-800">{formatMoney(l.principalPaisa)}</span>
      )
    },
    {
      key: 'totalPayablePaisa',
      header: t('loans.totalPayable'),
      sortable: true,
      align: 'right',
      render: (l) => (
        <span className="font-bold text-slate-900">{formatMoney(l.totalPayablePaisa)}</span>
      )
    },
    {
      key: 'outstandingPaisa',
      header: t('loans.outstanding'),
      sortable: true,
      align: 'right',
      render: (l) => (
        <span className="font-black text-rose-700">{formatMoney(l.outstandingPaisa)}</span>
      )
    },
    {
      key: 'monthlyInstallmentPaisa',
      header: t('loans.installment'),
      align: 'right',
      render: (l) => (
        <span className="font-bold text-emerald-800">
          {formatMoney(l.monthlyInstallmentPaisa)}/mo
        </span>
      )
    },
    {
      key: 'disbursementDate',
      header: t('common.date'),
      sortable: true,
      render: (l) => formatDate(l.disbursementDate)
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (l) => (
        <Badge variant={l.status} size="sm" dot>
          {t(`common.${l.status}`)}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('loans.title')}
        subtitle={t('loans.subtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<HandCoins className="w-5 h-5" />}
            onClick={handleOpenModal}
          >
            {t('loans.issueLoan')}
          </Button>
        }
      />

      <DataTable
        data={loans}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchableFields={['loanNo', 'memberName', 'memberNo', 'purpose']}
        defaultSortKey="loanNo"
        defaultSortOrder="desc"
        isLoading={isLoading}
      />

      {/* Issue Loan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('loans.issueLoan')}
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleIssueLoan} isLoading={isSubmitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleIssueLoan} className="space-y-4">
          <FormField label={t('members.fullName')} required>
            <Select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberNo}) — CNIC: {m.idCardNo}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('loans.principal')} required hint="Enter loan principal in Rupees">
            <MoneyInput valuePaisa={principalPaisa} onChangePaisa={setPrincipalPaisa} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Profit Rate (%)" required>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={profitRatePercent}
                onChange={(e) => setProfitRatePercent(Number(e.target.value))}
              />
            </FormField>

            <FormField label={t('loans.term')} required>
              <Input
                type="number"
                min="1"
                max="36"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
              />
            </FormField>
          </div>

          {/* Real-time Loan Calculation Summary Card */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <h4 className="font-bold text-sm text-emerald-900 uppercase tracking-wider">
              Repayment Schedule Summary
            </h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-slate-600 block text-xs">Markup / Profit:</span>
                <span className="font-bold text-slate-800">{formatMoney(profitPaisa)}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-xs">Total Payable:</span>
                <span className="font-bold text-slate-900">{formatMoney(totalPayablePaisa)}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-xs">Monthly Installment:</span>
                <span className="font-black text-emerald-800">
                  {formatMoney(monthlyInstallmentPaisa)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('common.date')} required>
              <DatePicker
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
              />
            </FormField>

            <FormField label={t('loans.purpose')}>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Agricultural seeds, small shop"
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  )
}
