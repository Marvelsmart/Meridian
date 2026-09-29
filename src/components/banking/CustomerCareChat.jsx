import { useEffect, useState } from 'react'
import { LifeBuoy, MessageCircle, X } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { ZANGI_SUPPORT_NUMBER } from '@/config/support'

export function CustomerCareChat() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const openChat = () => setOpen(true)
    window.addEventListener('northstar:open-support-chat', openChat)
    return () => window.removeEventListener('northstar:open-support-chat', openChat)
  }, [])

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="flex h-[min(460px,70dvh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-pop" aria-label="Customer care chat">
          <header className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700"><LifeBuoy className="size-4" aria-hidden="true" /></span>
              <div><p className="text-[13px] font-semibold text-ink-900">Customer care</p><p className="text-[11px] text-ink-500">In-app support</p></div>
            </div>
            <IconButton label="Close chat" icon={X} size="sm" onClick={() => setOpen(false)} />
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/70 p-4">
            <div className="max-w-[90%] rounded-card border border-ink-200 bg-white p-3 text-[12.5px] leading-5 text-ink-700">
              Hi, how can we help? Please do not send your password, PIN, or full account credentials in chat.
            </div>
            <p className="text-center text-[11px] text-ink-400">
              {ZANGI_SUPPORT_NUMBER ? 'Zangi number saved. Messaging service integration is still required.' : 'Live messaging will be enabled when the Zangi number and messaging service are configured.'}
            </p>
          </div>
          <div className="border-t border-ink-100 px-4 py-3 text-[12px] text-ink-500">Messaging is not connected yet.</div>
        </section>
      ) : null}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close customer care chat' : 'Open customer care chat'} title="Customer care" className="flex size-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-pop transition hover:bg-brand-800">
        {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
      </button>
    </div>
  )
}