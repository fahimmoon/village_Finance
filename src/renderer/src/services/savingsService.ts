import { SavingsAccount, SavingsTransaction } from '@shared/types'
import { mockSavingsAccounts, mockSavingsTransactions } from '../mock/savings'

let accountsState: SavingsAccount[] = [...mockSavingsAccounts]
let transactionsState: SavingsTransaction[] = [...mockSavingsTransactions]

export const savingsService = {
  async getAllAccounts(): Promise<SavingsAccount[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...accountsState]), 50))
  },

  async getAccountById(id: string): Promise<SavingsAccount | null> {
    return new Promise((resolve) => {
      const found = accountsState.find((a) => a.id === id) || null
      setTimeout(() => resolve(found), 50)
    })
  },

  async getTransactions(accountId?: string): Promise<SavingsTransaction[]> {
    return new Promise((resolve) => {
      let result = [...transactionsState]
      if (accountId) {
        result = result.filter((t) => t.savingsAccountId === accountId)
      }
      setTimeout(() => resolve(result), 50)
    })
  },

  async recordTransaction(
    data: Omit<SavingsTransaction, 'id' | 'status'>
  ): Promise<SavingsTransaction> {
    return new Promise((resolve, reject) => {
      const accountIndex = accountsState.findIndex((a) => a.id === data.savingsAccountId)
      if (accountIndex === -1) {
        return reject(new Error('Savings account not found'))
      }

      const account = accountsState[accountIndex]
      if (data.type === 'withdrawal' && account.balancePaisa < data.amountPaisa) {
        return reject(new Error('Insufficient funds in savings account'))
      }

      // Update account balance
      const newBalance =
        data.type === 'withdrawal'
          ? account.balancePaisa - data.amountPaisa
          : account.balancePaisa + data.amountPaisa

      accountsState[accountIndex] = {
        ...account,
        balancePaisa: newBalance
      }

      const newTx: SavingsTransaction = {
        ...data,
        id: `st-${Date.now()}`,
        status: 'posted'
      }

      transactionsState = [newTx, ...transactionsState]
      setTimeout(() => resolve(newTx), 50)
    })
  },

  async reverseTransaction(id: string): Promise<SavingsTransaction> {
    return new Promise((resolve, reject) => {
      const txIndex = transactionsState.findIndex((t) => t.id === id)
      if (txIndex === -1) {
        return reject(new Error('Transaction not found'))
      }

      const tx = transactionsState[txIndex]
      if (tx.status === 'reversed') {
        return reject(new Error('Transaction is already reversed'))
      }

      const accountIndex = accountsState.findIndex((a) => a.id === tx.savingsAccountId)
      if (accountIndex !== -1) {
        const account = accountsState[accountIndex]
        // Reverse balance effect
        const reversedBalance =
          tx.type === 'withdrawal'
            ? account.balancePaisa + tx.amountPaisa
            : account.balancePaisa - tx.amountPaisa

        accountsState[accountIndex] = {
          ...account,
          balancePaisa: reversedBalance
        }
      }

      const updatedTx: SavingsTransaction = {
        ...tx,
        status: 'reversed'
      }

      transactionsState[txIndex] = updatedTx
      setTimeout(() => resolve(updatedTx), 50)
    })
  }
}
