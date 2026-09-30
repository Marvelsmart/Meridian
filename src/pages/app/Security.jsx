import { ShieldCheck } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { SECURITY_TIPS } from '@/data/security'
import { Button, SectionCard, Switch } from '@/components/ui'

export default function Security() {
  useDocumentTitle('Security')
  const { user, actions } = useAppData()
  const settings = user?.security ?? { twoFactorEnabled: true, loginAlerts: true, cardAlerts: false }
  const contactCustomerCare = () => window.dispatchEvent(new Event('northstar:open-support-chat'))

  const handleToggle = async (key, value) => {
    await actions.saveSecurity({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-ink-900 sm:text-[24px]">Security</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">Security alerts and recent account activity.</p>
      </div>

      <SectionCard title="Security alerts" description="Choose which account activity should notify you">
        <div className="space-y-4">
          <Switch label="Two-factor authentication" description="Additional sign-in verification" checked={Boolean(settings.twoFactorEnabled)} onChange={(value) => handleToggle('twoFactorEnabled', value)} />
          <Switch label="Login alerts" description="Alerts when a new sign-in is detected" checked={Boolean(settings.loginAlerts)} onChange={(value) => handleToggle('loginAlerts', value)} />
          <Switch label="Card activity alerts" description="Notify me about card activity" checked={Boolean(settings.cardAlerts)} onChange={(value) => handleToggle('cardAlerts', value)} />
        </div>
      </SectionCard>

      <SectionCard title="Account changes" description="Sensitive changes are handled by customer care">
        <p className="mb-3 text-[13px] leading-5 text-ink-600">Contact customer care for password assistance, transaction PIN changes, or device access concerns. Never share your current PIN in chat.</p>
        <Button variant="secondary" onClick={contactCustomerCare}>Contact Customer Care</Button>
      </SectionCard>

      <SectionCard title="Security tips" description="Keep your account protected">
        <div className="grid gap-3 lg:grid-cols-3">
          {SECURITY_TIPS.map((tip) => (
            <div key={tip.id} className="rounded-card border border-ink-200 bg-ink-50/60 p-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><ShieldCheck className="size-4 text-brand-600" aria-hidden="true" /> {tip.title}</p>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-600">{tip.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
