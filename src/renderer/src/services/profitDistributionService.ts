import { ProfitDistribution } from '@shared/types'
import { mockProfitDistributions } from '../mock/profitDistribution'
import { memberService } from './memberService'
import { savingsService } from './savingsService'

let distributionsState: ProfitDistribution[] = [...mockProfitDistributions]

export const profitDistributionService = {
  async getAll(): Promise<ProfitDistribution[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...distributionsState]), 50))
  },

  async calculate(
    fiscalYear: string,
    netProfitPaisa: number,
    reservePercent: number = 20
  ): Promise<ProfitDistribution> {
    const members = await memberService.getAll()
    const activeMembers = members.filter((m) => m.status === 'active')
    const savingsAccounts = await savingsService.getAllAccounts()

    const retainedReservesPaisa = Math.round(netProfitPaisa * (reservePercent / 100))
    const distributablePaisa = netProfitPaisa - retainedReservesPaisa

    // Calculate total eligible savings balance
    let totalEligibleSavingsPaisa = 0
    const memberBalances: {
      memberId: string
      memberNo: string
      memberName: string
      savings: number
    }[] = []

    for (const member of activeMembers) {
      const sa = savingsAccounts.find((a) => a.memberId === member.id)
      const balance = sa ? sa.balancePaisa : 0
      if (balance > 0) {
        totalEligibleSavingsPaisa += balance
        memberBalances.push({
          memberId: member.id,
          memberNo: member.memberNo,
          memberName: member.fullName,
          savings: balance
        })
      }
    }

    const memberAllocations = memberBalances.map((mb) => {
      const shareRatio = totalEligibleSavingsPaisa > 0 ? mb.savings / totalEligibleSavingsPaisa : 0
      const sharePaisa = Math.round(distributablePaisa * shareRatio)
      return {
        memberId: mb.memberId,
        memberNo: mb.memberNo,
        memberName: mb.memberName,
        averageSavingsPaisa: mb.savings,
        profitSharePaisa: sharePaisa
      }
    })

    const newDist: ProfitDistribution = {
      id: `pd-${Date.now()}`,
      distributionNo: `PD-${fiscalYear}`,
      fiscalYear,
      periodStart: `${fiscalYear.split('-')[0]}-07-01`,
      periodEnd: `${fiscalYear.split('-')[1]}-06-30`,
      totalNetProfitPaisa: netProfitPaisa,
      distributedPaisa: distributablePaisa,
      retainedReservesPaisa,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      memberCount: memberAllocations.length,
      memberAllocations
    }

    distributionsState = [newDist, ...distributionsState]
    return newDist
  },

  async post(id: string): Promise<ProfitDistribution> {
    const index = distributionsState.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Distribution calculation not found')
    const dist = distributionsState[index]
    const updated: ProfitDistribution = { ...dist, status: 'posted' }
    distributionsState[index] = updated
    return updated
  }
}
