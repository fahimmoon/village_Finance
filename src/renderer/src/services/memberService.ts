import { Member } from '@shared/types'
import { mockMembers } from '../mock/members'

let membersState: Member[] = [...mockMembers]

export const memberService = {
  async getAll(): Promise<Member[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...membersState]), 50)
    })
  },

  async getById(id: string): Promise<Member | null> {
    return new Promise((resolve) => {
      const member = membersState.find((m) => m.id === id) || null
      setTimeout(() => resolve(member), 50)
    })
  },

  async create(newMember: Omit<Member, 'id'>): Promise<Member> {
    return new Promise((resolve) => {
      const created: Member = {
        ...newMember,
        id: `m-${Date.now()}`
      }
      membersState = [created, ...membersState]
      setTimeout(() => resolve(created), 50)
    })
  },

  async update(id: string, updates: Partial<Member>): Promise<Member> {
    return new Promise((resolve, reject) => {
      const index = membersState.findIndex((m) => m.id === id)
      if (index === -1) {
        return reject(new Error('Member not found'))
      }
      const updated = { ...membersState[index], ...updates }
      membersState[index] = updated
      setTimeout(() => resolve(updated), 50)
    })
  },

  async search(query: string): Promise<Member[]> {
    return new Promise((resolve) => {
      const q = query.toLowerCase().trim()
      if (!q) return resolve([...membersState])
      const filtered = membersState.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberNo.toLowerCase().includes(q) ||
          m.idCardNo.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q)
      )
      setTimeout(() => resolve(filtered), 50)
    })
  }
}
