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
      subtitle="Enter the email on your Nortwest account and we will send a 6-digit reset code."
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
          <Alert tone="success" icon={CheckCircle2} title="Check your email">
            If an account exists for {result.email}, a one-time reset code has been sent. It expires in {result.expiresInMinutes} minutes.
          </Alert>
          <Button
            size="lg"
            fullWidth
            iconRight={ArrowRight}
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(result.email)}`)}
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
