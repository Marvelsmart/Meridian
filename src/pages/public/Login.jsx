import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Checkbox, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function Login() {
  useDocumentTitle('Sign in')
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
      await signIn(values)
      toast.success('Signed in successfully', 'Welcome back to Northstar.')
      navigate(location.state?.from ?? '/app/dashboard', { replace: true })
    } catch (error) {
      setErrors(error.fields ?? {})
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Use your Northstar credentials to access your accounts, cards and transactions."
      points={[
        'Balances and transactions in real time',
        'Freeze and unfreeze cards instantly',
        'Download statements whenever you need them',
      ]}
      footer={
        <p>
          New to Northstar?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Open an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <Alert tone="danger" icon={AlertCircle} title="We could not sign you in">
            {formError}
          </Alert>
        ) : null}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox checked={remember} onChange={setRemember} label="Keep me signed in" />
          <Link to="/forgot-password" className="text-[13px] font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>

      </form>
    </AuthLayout>
  )
}
