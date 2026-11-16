import { Account, JournalEntry } from '@shared/types'

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    code: '1010',
    name: 'Cash in Hand (Safe)',
    category: 'asset',
    balancePaisa: 48500000, // Rs 485,000.00
    description: 'Physical cash held in office safe for daily transactions',
    isActive: true
  },
  {
    id: 'acc-2',
    code: '1020',
    name: 'Bank Account (HBL)',
    category: 'asset',
    balancePaisa: 250000000, // Rs 2,500,000.00
    description: 'Habib Bank Ltd - Chak Jhumra Branch',
    isActive: true
  },
  {
    id: 'acc-3',
    code: '1030',
    name: 'Loans Receivable (Members)',
    category: 'asset',
    balancePaisa: 8460000, // Rs 84,600.00
    description: 'Outstanding principal on active loans issued to members',
    isActive: true
  },
  {
    id: 'acc-4',
    code: '2010',
    name: 'Members Savings Vault Deposits',
    category: 'liability',
    balancePaisa: 35350000, // Rs 353,500.00
    description: 'Total savings deposits owed to members',
    isActive: true
  },
  {
    id: 'acc-5',
    code: '2020',
    name: 'Undistributed Profit Payable',
    category: 'liability',
    balancePaisa: 1200000, // Rs 12,000.00
    description: 'Declared dividend profit awaiting disbursement',
    isActive: true
  },
  {
    id: 'acc-6',
    code: '3010',
    name: 'General Reserve Fund',
    category: 'equity',
    balancePaisa: 260000000, // Rs 2,600,000.00
    description: 'Emergency and capital reserve built from surplus profits',
    isActive: true
  },
  {
    id: 'acc-7',
    code: '4010',
    name: 'Loan Markup / Profit Income',
    category: 'income',
    balancePaisa: 1760000, // Rs 17,600.00
    description: 'Profit earned on micro-loans disbursed',
    isActive: true
  },
  {
    id: 'acc-8',
    code: '4020',
    name: 'Admission & Passbook Fees',
    category: 'income',
    balancePaisa: 350000, // Rs 3,500.00
    description: 'One-time registration and membership fees',
    isActive: true
  },
  {
    id: 'acc-9',
    code: '5010',
    name: 'Office Rent & Electricity',
    category: 'expense',
    balancePaisa: 1500000, // Rs 15,000.00
    description: 'Village office monthly rent and electricity bill',
    isActive: true
  },
  {
    id: 'acc-10',
    code: '5020',
    name: 'Stationary & Printing',
    category: 'expense',
    balancePaisa: 420000, // Rs 4,200.00
    description: 'Passbooks, receipt books, and stationery',
    isActive: true
  }
]

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je-1',
    entryNo: 'JV-2026-001',
    date: '2026-11-01',
    narration: 'Cash received from Muhammad Aslam for monthly savings',
    status: 'posted',
    totalDebitPaisa: 500000,
    totalCreditPaisa: 500000,
    createdAt: '2026-11-01T10:15:00',
    createdBy: 'Tariq Cashier',
    lines: [
      {
        id: 'jel-1',
        accountId: 'acc-1',
        accountCode: '1010',
        accountName: 'Cash in Hand (Safe)',
        debitPaisa: 500000,
        creditPaisa: 0,
        description: 'Cash deposit receipt DEP-2026-089'
      },
      {
        id: 'jel-2',
        accountId: 'acc-4',
        accountCode: '2010',
        accountName: 'Members Savings Vault Deposits',
        debitPaisa: 0,
        creditPaisa: 500000,
        description: 'Credited to Member M-001'
      }
    ]
  },
  {
    id: 'je-2',
    entryNo: 'JV-2026-002',
    date: '2026-11-03',
    narration: 'Monthly loan installment collected from Muhammad Aslam',
    status: 'posted',
    totalDebitPaisa: 540000,
    totalCreditPaisa: 540000,
    createdAt: '2026-11-03T11:30:00',
    createdBy: 'Tariq Cashier',
    lines: [
      {
        id: 'jel-3',
        accountId: 'acc-1',
        accountCode: '1010',
        accountName: 'Cash in Hand (Safe)',
        debitPaisa: 540000,
        creditPaisa: 0,
        description: 'Installment received REP-2026-101'
      },
      {
        id: 'jel-4',
        accountId: 'acc-3',
        accountCode: '1030',
        accountName: 'Loans Receivable (Members)',
        debitPaisa: 0,
        creditPaisa: 500000,
        description: 'Principal recovery LN-2026-001'
      },
      {
        id: 'jel-5',
        accountId: 'acc-7',
        accountCode: '4010',
        accountName: 'Loan Markup / Profit Income',
        debitPaisa: 0,
        creditPaisa: 40000,
        description: 'Markup component'
      }
    ]
  },
  {
    id: 'je-3',
    entryNo: 'JV-2026-003',
    date: '2026-11-04',
    narration: 'Office stationary and register printing payment',
    status: 'posted',
    totalDebitPaisa: 150000,
    totalCreditPaisa: 150000,
    createdAt: '2026-11-04T14:00:00',
    createdBy: 'Tariq Cashier',
    lines: [
      {
        id: 'jel-6',
        accountId: 'acc-10',
        accountCode: '5020',
        accountName: 'Stationary & Printing',
        debitPaisa: 150000,
        creditPaisa: 0,
        description: 'Register books voucher VCH-2026-015'
      },
      {
        id: 'jel-7',
        accountId: 'acc-1',
        accountCode: '1010',
        accountName: 'Cash in Hand (Safe)',
        debitPaisa: 0,
        creditPaisa: 150000,
        description: 'Paid in cash'
      }
    ]
  }
]
