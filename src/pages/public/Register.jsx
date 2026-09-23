import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Checkbox, Input, Progress } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { cn } from '@/lib/cn'

function scorePassword(password) {
  let score = 0
  if (!password) return { score: 0, label: 'Enter a password', tone: 'ink' }
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { score: 25, label: 'Weak — add numbers and capitals', tone: 'danger' }
  if (score === 2) return { score: 50, label: 'Fair — add a symbol to strengthen', tone: 'warning' }
  if (score === 3) return { score: 75, label: 'Good password', tone: 'brand' }
  return { score: 100, label: 'Strong password', tone: 'success' }
}

export default function Register() {
  useDocumentTitle('Open an account')
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => scorePassword(values.password), [values.password])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!accepted) {
      setFormError('Please accept the terms and privacy policy to continue.')
      return
    }
    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      await signUp(values)
      toast.success('Account created', 'Your Northstar account is ready to use.')
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      setErrors(error.fields ?? {})
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Open your Northstar account"
      subtitle="It takes about two minutes. Your Everyday account comes with a $25,000 daily transfer limit."
      points={[
        'Checking, savings and travel accounts in one login',
        'Virtual cards created instantly',
        'No monthly maintenance fee in the first year',
      ]}
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <Alert tone="danger" icon={AlertCircle} title="We could not create your account">
            {formError}
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            placeholder="Ava"
            autoComplete="given-name"
            value={values.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
            required
          />
          <Input
            label="Last name"
            placeholder="Johnson"
            autoComplete="family-name"
            value={values.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
          hint="We use this for statements and security alerts."
          required
        />

        <Input
          label="Phone number"
          type="tel"
          placeholder="(415) 555-0147"
          autoComplete="tel"
          value={values.phone}
          onChange={update('phone')}
          error={errors.phone}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={values.password}
            onChange={update('password')}
            error={errors.password}
            required
          />
          <div className="mt-2.5">
            <Progress value={strength.score} tone={strength.tone} size="sm" />
            <p
              className={cn(
                'mt-1.5 text-[12px]',
                strength.tone === 'danger' && 'text-danger-600',
                strength.tone === 'warning' && 'text-warning-600',
                strength.tone === 'brand' && 'text-ink-500',
                strength.tone === 'success' && 'text-success-600',
                strength.tone === 'ink' && 'text-ink-400',
              )}
            >
              {strength.label}
            </p>
          </div>
        </div>

        <Checkbox
          checked={accepted}
          onChange={(checked) => {
            setAccepted(checked)
            setFormError(null)
          }}
          label="I agree to the terms of service and privacy policy"
          description="Northstar may verify my identity using the details provided."
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
