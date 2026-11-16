import { IncomeExpenseItem } from '@shared/types'
import { mockIncomeExpenses } from '../mock/incomeExpenses'

let itemsState: IncomeExpenseItem[] = [...mockIncomeExpenses]

export const incomeExpenseService = {
  async getAll(): Promise<IncomeExpenseItem[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...itemsState]), 50))
  },

  async create(data: Omit<IncomeExpenseItem, 'id' | 'status'>): Promise<IncomeExpenseItem> {
    const newItem: IncomeExpenseItem = {
      ...data,
      id: `ie-${Date.now()}`,
      status: 'posted'
    }
    itemsState = [newItem, ...itemsState]
    return newItem
  },

  async reverse(id: string): Promise<IncomeExpenseItem> {
    const index = itemsState.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('Transaction voucher not found')
    const item = itemsState[index]
    if (item.status === 'reversed') throw new Error('Transaction is already reversed')

    const updated: IncomeExpenseItem = { ...item, status: 'reversed' }
    itemsState[index] = updated
    return updated
  }
}
