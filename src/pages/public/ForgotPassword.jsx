import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import * as api from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ForgotPassword() {
  useDocumentTitle('Reset your password')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const response = await api.requestPasswordReset(email)
      setResult(response)
    } catch (err) {
      setError(err.fields?.email ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email on your Northstar account and we will send a 6-digit reset code."
      backTo="/login"
      backLabel="Back to sign in"
      footer={
        <p>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Return to sign in
          </Link>
        </p>
      }
    >
      {result ? (
        <div className="space-y-4">
          <Alert tone="success" icon={CheckCircle2} title="Reset code sent">
            We sent a reset code to {result.email}. It expires in {result.expiresInMinutes} minutes.
          </Alert>

          <div className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-3.5">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-800">
              <Mail className="size-3.5 text-brand-600" aria-hidden="true" />
              Demo environment
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-500">
              There is no email service in this build. Use this code on the next screen:
              <span className="ml-1 font-mono text-[13px] font-semibold text-ink-900">{result.demoCode}</span>
            </p>
          </div>

          <Button
            size="lg"
            fullWidth
            iconRight={ArrowRight}
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(result.email)}&code=${result.demoCode}`)}
          >
            Continue to reset password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={Mail}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            error={error}
            required
          />
          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Send reset code
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
