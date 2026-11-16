import { IncomeExpenseItem } from '@shared/types'

export const mockIncomeExpenses: IncomeExpenseItem[] = [
  {
    id: 'ie-1',
    voucherNo: 'VCH-EXP-2026-001',
    type: 'expense',
    category: 'Rent',
    accountId: 'acc-9',
    accountName: 'Office Rent & Electricity',
    amountPaisa: 1500000, // Rs 15,000.00
    date: '2026-11-01',
    paidToOrReceivedFrom: 'Haji Noor Muhammad (Landlord)',
    description: 'Monthly office rent for November 2026',
    status: 'posted'
  },
  {
    id: 'ie-2',
    voucherNo: 'VCH-EXP-2026-002',
    type: 'expense',
    category: 'Stationary',
    accountId: 'acc-10',
    accountName: 'Stationary & Printing',
    amountPaisa: 150000, // Rs 1,500.00
    date: '2026-11-04',
    paidToOrReceivedFrom: 'Al-Madina Printing Press',
    description: 'Passbooks and transaction receipts printing',
    status: 'posted'
  },
  {
    id: 'ie-3',
    voucherNo: 'VCH-INC-2026-001',
    type: 'income',
    category: 'Membership Fee',
    accountId: 'acc-8',
    accountName: 'Admission & Passbook Fees',
    amountPaisa: 100000, // Rs 1,000.00
    date: '2026-11-06',
    paidToOrReceivedFrom: 'New Member Registration',
    description: 'Admission fee for newly registered members',
    status: 'posted'
  }
]
