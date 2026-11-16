import { OrganizationSettings, User } from '@shared/types'
import { mockSettings, mockCurrentUser } from '../mock/profitDistribution'

let settingsState: OrganizationSettings = { ...mockSettings }
let currentUserState: User = { ...mockCurrentUser }

export const settingsService = {
  async getSettings(): Promise<OrganizationSettings> {
    return new Promise((resolve) => setTimeout(() => resolve({ ...settingsState }), 50))
  },

  async updateSettings(updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    settingsState = { ...settingsState, ...updates }
    return new Promise((resolve) => setTimeout(() => resolve({ ...settingsState }), 50))
  },

  async getCurrentUser(): Promise<User> {
    return new Promise((resolve) => setTimeout(() => resolve({ ...currentUserState }), 50))
  }
}
