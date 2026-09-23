import { useEffect, useState } from 'react'
import { ShieldCheck, Smartphone, KeyRound } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { ACTIVE_SESSIONS, LOGIN_ACTIVITY, SECURITY_TIPS, TWO_FACTOR_METHODS } from '@/data/security'
import { Button, Card, Input, SectionCard, Switch } from '@/components/ui'

export default function Security() {
  useDocumentTitle('Security')
  const { user, sessions, actions } = useAppData()
  const toast = useToast()
  const [settings, setSettings] = useState({
    twoFactorEnabled: true,
    biometricEnabled: true,
    emailAlerts: true,
    loginAlerts: true,
    cardAlerts: false,
    marketing: false,
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.security) return
    setSettings(user.security)
  }, [user])

  const handleToggle = async (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    try {
      await actions.saveSecurity(next)
    } catch (error) {
      toast.error('Security settings not saved', error.message)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await actions.changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated', 'Your Northstar password was updated successfully.')
    } catch (error) {
      toast.error('Password update failed', error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Security</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Keep your account protected with strong controls and a quick review of active sessions.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Security controls" description="Use the strongest protections available">
          <div className="space-y-4">
            <Switch
              label="Two-factor authentication"
              description="Authentication app or SMS verification"
              checked={Boolean(settings.twoFactorEnabled)}
              onChange={(value) => handleToggle('twoFactorEnabled', value)}
            />
            <Switch
              label="Biometric sign-in"
              description="Face ID or fingerprint on trusted devices"
              checked={Boolean(settings.biometricEnabled)}
              onChange={(value) => handleToggle('biometricEnabled', value)}
            />
            <Switch
              label="Login alerts"
              description="Email alerts when someone signs in"
              checked={Boolean(settings.loginAlerts)}
              onChange={(value) => handleToggle('loginAlerts', value)}
            />
            <Switch
              label="Card activity alerts"
              description="Notify me of new card activity"
              checked={Boolean(settings.cardAlerts)}
              onChange={(value) => handleToggle('cardAlerts', value)}
            />
            <Switch
              label="Marketing opt-in"
              description="Product updates and seasonal offers"
              checked={Boolean(settings.marketing)}
              onChange={(value) => handleToggle('marketing', value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Change password" description="Use a unique password that you do not reuse elsewhere">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <Input
              label="Current password"
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
            />
            <Input
              label="New password"
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
            <Button type="submit" fullWidth loading={saving}>Update password</Button>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Active sessions" description="Devices currently signed into your account">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-900">{session.device}</p>
                  <p className="text-[12px] text-ink-500">{session.platform} · {session.location}</p>
                </div>
                {session.current ? <span className="rounded-full bg-success-50 px-2 py-1 text-[11px] font-semibold text-success-700">Current</span> : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Login activity" description="Recent sign-in events and blocked attempts">
          <div className="space-y-3">
            {LOGIN_ACTIVITY.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-card border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium text-ink-900">{item.device}</p>
                  <span className="rounded-full bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-700">{item.status}</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-500">{item.location} · {item.browser}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Security tips" description="Keep your account safe and protected">
        <div className="grid gap-3 lg:grid-cols-3">
          {SECURITY_TIPS.map((tip) => (
            <div key={tip.id} className="rounded-card border border-ink-200 bg-ink-50/60 p-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><ShieldCheck className="size-4 text-brand-600" /> {tip.title}</p>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-600">{tip.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
