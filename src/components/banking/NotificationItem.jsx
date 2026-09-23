import { Bell, CreditCard, PiggyBank, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRelativeTime } from '@/lib/format'
import { Link } from 'react-router-dom'

const CATEGORY_ICONS = {
  transaction: Wallet,
  security: ShieldCheck,
  account: PiggyBank,
  promo: Sparkles,
}

const CATEGORY_TONES = {
  transaction: 'bg-brand-50 text-brand-700',
  security: 'bg-danger-50 text-danger-600',
  account: 'bg-success-50 text-success-700',
  promo: 'bg-warning-50 text-warning-600',
}

/** Notification row with read/unread state; used in the bell panel and centre. */
export function NotificationItem({ notification, onRead, onDelete = null, compact = false, className = '' }) {
  const Icon = CATEGORY_ICONS[notification.category] ?? Bell
  const tone = CATEGORY_TONES[notification.category] ?? CATEGORY_TONES.transaction

  return (
    <article
      className={cn(
        'flex items-start gap-3 px-2 py-3.5 transition-colors',
        !notification.read && 'bg-brand-50/40',
        className,
      )}
    >
      <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn('text-[13.5px] text-ink-900', notification.read ? 'font-medium' : 'font-semibold')}>
            {notification.title}
          </h3>
          <time className="shrink-0 text-[11.5px] text-ink-400" dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
        <p className={cn('mt-0.5 text-[12.5px] leading-5 text-ink-600', compact && 'line-clamp-2')}>{notification.body}</p>

        <div className="mt-2 flex items-center gap-3">
          {notification.actionLabel && notification.actionPath ? (
            <Link
              to={notification.actionPath}
              onClick={() => onRead?.(notification.id)}
              className="text-[12.5px] font-semibold text-brand-700 hover:underline"
            >
              {notification.actionLabel}
            </Link>
          ) : null}
          {!notification.read ? (
            <button
              type="button"
              onClick={() => onRead?.(notification.id)}
              className="text-[12.5px] font-medium text-ink-500 transition hover:text-ink-800"
            >
              Mark as read
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              className="text-[12.5px] font-medium text-ink-400 transition hover:text-danger-600"
            >
              Delete
            </button>
          ) : null}
          {notification.important ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-[11px] font-semibold text-danger-600">
              <CreditCard className="size-3" aria-hidden="true" />
              Important
            </span>
          ) : null}
        </div>
      </div>

      {!notification.read ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />
      ) : null}
    </article>
  )
}
