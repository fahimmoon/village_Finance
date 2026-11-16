import { ProfitDistribution, OrganizationSettings, User } from '@shared/types'

export const mockProfitDistributions: ProfitDistribution[] = [
  {
    id: 'pd-1',
    distributionNo: 'PD-FY25-26',
    fiscalYear: '2025-2026',
    periodStart: '2025-07-01',
    periodEnd: '2026-06-30',
    totalNetProfitPaisa: 18500000, // Rs 185,000.00
    distributedPaisa: 14800000, // Rs 148,000.00 (80%)
    retainedReservesPaisa: 3700000, // Rs 37,000.00 (20%)
    date: '2026-07-15',
    status: 'posted',
    memberCount: 5,
    memberAllocations: [
      {
        memberId: 'm-1',
        memberNo: 'M-001',
        memberName: 'Muhammad Aslam',
        averageSavingsPaisa: 7500000,
        profitSharePaisa: 4100000
      },
      {
        memberId: 'm-2',
        memberNo: 'M-002',
        memberName: 'Abdul Rashid',
        averageSavingsPaisa: 3800000,
        profitSharePaisa: 2080000
      },
      {
        memberId: 'm-3',
        memberNo: 'M-003',
        memberName: 'Ghulam Mustafa',
        averageSavingsPaisa: 10500000,
        profitSharePaisa: 5740000
      },
      {
        memberId: 'm-4',
        memberNo: 'M-004',
        memberName: 'Razia Sultana',
        averageSavingsPaisa: 2800000,
        profitSharePaisa: 1530000
      },
      {
        memberId: 'm-6',
        memberNo: 'M-006',
        memberName: 'Shaukat Ali',
        averageSavingsPaisa: 2500000,
        profitSharePaisa: 1350000
      }
    ]
  }
]

export const mockSettings: OrganizationSettings = {
  orgName: 'Anjuman Falah-o-Behbood Chak 42-RB',
  orgNameUrdu: 'انجمن فلاح و بہبود چک 42 آر بی',
  registrationNo: 'REG/COOP/FSD/2022/412',
  address: 'Chak No. 42-RB, Tehsil Chak Jhumra, District Faisalabad',
  phone: '041-8765432 / 0300-1234567',
  currentFiscalYear: '2026-2027',
  currencySymbol: 'Rs',
  currencyName: 'Pakistani Rupee'
}

export const mockCurrentUser: User = {
  id: 'usr-1',
  username: 'cashier1',
  fullName: 'Tariq Mehmood',
  role: 'cashier'
}
