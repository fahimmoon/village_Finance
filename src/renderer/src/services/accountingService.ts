import { Account, JournalEntry } from '@shared/types'
import { mockAccounts, mockJournalEntries } from '../mock/accounting'

let accountsState: Account[] = [...mockAccounts]
let journalEntriesState: JournalEntry[] = [...mockJournalEntries]

export const accountingService = {
  async getAccounts(): Promise<Account[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...accountsState]), 50))
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...journalEntriesState]), 50))
  },

  async getJournalEntryById(id: string): Promise<JournalEntry | null> {
    return new Promise((resolve) => {
      const found = journalEntriesState.find((j) => j.id === id) || null
      setTimeout(() => resolve(found), 50)
    })
  },

  async createJournalEntry(
    entryData: Omit<JournalEntry, 'id' | 'status' | 'createdAt'>
  ): Promise<JournalEntry> {
    return new Promise((resolve, reject) => {
      // Validate that debits equal credits
      if (entryData.totalDebitPaisa !== entryData.totalCreditPaisa) {
        return reject(new Error('Debits must equal Credits. Double-entry system out of balance.'))
      }

      if (entryData.totalDebitPaisa <= 0) {
        return reject(new Error('Total entry amount must be greater than zero.'))
      }

      const newEntry: JournalEntry = {
        ...entryData,
        id: `je-${Date.now()}`,
        status: 'posted',
        createdAt: new Date().toISOString()
      }

      // Update account balances
      entryData.lines.forEach((line) => {
        const accIndex = accountsState.findIndex((a) => a.id === line.accountId)
        if (accIndex !== -1) {
          const acc = accountsState[accIndex]
          // Normal balance rules:
          // Assets & Expenses increase with Debit, decrease with Credit
          // Liabilities, Equity & Income increase with Credit, decrease with Debit
          const isDebitNormal = acc.category === 'asset' || acc.category === 'expense'
          const delta = isDebitNormal
            ? line.debitPaisa - line.creditPaisa
            : line.creditPaisa - line.debitPaisa

          accountsState[accIndex] = {
            ...acc,
            balancePaisa: acc.balancePaisa + delta
          }
        }
      })

      journalEntriesState = [newEntry, ...journalEntriesState]
      setTimeout(() => resolve(newEntry), 50)
    })
  },

  async reverseJournalEntry(id: string, reason?: string): Promise<JournalEntry> {
    return new Promise((resolve, reject) => {
      const index = journalEntriesState.findIndex((j) => j.id === id)
      if (index === -1) return reject(new Error('Journal entry not found'))

      const original = journalEntriesState[index]
      if (original.status === 'reversed') {
        return reject(new Error('Journal entry has already been reversed'))
      }

      const reversalNo = `REV-${original.entryNo}`

      // Create reversing entry with swapped debits & credits
      const reversingLines = original.lines.map((line, idx) => ({
        ...line,
        id: `rel-${Date.now()}-${idx}`,
        debitPaisa: line.creditPaisa,
        creditPaisa: line.debitPaisa,
        description: `Reversal of line: ${line.description || original.entryNo}`
      }))

      const reversingEntry: JournalEntry = {
        id: `je-${Date.now()}-rev`,
        entryNo: reversalNo,
        date: new Date().toISOString().split('T')[0],
        narration: `REVERSAL of ${original.entryNo}: ${reason || original.narration}`,
        status: 'posted',
        reversesEntryNo: original.entryNo,
        lines: reversingLines,
        totalDebitPaisa: original.totalCreditPaisa,
        totalCreditPaisa: original.totalDebitPaisa,
        createdAt: new Date().toISOString(),
        createdBy: 'Cashier'
      }

      // Mark original entry as reversed
      journalEntriesState[index] = {
        ...original,
        status: 'reversed',
        reversedByEntryNo: reversalNo
      }

      // Apply reversal effects to account balances
      reversingLines.forEach((line) => {
        const accIndex = accountsState.findIndex((a) => a.id === line.accountId)
        if (accIndex !== -1) {
          const acc = accountsState[accIndex]
          const isDebitNormal = acc.category === 'asset' || acc.category === 'expense'
          const delta = isDebitNormal
            ? line.debitPaisa - line.creditPaisa
            : line.creditPaisa - line.debitPaisa

          accountsState[accIndex] = {
            ...acc,
            balancePaisa: acc.balancePaisa + delta
          }
        }
      })

      journalEntriesState = [reversingEntry, ...journalEntriesState]
      setTimeout(() => resolve(reversingEntry), 50)
    })
  },

  async getTrialBalance(): Promise<{
    accounts: Account[]
    totalDebitsPaisa: number
    totalCreditsPaisa: number
    isBalanced: boolean
  }> {
    return new Promise((resolve) => {
      let totalDebits = 0
      let totalCredits = 0

      accountsState.forEach((acc) => {
        if (acc.category === 'asset' || acc.category === 'expense') {
          totalDebits += acc.balancePaisa
        } else {
          totalCredits += acc.balancePaisa
        }
      })

      setTimeout(
        () =>
          resolve({
            accounts: [...accountsState],
            totalDebitsPaisa: totalDebits,
            totalCreditsPaisa: totalCredits,
            isBalanced: totalDebits === totalCredits
          }),
        50
      )
    })
  }
}
