import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react'
import { unlockManagerCode } from '@/config/signup'
import * as api from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

/**
 * Bank Manager Code gateway that sits in front of the signup form.
 *
 *   /register  →  this gate  →  /register/account (the signup form)
 *
 * The code is issued to branch managers, never chosen by the customer, and the
 * API validates it again when the account is created. This screen only needs a
 * boolean back.
 */
export default function RegisterGate() {
  useDocumentTitle('Bank Manager Code')
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!String(code).trim()) {
      setError('Enter your Bank Manager Code to continue.')
      return
    }
    setSubmitting(true)
    try {
      await api.verifyManagerCode(code.trim())
      unlockManagerCode(code.trim())
      toast.success('Bank Manager Code accepted', 'Continue to create the customer account.')
      navigate('/register/account', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid Bank Manager Code. Please check the code and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome"
      subtitle="Enter your Bank Manager Code to continue."
      points={[
        'The manager code unlocks customer account creation',
        'Only authorised managers can create customer accounts',
        'The code is held temporarily in this browser tab for registration',
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
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <Alert tone="danger" icon={AlertCircle} title="Code not accepted">
            {error}
          </Alert>
        ) : null}

        <Input
          label="Bank Manager Code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            setError(null)
          }}
          placeholder="Enter the manager code"
          leftIcon={KeyRound}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          error={error && !error.startsWith('Invalid') ? error : null}
          hint="Required before a customer account can be created."
          required
        />

        <Button type="submit" size="lg" fullWidth loading={submitting} icon={ShieldCheck}>
          Continue
        </Button>

        <div className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-3.5">
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-800">
            <KeyRound className="size-3.5 text-brand-600" aria-hidden="true" />
            Where do I find the code?
          </p>
          <p className="mt-1 text-[12.5px] leading-5 text-ink-500">
            Your branch manager issues a single code that authorises customer account creation.
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
