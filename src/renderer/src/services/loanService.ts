import { Loan } from '@shared/types'
import { mockLoans } from '../mock/loans'

let loansState: Loan[] = [...mockLoans]

export const loanService = {
  async getAll(): Promise<Loan[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...loansState]), 50))
  },

  async getById(id: string): Promise<Loan | null> {
    return new Promise((resolve) => {
      const found = loansState.find((l) => l.id === id) || null
      setTimeout(() => resolve(found), 50)
    })
  },

  async create(loanData: Omit<Loan, 'id' | 'paidPaisa' | 'outstandingPaisa'>): Promise<Loan> {
    return new Promise((resolve) => {
      const newLoan: Loan = {
        ...loanData,
        id: `l-${Date.now()}`,
        paidPaisa: 0,
        outstandingPaisa: loanData.totalPayablePaisa
      }
      loansState = [newLoan, ...loansState]
      setTimeout(() => resolve(newLoan), 50)
    })
  },

  async updatePayment(loanId: string, paidAmountPaisa: number): Promise<Loan> {
    return new Promise((resolve, reject) => {
      const index = loansState.findIndex((l) => l.id === loanId)
      if (index === -1) return reject(new Error('Loan not found'))

      const loan = loansState[index]
      const newPaid = loan.paidPaisa + paidAmountPaisa
      const newOutstanding = Math.max(0, loan.totalPayablePaisa - newPaid)
      const updated: Loan = {
        ...loan,
        paidPaisa: newPaid,
        outstandingPaisa: newOutstanding,
        status: newOutstanding === 0 ? 'completed' : loan.status
      }
      loansState[index] = updated
      setTimeout(() => resolve(updated), 50)
    })
  }
}
