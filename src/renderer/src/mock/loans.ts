import { Loan } from '@shared/types'

export const mockLoans: Loan[] = [
  {
    id: 'l-1',
    loanNo: 'LN-2026-001',
    memberId: 'm-1',
    memberName: 'Muhammad Aslam',
    memberNo: 'M-001',
    principalPaisa: 5000000, // Rs 50,000.00
    profitRatePercent: 8,
    profitPaisa: 400000, // Rs 4,000.00
    totalPayablePaisa: 5400000, // Rs 54,000.00
    paidPaisa: 2700000, // Rs 27,000.00
    outstandingPaisa: 2700000, // Rs 27,000.00
    termMonths: 10,
    monthlyInstallmentPaisa: 540000, // Rs 5,400.00
    disbursementDate: '2026-06-01',
    status: 'active',
    purpose: 'Fertilizer and agricultural seeds purchase'
  },
  {
    id: 'l-2',
    loanNo: 'LN-2026-002',
    memberId: 'm-3',
    memberName: 'Ghulam Mustafa',
    memberNo: 'M-003',
    principalPaisa: 10000000, // Rs 100,000.00
    profitRatePercent: 8,
    profitPaisa: 800000, // Rs 8,000.00
    totalPayablePaisa: 10800000, // Rs 108,000.00
    paidPaisa: 7200000, // Rs 72,000.00
    outstandingPaisa: 3600000, // Rs 36,000.00
    termMonths: 12,
    monthlyInstallmentPaisa: 900000, // Rs 9,000.00
    disbursementDate: '2026-03-15',
    status: 'active',
    purpose: 'Village grocery shop inventory expansion'
  },
  {
    id: 'l-3',
    loanNo: 'LN-2026-003',
    memberId: 'm-6',
    memberName: 'Shaukat Ali',
    memberNo: 'M-006',
    principalPaisa: 4000000, // Rs 40,000.00
    profitRatePercent: 8,
    profitPaisa: 320000, // Rs 3,200.00
    totalPayablePaisa: 4320000, // Rs 43,200.00
    paidPaisa: 4320000, // Rs 43,200.00
    outstandingPaisa: 0,
    termMonths: 8,
    monthlyInstallmentPaisa: 540000, // Rs 5,400.00
    disbursementDate: '2026-01-10',
    status: 'completed',
    purpose: 'Tube-well motor repair and installation'
  },
  {
    id: 'l-4',
    loanNo: 'LN-2026-004',
    memberId: 'm-4',
    memberName: 'Razia Sultana',
    memberNo: 'M-004',
    principalPaisa: 3000000, // Rs 30,000.00
    profitRatePercent: 8,
    profitPaisa: 240000, // Rs 2,400.00
    totalPayablePaisa: 3240000, // Rs 32,400.00
    paidPaisa: 1080000, // Rs 10,800.00
    outstandingPaisa: 2160000, // Rs 21,600.00
    termMonths: 6,
    monthlyInstallmentPaisa: 540000, // Rs 5,400.00
    disbursementDate: '2026-09-01',
    status: 'active',
    purpose: 'Sewing machine purchase for home business'
  }
]
