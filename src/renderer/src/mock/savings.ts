import { SavingsAccount, SavingsTransaction } from '@shared/types'

export const mockSavingsAccounts: SavingsAccount[] = [
  {
    id: 'sa-1',
    accountNo: 'SAV-001',
    memberId: 'm-1',
    memberName: 'Muhammad Aslam',
    memberNo: 'M-001',
    balancePaisa: 8500000, // Rs 85,000.00
    status: 'active',
    openedOn: '2023-01-15'
  },
  {
    id: 'sa-2',
    accountNo: 'SAV-002',
    memberId: 'm-2',
    memberName: 'Abdul Rashid',
    memberNo: 'M-002',
    balancePaisa: 4250000, // Rs 42,500.00
    status: 'active',
    openedOn: '2023-02-10'
  },
  {
    id: 'sa-3',
    accountNo: 'SAV-003',
    memberId: 'm-3',
    memberName: 'Ghulam Mustafa',
    memberNo: 'M-003',
    balancePaisa: 12000000, // Rs 120,000.00
    status: 'active',
    openedOn: '2023-03-01'
  },
  {
    id: 'sa-4',
    accountNo: 'SAV-004',
    memberId: 'm-4',
    memberName: 'Razia Sultana',
    memberNo: 'M-004',
    balancePaisa: 3100000, // Rs 31,000.00
    status: 'active',
    openedOn: '2023-05-20'
  },
  {
    id: 'sa-5',
    accountNo: 'SAV-005',
    memberId: 'm-5',
    memberName: 'Allah Ditta',
    memberNo: 'M-005',
    balancePaisa: 1500000, // Rs 15,000.00
    status: 'active',
    openedOn: '2023-08-14'
  },
  {
    id: 'sa-6',
    accountNo: 'SAV-006',
    memberId: 'm-6',
    memberName: 'Shaukat Ali',
    memberNo: 'M-006',
    balancePaisa: 6000000, // Rs 60,000.00
    status: 'active',
    openedOn: '2024-02-01'
  }
]

export const mockSavingsTransactions: SavingsTransaction[] = [
  {
    id: 'st-1',
    savingsAccountId: 'sa-1',
    memberId: 'm-1',
    type: 'deposit',
    amountPaisa: 500000, // Rs 5,000.00
    date: '2026-11-01',
    receiptNo: 'DEP-2026-089',
    narration: 'Monthly savings contribution',
    status: 'posted'
  },
  {
    id: 'st-2',
    savingsAccountId: 'sa-2',
    memberId: 'm-2',
    type: 'deposit',
    amountPaisa: 300000, // Rs 3,000.00
    date: '2026-11-02',
    receiptNo: 'DEP-2026-090',
    narration: 'Monthly regular savings',
    status: 'posted'
  },
  {
    id: 'st-3',
    savingsAccountId: 'sa-3',
    memberId: 'm-3',
    type: 'withdrawal',
    amountPaisa: 1000000, // Rs 10,000.00
    date: '2026-11-05',
    receiptNo: 'WTH-2026-021',
    narration: 'Emergency medical withdrawal',
    status: 'posted'
  },
  {
    id: 'st-4',
    savingsAccountId: 'sa-4',
    memberId: 'm-4',
    type: 'deposit',
    amountPaisa: 250000, // Rs 2,500.00
    date: '2026-11-10',
    receiptNo: 'DEP-2026-095',
    narration: 'Monthly savings deposit',
    status: 'posted'
  }
]
