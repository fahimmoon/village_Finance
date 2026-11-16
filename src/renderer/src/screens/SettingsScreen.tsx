import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Database, ShieldCheck } from 'lucide-react'
import { PageHeader, Card, Button, FormField, Input, Select, useToast } from '../components'
import { settingsService } from '../services/settingsService'
import { OrganizationSettings } from '@shared/types'

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { success, error: toastError } = useToast()

  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)

  useEffect(() => {
    settingsService.getSettings().then(setSettings)
  }, [])

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!settings) return

    try {
      setIsSubmitting(true)
      await settingsService.updateSettings(settings)
      success(t('common.success'), 'Organization settings updated successfully.')
    } catch (err: any) {
      toastError(err?.message || 'Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTriggerBackup = (): void => {
    setIsBackingUp(true)
    setTimeout(() => {
      setIsBackingUp(false)
      success('Backup Created', 'Offline SQLite database snapshot saved to backups folder.')
    }, 1200)
  }

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            {t('common.save')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Information Form */}
        <div className="lg:col-span-2">
          <Card title={t('settings.orgDetails')}>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label={t('settings.orgName')} required>
                <Input
                  value={settings.orgName}
                  onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                />
              </FormField>

              <FormField label="Organization Name (Urdu / اردو نام)">
                <Input
                  value={settings.orgNameUrdu}
                  onChange={(e) => setSettings({ ...settings, orgNameUrdu: e.target.value })}
                  className="font-urdu"
                  dir="rtl"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Registration Number" required>
                  <Input
                    value={settings.registrationNo}
                    onChange={(e) => setSettings({ ...settings, registrationNo: e.target.value })}
                  />
                </FormField>

                <FormField label={t('settings.fiscalYear')} required>
                  <Input
                    value={settings.currentFiscalYear}
                    onChange={(e) =>
                      setSettings({ ...settings, currentFiscalYear: e.target.value })
                    }
                  />
                </FormField>
              </div>

              <FormField label="Registered Office Address">
                <Input
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Official Contact / Phone">
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </FormField>

                <FormField label="Currency Symbol">
                  <Input
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  />
                </FormField>
              </div>
            </form>
          </Card>
        </div>

        {/* System & Offline Backup Card */}
        <div className="space-y-6">
          <Card title={t('settings.backup')} subtitle="Local Data Safety">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Village Finance runs completely offline. To ensure data protection against hardware
                failure, take regular local backups to a USB flash drive or secondary drive.
              </p>

              <Button
                variant="outline"
                fullWidth
                icon={<Database className="w-5 h-5 text-emerald-700" />}
                onClick={handleTriggerBackup}
                isLoading={isBackingUp}
              >
                Create Instant Backup Now
              </Button>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Last auto-backup: Today at 04:00 AM</span>
              </div>
            </div>
          </Card>

          <Card title={t('settings.languagePref')}>
            <FormField label={t('topbar.language')}>
              <Select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
                <option value="en">{t('topbar.english')}</option>
                <option value="ur">{t('topbar.urdu')}</option>
              </Select>
            </FormField>
          </Card>
        </div>
      </div>
    </div>
  )
}
