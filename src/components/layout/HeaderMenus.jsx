import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, ChevronDown, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { Avatar } from '@/components/ui'
import { NotificationItem } from '@/components/banking/NotificationItem'

export function NotificationsMenu({ notifications = [], unreadCount = 0, onRead, onReadAll }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false), open)
  const preview = notifications.slice(0, 4)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative rounded-field p-2.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
      >
        <Bell className="size-[18px]" />
        {unreadCount ? (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(340px,calc(100vw-2rem))] animate-pop overflow-hidden rounded-card border border-ink-200 bg-white shadow-pop sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-[13.5px] font-semibold text-ink-900">Notifications</p>
            {unreadCount ? (
              <button
                type="button"
                onClick={() => onReadAll?.()}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 divide-y divide-ink-100 overflow-y-auto">
            {preview.length ? (
              preview.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onRead={onRead} compact />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-[13px] text-ink-500">You are all caught up.</p>
            )}
          </div>
          <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">
            <Link
              to="/app/notifications"
              onClick={() => setOpen(false)}
              className="text-[12.5px] font-semibold text-brand-700 hover:underline"
            >
              View notification centre
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AccountMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false), open)
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-field p-1 pr-2 transition hover:bg-ink-100"
      >
        <Avatar name={name} size="sm" tone="brand" />
        <span className="hidden text-left lg:block">
          <span className="block text-[12.5px] font-semibold leading-4 text-ink-900">{name || 'Account'}</span>
          <span className="block text-[11px] text-ink-500">{user?.tier ?? 'Tier 3'}</span>
        </span>
        <ChevronDown className={cn('size-4 text-ink-400 transition', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 animate-pop overflow-hidden rounded-card border border-ink-200 bg-white p-1.5 shadow-pop">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <p className="truncate text-[13px] font-semibold text-ink-900">{name}</p>
            <p className="truncate text-[11.5px] text-ink-500">{user?.email}</p>
          </div>
          <Link
            to="/app/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink-700 transition hover:bg-ink-50"
          >
            <UserRound className="size-4 text-ink-400" />
            Profile & settings
          </Link>
          <Link
            to="/app/security"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink-700 transition hover:bg-ink-50"
          >
            <ShieldCheck className="size-4 text-ink-400" />
            Security centre
          </Link>
          <div className="mt-1 border-t border-ink-100 pt-1">
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-danger-600 transition hover:bg-danger-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
