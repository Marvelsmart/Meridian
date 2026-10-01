import { LifeBuoy, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui'

/**
 * Customer support entry point shown in the sidebar, the mobile "More" drawer,
 * the marketing footer and the support page.
 *
 * The support button opens the shared in-app customer-care panel.
 */
export function SupportCard({
  variant = 'default',
  title = 'Customer Support',
  description = "We're here to help.",
  className = '',
}) {
  const compact = variant === 'compact'

  const openChat = () => {
    window.dispatchEvent(new Event('northstar:open-support-chat'))
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
        aria-label="Open customer care chat"
      >
        Chat with customer care
      </Button>

      <p className="mt-2 text-[11.5px] leading-5 text-ink-400">
        Customer care is available through in-app chat.
      </p>
    </div>
  )
}
