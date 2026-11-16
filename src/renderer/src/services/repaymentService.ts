import { Repayment } from '@shared/types'
import { mockRepayments } from '../mock/repayments'
import { loanService } from './loanService'

let repaymentsState: Repayment[] = [...mockRepayments]

export const repaymentService = {
  async getAll(): Promise<Repayment[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...repaymentsState]), 50))
  },

  async getById(id: string): Promise<Repayment | null> {
    return new Promise((resolve) => {
      const found = repaymentsState.find((r) => r.id === id) || null
      setTimeout(() => resolve(found), 50)
    })
  },

  async create(data: Omit<Repayment, 'id' | 'status'>): Promise<Repayment> {
    const newRep: Repayment = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'posted'
    }
    repaymentsState = [newRep, ...repaymentsState]
    await loanService.updatePayment(data.loanId, data.amountPaisa)
    return newRep
  },

  async reverse(id: string): Promise<Repayment> {
    const index = repaymentsState.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Repayment not found')
    const rep = repaymentsState[index]
    if (rep.status === 'reversed') throw new Error('Repayment is already reversed')

    const updated: Repayment = { ...rep, status: 'reversed' }
    repaymentsState[index] = updated
    // Reverse loan payment amount
    await loanService.updatePayment(rep.loanId, -rep.amountPaisa)
    return updated
  }
}
