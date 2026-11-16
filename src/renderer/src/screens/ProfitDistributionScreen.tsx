import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator, CheckCircle2, Users, PieChart } from 'lucide-react'
import {
  PageHeader,
  DataTable,
  Column,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  MoneyInput,
  Card,
  StatCard,
  useToast
} from '../components'
import { profitDistributionService } from '../services/profitDistributionService'
import { settingsService } from '../services/settingsService'
import { ProfitDistribution, ProfitDistributionMember } from '@shared/types'
import { formatMoney, formatDate } from '../utils/formatters'

export const ProfitDistributionScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [currentDist, setCurrentDist] = useState<ProfitDistribution | null>(null)
  const [fiscalYear, setFiscalYear] = useState('2026-2027')
  const [isLoading, setIsLoading] = useState(true)

  // Calculation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [netProfitPaisa, setNetProfitPaisa] = useState(15000000) // Rs 150,000
  const [reserveRatioPercent, setReserveRatioPercent] = useState(20)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const [dists, settings] = await Promise.all([
        profitDistributionService.getAll(),
        settingsService.getSettings()
      ])
      if (settings?.currentFiscalYear) {
        setFiscalYear(settings.currentFiscalYear)
      }
      if (dists.length > 0) {
        setCurrentDist(dists[0])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCalculateModal = (): void => {
    setNetProfitPaisa(15000000)
    setReserveRatioPercent(20)
    setIsModalOpen(true)
  }

  const handleCalculate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (netProfitPaisa <= 0) {
      toastError('Please enter a net profit greater than zero')
      return
    }

    try {
      setIsSubmitting(true)
      const calculated = await profitDistributionService.calculate(
        fiscalYear,
        netProfitPaisa,
        reserveRatioPercent
      )
      success(t('common.success'), 'Profit distribution calculated successfully.')
      setCurrentDist(calculated)
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to calculate profit distribution')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePostDistribution = async (): Promise<void> => {
    if (!currentDist) return
    try {
      await profitDistributionService.post(currentDist.id)
      success(
        t('common.success'),
        'Profit dividends successfully credited to member savings accounts.'
      )
      loadData()
    } catch (err: any) {
      toastError(err?.message || 'Failed to post distribution')
    }
  }

  const memberShareColumns: Column<ProfitDistributionMember>[] = [
    {
      key: 'memberNo',
      header: t('members.memberNo'),
      sortable: true,
      render: (m) => <span className="font-mono font-bold text-slate-800">{m.memberNo}</span>
    },
    {
      key: 'memberName',
      header: t('members.fullName'),
      sortable: true
    },
    {
      key: 'averageSavingsPaisa',
      header: t('members.savingsBalance'),
      sortable: true,
      align: 'right',
      render: (m) => (
        <span className="font-semibold text-slate-800">{formatMoney(m.averageSavingsPaisa)}</span>
      )
    },
    {
      key: 'profitSharePaisa',
      header: 'Profit Share / Dividend',
      sortable: true,
      align: 'right',
      render: (m) => (
        <span className="font-black text-emerald-800 text-base">
          {formatMoney(m.profitSharePaisa)}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('profitDistribution.title')}
        subtitle={t('profitDistribution.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<Calculator className="w-5 h-5" />}
              onClick={handleOpenCalculateModal}
            >
              {t('profitDistribution.calculate')}
            </Button>
            {currentDist && currentDist.status === 'draft' && (
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 className="w-5 h-5" />}
                onClick={handlePostDistribution}
              >
                {t('profitDistribution.postDistribution')}
              </Button>
            )}
          </div>
        }
      />

      {currentDist && (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title={t('profitDistribution.netProfit')}
              value={formatMoney(currentDist.totalNetProfitPaisa)}
              icon={<PieChart className="w-6 h-6" />}
              iconBgColor="bg-emerald-100 text-emerald-800"
            />
            <StatCard
              title={t('profitDistribution.distributableProfit')}
              value={formatMoney(currentDist.distributedPaisa)}
              icon={<CheckCircle2 className="w-6 h-6" />}
              iconBgColor="bg-sky-100 text-sky-800"
            />
            <StatCard
              title={t('profitDistribution.reserveRatio')}
              value={formatMoney(currentDist.retainedReservesPaisa)}
              icon={<Calculator className="w-6 h-6" />}
              iconBgColor="bg-amber-100 text-amber-800"
            />
            <StatCard
              title={t('profitDistribution.memberCount')}
              value={currentDist.memberCount}
              icon={<Users className="w-6 h-6" />}
              iconBgColor="bg-purple-100 text-purple-800"
            />
          </div>

          <Card
            title={`Member Allocations — ${currentDist.distributionNo} (${currentDist.fiscalYear})`}
            subtitle={`Status: ${currentDist.status.toUpperCase()} • Calculated on ${formatDate(currentDist.date)}`}
            actions={
              <Badge variant={currentDist.status} size="md">
                {t(`common.${currentDist.status}`)}
              </Badge>
            }
          >
            <DataTable
              data={currentDist.memberAllocations}
              columns={memberShareColumns}
              keyExtractor={(m) => m.memberId}
              searchableFields={['memberNo', 'memberName']}
              defaultSortKey="profitSharePaisa"
              defaultSortOrder="desc"
              isLoading={isLoading}
            />
          </Card>
        </div>
      )}

      {/* Calculate Profit Distribution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('profitDistribution.calculate')}
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
            <Button variant="primary" onClick={handleCalculate} isLoading={isSubmitting}>
              {t('profitDistribution.calculate')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCalculate} className="space-y-4">
          <FormField label={t('topbar.fiscalYear')} required>
            <Input
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              placeholder="2026-2027"
            />
          </FormField>

          <FormField
            label={t('profitDistribution.netProfit')}
            required
            hint="Total annual surplus profit in Rupees"
          >
            <MoneyInput valuePaisa={netProfitPaisa} onChangePaisa={setNetProfitPaisa} autoFocus />
          </FormField>

          <FormField
            label="General Reserve Fund Retention (%)"
            required
            hint="Typically 15% - 25% set aside for capital strength"
          >
            <Input
              type="number"
              min="0"
              max="100"
              value={reserveRatioPercent}
              onChange={(e) => setReserveRatioPercent(Number(e.target.value))}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
