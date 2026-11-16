import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Input, Button, Card, useToast } from '../components'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../components'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
})

type LoginForm = z.infer<typeof loginSchema>

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: undefined })
  }

  const togglePassword = () => setShowPassword((p) => !p)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<LoginForm> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginForm
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    const success = await login(form.username, form.password)
    setLoading(false)
    if (success) {
      toast.success(t('login.success'))
      navigate('/')
    } else {
      toast.error(t('login.invalidCredentials'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)]">
      <Card className="w-full max-w-sm p-6 border border-gray-300 rounded-md">
        <h2 className="mb-4 text-center text-xl font-semibold" data-testid="login-title">
          {t('login.title')}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label={t('login.username')} error={errors.username} required>
            <Input
              placeholder={t('login.usernamePlaceholder')}
              value={form.username}
              onChange={handleChange('username')}
            />
          </FormField>

          <FormField label={t('login.password')} error={errors.password} required>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                value={form.password}
                onChange={handleChange('password')}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-2 flex items-center focus:outline-none"
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              disabled={loading}
              className="w-full max-w-xs"
            >
              {t('login.submit')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}