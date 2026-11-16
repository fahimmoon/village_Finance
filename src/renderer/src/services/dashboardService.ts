import { memberService } from './memberService'
import { savingsService } from './savingsService'
import { loanService } from './loanService'
import { accountingService } from './accountingService'

export interface DashboardSummary {
  totalMembers: number
  activeLoansCount: number
  totalLoansOutstandingPaisa: number
  totalSavingsPaisa: number
  cashInHandPaisa: number
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const members = await memberService.getAll()
    const loans = await loanService.getAll()
    const savings = await savingsService.getAllAccounts()
    const accounts = await accountingService.getAccounts()

    const activeLoans = loans.filter((l) => l.status === 'active')
    const totalLoansOutstandingPaisa = activeLoans.reduce((sum, l) => sum + l.outstandingPaisa, 0)
    const totalSavingsPaisa = savings.reduce((sum, s) => sum + s.balancePaisa, 0)
    const cashAccount = accounts.find((a) => a.code === '1010')
    const cashInHandPaisa = cashAccount ? cashAccount.balancePaisa : 0

    return {
      totalMembers: members.length,
      activeLoansCount: activeLoans.length,
      totalLoansOutstandingPaisa,
      totalSavingsPaisa,
      cashInHandPaisa
    }
  }
}
