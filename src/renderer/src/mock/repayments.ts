import { Repayment } from '@shared/types'

export const mockRepayments: Repayment[] = [
  {
    id: 'rep-1',
    receiptNo: 'REP-2026-101',
    loanId: 'l-1',
    loanNo: 'LN-2026-001',
    memberId: 'm-1',
    memberName: 'Muhammad Aslam',
    amountPaisa: 540000, // Rs 5,400.00
    principalPortionPaisa: 500000, // Rs 5,000.00
    profitPortionPaisa: 40000, // Rs 400.00
    paymentDate: '2026-11-03',
    status: 'posted',
    notes: 'Installment # 5'
  },
  {
    id: 'rep-2',
    receiptNo: 'REP-2026-102',
    loanId: 'l-2',
    loanNo: 'LN-2026-002',
    memberId: 'm-3',
    memberName: 'Ghulam Mustafa',
    amountPaisa: 900000, // Rs 9,000.00
    principalPortionPaisa: 833333,
    profitPortionPaisa: 66667,
    paymentDate: '2026-11-05',
    status: 'posted',
    notes: 'Installment # 8'
  },
  {
    id: 'rep-3',
    receiptNo: 'REP-2026-103',
    loanId: 'l-4',
    loanNo: 'LN-2026-004',
    memberId: 'm-4',
    memberName: 'Razia Sultana',
    amountPaisa: 540000, // Rs 5,400.00
    principalPortionPaisa: 500000,
    profitPortionPaisa: 40000,
    paymentDate: '2026-11-08',
    status: 'posted',
    notes: 'Installment # 2'
  }
]
