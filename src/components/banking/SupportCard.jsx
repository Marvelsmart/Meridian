import { LifeBuoy, Mail, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/cn'
import { buildWhatsAppSupportLink, isWhatsAppSupportConfigured, SUPPORT_CHANNELS } from '@/config/support'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui'

/**
 * Customer support entry point shown in the sidebar, the mobile "More" drawer,
 * the marketing footer and the support page.
 *
 * The button deep-links into WhatsApp as soon as a real number is set in
 * `config/support.js`. Until then it explains that live chat is not connected
 * yet — no placeholder number is ever invented or dialled.
 */
export function SupportCard({
  variant = 'default',
  title = 'Customer Support',
  description = "We're here to help.",
  className = '',
}) {
  const toast = useToast()
  const link = buildWhatsAppSupportLink()
  const configured = isWhatsAppSupportConfigured()
  const compact = variant === 'compact'

  const openChat = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
      return
    }
    toast.info(
      'Support chat is not connected yet',
      'The WhatsApp support number has not been set for this demo. Use the phone number or email below.',
    )
  }

  return (
    <div
      className={cn(
        'rounded-card border border-ink-200 bg-white',
        compact ? 'p-3.5' : 'p-4',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
        <LifeBuoy className="size-4 text-brand-600" aria-hidden="true" />
        {title}
      </p>
      <p className={cn('text-[12.5px] text-ink-500', compact ? 'mt-1' : 'mt-1.5')}>{description}</p>

      <Button
        className={cn('mt-3', compact && 'w-full')}
        size={compact ? 'sm' : 'md'}
        icon={MessageCircle}
        onClick={openChat}
        aria-label="Chat with Support on WhatsApp"
      >
        Chat with Support
      </Button>

      <p className="mt-2 text-[11.5px] leading-5 text-ink-400">
        {configured
          ? 'Opens WhatsApp in a new tab.'
          : 'Live chat opens in WhatsApp once the support number is configured.'}
      </p>

      {compact ? null : (
        <ul className="mt-3 space-y-2 border-t border-ink-100 pt-3 text-[12.5px] text-ink-600">
          <li className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
            {SUPPORT_CHANNELS.phone}
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
            <a href={`mailto:${SUPPORT_CHANNELS.email}`} className="truncate hover:text-ink-900 hover:underline">
              {SUPPORT_CHANNELS.email}
            </a>
          </li>
          <li className="text-ink-500">{SUPPORT_CHANNELS.hours}</li>
        </ul>
      )}
    </div>
  )
}
