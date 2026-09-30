import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import * as api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ResetTransactionPin() {
  useDocumentTitle('Reset transaction PIN')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const [values, setValues] = useState({
    email: params.get('email') ?? '',
    code: params.get('code') ?? '',
    pin: '',
    confirmPin: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const update = (field, digits = false) => (event) => {
    const value = digits ? event.target.value.replace(/\D/g, '').slice(0, field === 'code' ? 6 : 4) : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (values.pin.length !== 4 || values.pin !== values.confirmPin) {
      setError('Enter matching 4-digit PINs.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.resetTransactionPin(values)
      setDone(true)
      toast.success('Transaction PIN updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Transaction PIN updated" subtitle="Your transaction PIN was securely reset.">
        <Alert tone="success" icon={CheckCircle2} title="Reset complete">You can now authorize transfers with your new PIN.</Alert>
        <Button className="mt-4" size="lg" fullWidth onClick={() => navigate(isAuthenticated ? '/app/transfer' : '/login', { replace: true })}>
          {isAuthenticated ? 'Return to transfer' : 'Sign in'}
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset transaction PIN" subtitle="Use the one-time code sent by customer care to set a new PIN.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <Alert tone="danger" icon={ShieldCheck} title="PIN not updated">{error}</Alert> : null}
        <Input label="Account email" type="email" autoComplete="email" value={values.email} onChange={update('email')} required />
        <Input label="Email reset code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={values.code} onChange={update('code', true)} leftIcon={KeyRound} required />
        <Input label="New transaction PIN" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={values.pin} onChange={update('pin', true)} required />
        <Input label="Confirm new PIN" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={values.confirmPin} onChange={update('confirmPin', true)} required />
        <Button type="submit" size="lg" fullWidth loading={submitting} disabled={!values.email || values.code.length !== 6 || values.pin.length !== 4 || values.confirmPin.length !== 4}>Reset PIN</Button>
      </form>
    </AuthLayout>
  )
}
