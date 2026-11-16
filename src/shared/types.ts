// Shared TypeScript types for Village Finance

export type Paisa = number // Always stored as integer paisa (e.g. 100 paisa = Rs 1.00)

export type MemberStatus = 'active' | 'inactive' | 'exited'

export interface Member {
  id: string
  memberNo: string
  fullName: string
  fatherName: string
  idCardNo: string
  phone: string
  address: string
  nomineeName: string
  nomineeRelation: string
  joinedOn: string // ISO date YYYY-MM-DD
  status: MemberStatus
}

export type SavingsTransactionType = 'deposit' | 'withdrawal' | 'profit'

export interface SavingsAccount {
  id: string
  accountNo: string
  memberId: string
  memberName: string
  memberNo: string
  balancePaisa: Paisa
  status: 'active' | 'closed' | 'frozen'
  openedOn: string
}

export interface SavingsTransaction {
  id: string
  savingsAccountId: string
  memberId: string
  type: SavingsTransactionType
  amountPaisa: Paisa
  date: string
  receiptNo: string
  narration?: string
  status: 'posted' | 'reversed'
}

export type LoanStatus = 'pending' | 'active' | 'completed' | 'defaulted'

export interface Loan {
  id: string
  loanNo: string
  memberId: string
  memberName: string
  memberNo: string
  principalPaisa: Paisa
  profitRatePercent: number
  profitPaisa: Paisa
  totalPayablePaisa: Paisa
  paidPaisa: Paisa
  outstandingPaisa: Paisa
  termMonths: number
  monthlyInstallmentPaisa: Paisa
  disbursementDate: string
  status: LoanStatus
  purpose: string
}

export interface Repayment {
  id: string
  receiptNo: string
  loanId: string
  loanNo: string
  memberId: string
  memberName: string
  amountPaisa: Paisa
  principalPortionPaisa: Paisa
  profitPortionPaisa: Paisa
  paymentDate: string
  status: 'posted' | 'reversed'
  notes?: string
}

export type AccountCategory = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export interface Account {
  id: string
  code: string
  name: string
  category: AccountCategory
  balancePaisa: Paisa
  description?: string
  isActive: boolean
}

export interface JournalEntryLine {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  debitPaisa: Paisa
  creditPaisa: Paisa
  description?: string
}

export interface JournalEntry {
  id: string
  entryNo: string
  date: string
  narration: string
  lines: JournalEntryLine[]
  totalDebitPaisa: Paisa
  totalCreditPaisa: Paisa
  status: 'posted' | 'reversed'
  reversedByEntryNo?: string
  reversesEntryNo?: string
  createdAt: string
  createdBy: string
}

export interface IncomeExpenseItem {
  id: string
  voucherNo: string
  type: 'income' | 'expense'
  category: string
  accountId: string
  accountName: string
  amountPaisa: Paisa
  date: string
  paidToOrReceivedFrom: string
  description: string
  status: 'posted' | 'reversed'
}

export interface ProfitDistributionMember {
  memberId: string
  memberNo: string
  memberName: string
  averageSavingsPaisa: Paisa
  profitSharePaisa: Paisa
}

export interface ProfitDistribution {
  id: string
  distributionNo: string
  fiscalYear: string
  periodStart: string
  periodEnd: string
  totalNetProfitPaisa: Paisa
  distributedPaisa: Paisa
  retainedReservesPaisa: Paisa
  date: string
  status: 'draft' | 'posted'
  memberCount: number
  memberAllocations: ProfitDistributionMember[]
}

export interface User {
  id: string
  username: string
  fullName: string
  role: 'cashier' | 'manager' | 'admin'
}

export interface OrganizationSettings {
  orgName: string
  orgNameUrdu: string
  registrationNo: string
  address: string
  phone: string
  currentFiscalYear: string
  currencySymbol: string
  currencyName: string
}

export interface StatItem {
  label: string
  value: string | number
  change?: string
  isPositive?: boolean
  subtext?: string
}
