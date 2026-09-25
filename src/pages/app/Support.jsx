import { CreditCard, FileText, LifeBuoy, MessageCircle, ShieldCheck, Wallet } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { isWhatsAppSupportConfigured } from '@/config/support'
import { SectionCard } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { SupportCard } from '@/components/banking'

const HELP_TOPICS = [
  { icon: Wallet, title: 'Payments & transfers', body: 'A transfer is missing, pending or needs to be reversed.' },
  { icon: CreditCard, title: 'Cards', body: 'Freeze a card, request a replacement or review card activity.' },
  { icon: FileText, title: 'Statements & receipts', body: 'Download a statement or find the receipt for a transaction.' },
  { icon: ShieldCheck, title: 'Account security', body: 'Suspicious sign-in, password reset or device access.' },
]

/** Support entry point. Live chat is the front-end only — no chat backend yet. */
export default function Support() {
  useDocumentTitle('Support')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Support"
        description="We're here to help. Start a chat, call us, or email the team and we will pick it up."
        actions={<SupportCard variant="compact" />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <SupportCard
          title="Need help?"
          description="Chat with our support team on WhatsApp. We usually reply within a few minutes during business hours."
        />

        <SectionCard title="Other ways we can help" description="Pick the topic that matches your question">
          <ul className="grid gap-3 sm:grid-cols-2">
            {HELP_TOPICS.map((topic) => {
              const Icon = topic.icon
              return (
                <li key={topic.title} className="rounded-card border border-ink-200 bg-ink-50/60 p-3.5">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                    <Icon className="size-4 text-brand-600" aria-hidden="true" />
                    {topic.title}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-ink-600">{topic.body}</p>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="About live chat in this demo" description="What is and is not connected yet">
        <ul className="space-y-2 text-[13px] leading-6 text-ink-600">
          <li className="flex gap-2">
            <MessageCircle className="mt-1 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
            <span>
              “Chat with Support” opens WhatsApp with your message pre-filled
              {isWhatsAppSupportConfigured()
                ? '.'
                : ' as soon as the support number is configured — it is intentionally left unset in this build.'}
            </span>
          </li>
          <li className="flex gap-2">
            <LifeBuoy className="mt-1 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
            <span>There is no real-time chat agent, ticket queue or chat history in this demo — no chat backend is connected.</span>
          </li>
        </ul>
      </SectionCard>
    </div>
  )
}
