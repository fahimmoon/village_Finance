import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { settingsService } from '../../services/settingsService'
import { OrganizationSettings, User } from '@shared/types'
import { ConfirmDialog } from '../ConfirmDialog'
import { useToast } from '../Toast'

export const TopBar: React.FC = () => {
  // Translation & toast
  const { t, i18n } = useTranslation()
  const { info } = useToast()
  const { logout } = useAuth()

  // State
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Load org settings & current user once
  useEffect(() => {
    settingsService.getSettings().then(setSettings)
    settingsService.getCurrentUser().then(setCurrentUser)
  }, [])

  // Language handling
  const currentLang = i18n.language
  const toggleLanguage = (): void => {
    const next = currentLang === 'ur' ? 'en' : 'ur'
    i18n.changeLanguage(next)
  }

  // Logout flow
  const handleLogout = async (): Promise<void> => {
    await logout() // clears user and navigates to /login via AuthContext
    setShowLogoutConfirm(false)
    info(currentLang === 'ur' ? 'آپ کامیابی کے ساتھ لاگ آؤٹ ہو چکے ہیں' : 'Session logged out.')
  }

  // Organisation display name (localized)
  const orgDisplayName =
    currentLang === 'ur' && settings?.orgNameUrdu
      ? settings.orgNameUrdu
      : settings?.orgName || 'Village Savings & Credit Cooperative'

  return (
    <>
      <header className="h-[48px] bg-white border-b border-[#D9DDE3] px-4 flex items-center justify-between shrink-0 select-none text-[13px]">
        {/* Left side – organisation and fiscal year */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-[#1F2937] text-[14px] truncate">
            {orgDisplayName}
          </span>
          <span className="text-[#6B7280] text-[12px] shrink-0 border-l border-[#D9DDE3] pl-3">
            FY {settings?.currentFiscalYear || '2026-2027'}
          </span>
        </div>

        {/* Right side – language toggle, user info, logout */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-[28px] px-2.5 rounded-[4px] border border-[#D9DDE3] bg-white hover:bg-[#F3F4F6] text-[#1F2937] text-[12px] font-medium transition-colors cursor-pointer"
            title="Switch Language"
          >
            {currentLang === 'ur' ? 'English' : 'اردو'}
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 border-l border-[#D9DDE3] pl-3">
            <span className="text-[#1F2937] font-medium text-[13px]">
              {currentUser?.fullName || 'Cashier User'}
            </span>
            <span className="text-[#6B7280] text-[12px]">({currentUser?.role || 'Cashier'})</span>
            {/* Logout button */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="h-[28px] px-2 text-[#B91C1C] hover:bg-[#FEF2F2] rounded-[4px] transition-colors ml-1 cursor-pointer flex items-center gap-1 text-[12px]"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={14} strokeWidth={1.75} />
              <span>{t('topbar.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title={t('topbar.logout')}
        message="Are you sure you want to end your current session?"
        confirmText={t('topbar.logout')}
        variant="danger"
      />
    </>
  )
}
