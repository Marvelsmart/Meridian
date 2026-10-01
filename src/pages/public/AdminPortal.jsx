import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { AppDataProvider } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'
import Admin from '@/pages/app/Admin'
import { Logo } from '@/components/layout/Logo'

export default function AdminPortal() {
  useDocumentTitle('Admin sign in')
  const { user, isCheckingSession, signIn, signOut } = useAuth()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isCheckingSession) {
    return <div className="flex min-h-screen items-center justify-center text-[13px] text-ink-500">Checking administrator session…</div>
  }

  if (user?.role === 'admin') {
    return (
      <AppDataProvider>
        <div className="min-h-screen bg-ink-50">
          <header className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-4 sm:px-6">
            <Logo />
            <div className="flex items-center gap-3">
              <span className="hidden text-[12px] text-ink-500 sm:inline">Administrator · {user.email}</span>
              <Button variant="secondary" size="sm" onClick={signOut}>Sign out</Button>
            </div>
          </header>
          <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">
            <Admin />
          </main>
        </div>
      </AppDataProvider>
    )
  }

  const update = (field) => (event) => {
    setCredentials((current) => ({ ...current, [field]: event.target.value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const session = await signIn(credentials)
      if (session.user?.role !== 'admin') {
        await signOut()
        setError('This account is not configured for administrator access.')
      }
    } catch (err) {
      setError(err.message || 'Administrator sign in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Administrator sign in"
      subtitle="Use the separate administrator credentials configured for this deployment."
      points={['Customer accounts remain separate', 'Administrative actions are recorded', 'Credential resets are emailed to the account holder']}
      footer={<p>Customer account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Go to customer sign in</Link></p>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <Alert tone="danger" icon={AlertCircle} title="Could not sign in">{error}</Alert> : null}
        <Input label="Administrator email" type="email" autoComplete="username" value={credentials.email} onChange={update('email')} required />
        <Input label="Administrator password" type="password" autoComplete="current-password" value={credentials.password} onChange={update('password')} required />
        <Button type="submit" size="lg" fullWidth loading={submitting} icon={ShieldCheck}>Sign in to administration</Button>
        <Link to="/" className="block text-center text-[12.5px] font-medium text-ink-500 hover:text-ink-900">Return to Nortwest</Link>
      </form>
    </AuthLayout>
  )
}
