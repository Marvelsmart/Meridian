import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { initialBalanceError, lockManagerCode } from '@/config/demo'
import { formatCurrency } from '@/lib/format'
import { DEFAULT_COUNTRY, formatUsPhone, phoneError, toE164 } from '@/lib/phone'
import { Alert, Button, Checkbox, FieldShell, Input, Progress } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { InitialBalancePicker } from '@/components/banking'
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
  const [initialBalance, setInitialBalance] = useState(null)
  const [balanceError, setBalanceError] = useState(null)
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

  /** Phone is formatted progressively as the customer types: (312) 555-0148 */
  const updatePhone = (event) => {
    setValues((current) => ({ ...current, phone: formatUsPhone(event.target.value) }))
    setErrors((current) => ({ ...current, phone: undefined }))
    setFormError(null)
  }

  const updateBalance = (amount) => {
    setInitialBalance(amount)
    setBalanceError(null)
    setFormError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const phoneMessage = phoneError(values.phone)
    const balanceMessage = initialBalanceError(initialBalance)
    if (phoneMessage || balanceMessage) {
      setErrors(phoneMessage ? { phone: phoneMessage } : {})
      setBalanceError(balanceMessage)
      setFormError('Please check the highlighted fields before continuing.')
      return
    }

    if (!accepted) {
      setFormError('Please accept the terms and privacy policy to continue.')
      return
    }

    setSubmitting(true)
    setErrors({})
    setBalanceError(null)
    setFormError(null)
    try {
      // The phone number is normalised to E.164 (a U.S. backend would store
      // exactly this) and the chosen opening balance rides along with the
      // payload so it becomes the customer's demo account balance.
      await signUp({
        ...values,
        phone: toE164(values.phone) ?? values.phone,
        initialBalance,
      })
      lockManagerCode()
      toast.success(
        'Account created',
        `Your Northstar account is ready with an opening demo balance of ${formatCurrency(initialBalance)}.`,
      )
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
      subtitle="It takes about two minutes. Choose the demo balance you want to start with — your Everyday account comes with a $25,000 daily transfer limit."
      points={[
        'Checking, savings and travel accounts in one login',
        'Virtual cards created instantly',
        'You choose the opening balance for this demo',
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

        <FieldShell
          id="phone"
          label="Phone number"
          required
          error={errors.phone}
          hint={`Country: ${DEFAULT_COUNTRY.label} (${DEFAULT_COUNTRY.dialCode}). U.S. numbers only.`}
        >
          <div
            className={cn(
              'flex items-center rounded-field border bg-white transition-colors focus-within:border-brand-500',
              errors.phone ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300',
            )}
          >
            <span className="pointer-events-none inline-flex items-center gap-1.5 border-r border-ink-200 py-2.5 pl-3.5 pr-2.5 text-sm font-medium text-ink-600">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">US</span>
              {DEFAULT_COUNTRY.dialCode}
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(312) 555-0148"
              value={values.phone}
              onChange={updatePhone}
              aria-invalid={Boolean(errors.phone)}
              className="h-11 min-w-0 flex-1 rounded-field border-0 bg-transparent px-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-400"
            />
          </div>
        </FieldShell>

        <InitialBalancePicker
          value={initialBalance}
          onChange={updateBalance}
          error={balanceError}
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
          description="Northstar may verify my identity using the details provided. Identity verification is simulated in this demo."
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
