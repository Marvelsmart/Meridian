import { ArrowUpRight, CircleDollarSign, Landmark, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, SectionCard } from '@/components/ui'

export default function Investments() {
  useDocumentTitle('Investments')
  const { user } = useAuth()
  const openSupport = () => window.dispatchEvent(new Event('northstar:open-support-chat'))

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-semibold text-ink-900 sm:text-[24px]">Investments</h1>
          <p className="mt-1 text-[13.5px] leading-6 text-ink-500">A dedicated view for investment account access and holdings.</p>
        </div>
        <Button icon={ArrowUpRight} onClick={openSupport}>Ask Customer Care</Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Investment account summary">
        <div className="border-y border-ink-200 py-4 sm:border-y-0 sm:border-r sm:pr-4">
          <p className="text-[12px] font-medium text-ink-500">Investment balance</p>
          <p className="mt-2 text-[22px] font-semibold text-ink-900">Not available</p>
        </div>
        <div className="border-y border-ink-200 py-4 sm:border-y-0 sm:border-r sm:px-4">
          <p className="text-[12px] font-medium text-ink-500">Investment accounts</p>
          <p className="mt-2 text-[22px] font-semibold text-ink-900">0</p>
        </div>
        <div className="py-4 sm:pl-4">
          <p className="text-[12px] font-medium text-ink-500">Account holder</p>
          <p className="mt-2 truncate text-[16px] font-semibold text-ink-900">{user?.firstName} {user?.lastName}</p>
        </div>
      </section>

      <SectionCard title="Your investments" description="Investment holdings will appear here when an investment account is available">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-l-2 border-brand-600 pl-4">
            <CircleDollarSign className="size-5 text-brand-700" aria-hidden="true" />
            <h2 className="mt-3 text-[14px] font-semibold text-ink-900">Portfolio</h2>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-500">Holdings, contributions, and valuations will be shown in this section.</p>
          </div>
          <div className="border-l-2 border-success-600 pl-4">
            <Landmark className="size-5 text-success-700" aria-hidden="true" />
            <h2 className="mt-3 text-[14px] font-semibold text-ink-900">Investment accounts</h2>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-500">No investment accounts are linked to your profile yet.</p>
          </div>
          <div className="border-l-2 border-warning-500 pl-4">
            <ShieldCheck className="size-5 text-warning-700" aria-hidden="true" />
            <h2 className="mt-3 text-[14px] font-semibold text-ink-900">Account support</h2>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-500">Customer care can explain available investment services and eligibility.</p>
          </div>
        </div>
        <div className="mt-5 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={openSupport}>Contact Customer Care</Button>
        </div>
      </SectionCard>
    </div>
  )
}
