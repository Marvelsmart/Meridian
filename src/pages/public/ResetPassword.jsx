import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import * as api from '@/lib/api'
import { BRAND } from '@/lib/constants'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ResetPassword() {
  useDocumentTitle('Choose a new password')
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const [values, setValues] = useState({
    code: params.get('code') ?? '',
    email: params.get('email') ?? '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      await api.resetPassword(values)
      setDone(true)
      toast.success('Password updated', 'Sign in with your new password.')
    } catch (error) {
      setErrors(error.fields ?? {})
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="Your new password is ready to use." backTo="/login" backLabel="Back to sign in">
        <div className="space-y-5">
          <Alert tone="success" icon={CheckCircle2} title="All set">
            Your Northstar password was changed successfully. For your security, all other devices were left signed out.
          </Alert>
          <Button size="lg" fullWidth onClick={() => navigate('/login', { replace: true })}>
            Sign in
          </Button>
          <p className="text-[12.5px] text-ink-500">
            Need help instead? Contact support on {BRAND.supportEmail}.{' '}
            <Link to="/forgot-password" className="font-medium text-brand-700 hover:underline">
              Request another code
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={
        params.get('email')
          ? `Resetting the password for ${params.get('email')}.`
          : 'Enter the 6-digit code we sent to your email, then choose a new password.'
      }
      backTo="/forgot-password"
      backLabel="Back"
      footer={
        <p>
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Return to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <Alert tone="danger" icon={ShieldCheck} title="We could not update your password">
            {formError}
          </Alert>
        ) : null}

        <Input
          label="Reset code"
          inputMode="numeric"
          placeholder="6-digit code"
          leftIcon={ShieldCheck}
          value={values.code}
          onChange={update('code')}
          error={errors.code}
          hint="Codes expire 15 minutes after they are sent."
          required
        />
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  )
}
