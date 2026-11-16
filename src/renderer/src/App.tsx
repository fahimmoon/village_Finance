import React from 'react'
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import {
  DashboardScreen,
  MembersScreen,
  SavingsScreen,
  LoansScreen,
  RepaymentsScreen,
  AccountingScreen,
  IncomeExpensesScreen,
  ProfitDistributionScreen,
  ReportsScreen,
  SettingsScreen,
  LoginScreen
} from './screens'

function ProtectedLayout(): React.JSX.Element {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function App(): React.JSX.Element {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/members" element={<MembersScreen />} />
                <Route path="/savings" element={<SavingsScreen />} />
                <Route path="/loans" element={<LoansScreen />} />
                <Route path="/repayments" element={<RepaymentsScreen />} />
                <Route path="/accounting" element={<AccountingScreen />} />
                <Route path="/income-expenses" element={<IncomeExpensesScreen />} />
                <Route path="/profit-distribution" element={<ProfitDistributionScreen />} />
                <Route path="/reports" element={<ReportsScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
