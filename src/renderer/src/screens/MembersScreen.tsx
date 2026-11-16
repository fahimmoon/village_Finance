import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { UserPlus, Eye } from 'lucide-react'
import {
  PageHeader,
  DataTable,
  Column,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  DatePicker,
  useToast
} from '../components'
import { memberService } from '../services/memberService'
import { Member, MemberStatus } from '@shared/types'
import { formatDate } from '../utils/formatters'

// Zod Schema for Member Registration
const memberSchema = z.object({
  memberNo: z.string().min(2, 'Member number must be at least 2 characters'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  fatherName: z.string().min(3, 'Father / Husband name is required'),
  idCardNo: z.string().min(13, 'CNIC / ID Card number must be valid').max(15, 'CNIC too long'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Village address is required'),
  nomineeName: z.string().min(3, 'Nominee name is required'),
  nomineeRelation: z.string().min(2, 'Relationship is required'),
  joinedOn: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive', 'exited'])
})

type MemberFormData = z.infer<typeof memberSchema>

export const MembersScreen: React.FC = () => {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Form State
  const initialFormData: MemberFormData = {
    memberNo: '',
    fullName: '',
    fatherName: '',
    idCardNo: '',
    phone: '',
    address: '',
    nomineeName: '',
    nomineeRelation: '',
    joinedOn: new Date().toISOString().split('T')[0],
    status: 'active'
  }
  const [formData, setFormData] = useState<MemberFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadMembers = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const data = await memberService.getAll()
      setMembers(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const handleOpenAddModal = (): void => {
    const nextNo = `M-${String(members.length + 1).padStart(3, '0')}`
    setFormData({
      ...initialFormData,
      memberNo: nextNo
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleSaveMember = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setFormErrors({})

    const validation = memberSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof MemberFormData, string>> = {}
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof MemberFormData
        fieldErrors[fieldName] = issue.message
      })
      setFormErrors(fieldErrors)
      return
    }

    try {
      setIsSubmitting(true)
      await memberService.create(validation.data)
      success(t('common.success'), 'Member registered successfully')
      setIsModalOpen(false)
      loadMembers()
    } catch (err: any) {
      toastError(err?.message || 'Failed to register member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Member>[] = [
    {
      key: 'memberNo',
      header: t('members.memberNo'),
      sortable: true,
      render: (m) => <span className="font-mono font-bold text-emerald-800">{m.memberNo}</span>
    },
    {
      key: 'fullName',
      header: t('members.fullName'),
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-bold text-slate-900 block">{m.fullName}</span>
          <span className="text-xs text-slate-500 font-medium">{m.phone}</span>
        </div>
      )
    },
    {
      key: 'fatherName',
      header: t('members.fatherName'),
      sortable: true
    },
    {
      key: 'idCardNo',
      header: t('members.idCardNo'),
      sortable: true,
      render: (m) => <span className="font-mono text-sm">{m.idCardNo}</span>
    },
    {
      key: 'address',
      header: t('members.address'),
      className: 'max-w-xs truncate'
    },
    {
      key: 'joinedOn',
      header: t('members.joinedOn'),
      sortable: true,
      render: (m) => formatDate(m.joinedOn)
    },
    {
      key: 'status',
      header: t('members.status'),
      sortable: true,
      render: (m) => (
        <Badge variant={m.status} size="sm" dot>
          {t(`common.${m.status}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (m) => (
        <Button
          variant="secondary"
          size="sm"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedMember(m)
          }}
        >
          {t('common.view')}
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('members.title')}
        subtitle={t('members.subtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<UserPlus className="w-5 h-5" />}
            onClick={handleOpenAddModal}
          >
            {t('members.addMember')}
          </Button>
        }
      />

      {/* Main Members Data Table */}
      <DataTable
        data={members}
        columns={columns}
        keyExtractor={(m) => m.id}
        searchableFields={['memberNo', 'fullName', 'fatherName', 'idCardNo', 'phone', 'address']}
        defaultSortKey="memberNo"
        defaultSortOrder="asc"
        isLoading={isLoading}
        emptyMessage="No members registered yet"
        emptySubtext="Click 'Register Member' above to register the first village cooperative member."
        onRowClick={(m) => setSelectedMember(m)}
      />

      {/* Member Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('members.addMember')}
        maxWidth="2xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveMember} isLoading={isSubmitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('members.memberNo')} required error={formErrors.memberNo}>
              <Input
                value={formData.memberNo}
                onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
                error={!!formErrors.memberNo}
                placeholder="e.g. M-008"
              />
            </FormField>

            <FormField label={t('members.joinedOn')} required error={formErrors.joinedOn}>
              <DatePicker
                value={formData.joinedOn}
                onChange={(e) => setFormData({ ...formData, joinedOn: e.target.value })}
                error={!!formErrors.joinedOn}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('members.fullName')} required error={formErrors.fullName}>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={!!formErrors.fullName}
                placeholder="e.g. Muhammad Aslam"
              />
            </FormField>

            <FormField label={t('members.fatherName')} required error={formErrors.fatherName}>
              <Input
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                error={!!formErrors.fatherName}
                placeholder="e.g. Abdul Ghafoor"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t('members.idCardNo')}
              required
              error={formErrors.idCardNo}
              hint="Format: 35201-1234567-1"
            >
              <Input
                value={formData.idCardNo}
                onChange={(e) => setFormData({ ...formData, idCardNo: e.target.value })}
                error={!!formErrors.idCardNo}
                placeholder="35201-1234567-1"
              />
            </FormField>

            <FormField label={t('members.phone')} required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={!!formErrors.phone}
                placeholder="0300-1234567"
              />
            </FormField>
          </div>

          <FormField label={t('members.address')} required error={formErrors.address}>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={!!formErrors.address}
              placeholder="e.g. Chak 42-RB, Faisalabad"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <FormField label={t('members.nomineeName')} required error={formErrors.nomineeName}>
              <Input
                value={formData.nomineeName}
                onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                error={!!formErrors.nomineeName}
                placeholder="e.g. Tariq Aslam"
              />
            </FormField>

            <FormField
              label={t('members.nomineeRelation')}
              required
              error={formErrors.nomineeRelation}
            >
              <Input
                value={formData.nomineeRelation}
                onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                error={!!formErrors.nomineeRelation}
                placeholder="e.g. Son, Wife, Brother"
              />
            </FormField>
          </div>

          <FormField label={t('members.status')}>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
            >
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
              <option value="exited">{t('common.exited')}</option>
            </Select>
          </FormField>
        </form>
      </Modal>

      {/* Member Details View Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`${selectedMember.fullName} (${selectedMember.memberNo})`}
          maxWidth="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedMember(null)}>
              {t('common.close')}
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <p className="text-xl font-bold text-slate-900">{selectedMember.fullName}</p>
                <p className="text-sm text-slate-500">
                  {t('members.fatherName')}: {selectedMember.fatherName}
                </p>
              </div>
              <Badge variant={selectedMember.status} size="md">
                {t(`common.${selectedMember.status}`)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 font-medium block">{t('members.idCardNo')}:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedMember.idCardNo}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t('members.phone')}:</span>
                <span className="font-bold text-slate-800">{selectedMember.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-medium block">{t('members.address')}:</span>
                <span className="font-bold text-slate-800">{selectedMember.address}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">
                  {t('members.nomineeName')}:
                </span>
                <span className="font-bold text-slate-800">
                  {selectedMember.nomineeName} ({selectedMember.nomineeRelation})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t('members.joinedOn')}:</span>
                <span className="font-bold text-slate-800">
                  {formatDate(selectedMember.joinedOn)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
