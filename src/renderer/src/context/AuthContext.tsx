import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserRole = 'Admin' | 'Accountant' | 'Cashier' | 'Committee'

export interface User {
  username: string
  role: UserRole
}

interface AuthContextProps {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

const mockUsers: Record<string, { password: string; role: UserRole }> = {
  admin: { password: 'admin', role: 'Admin' },
  accountant: { password: 'accountant', role: 'Accountant' },
  cashier: { password: 'cashier', role: 'Cashier' },
  committee: { password: 'committee', role: 'Committee' }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const login = async (username: string, password: string): Promise<boolean> => {
    const record = mockUsers[username]
    if (record && record.password === password) {
      setUser({ username, role: record.role })
      navigate('/')
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    navigate('/login')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
