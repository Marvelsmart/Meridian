import { AlertTriangle, Inbox, RefreshCw, WifiOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { Spinner } from './Skeleton'

/** Shared empty / error / loading blocks so every feature behaves the same. */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = null,
  action = null,
  actionLabel = null,
  onAction = null,
  className = '',
  compact = false,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-10' : 'px-6 py-14', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-[13px] leading-5 text-ink-500">{description}</p> : null}
      {action ?? (actionLabel && onAction ? (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null)}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this right now. Please try again.',
  error = null,
  onRetry = null,
  className = '',
  compact = false,
}) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  const Icon = offline ? WifiOff : AlertTriangle
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-10' : 'px-6 py-14', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-md text-[13px] leading-5 text-ink-500">{error?.message ?? description}</p>
      {onRetry ? (
        <Button className="mt-5" variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingState({ label = 'Loading', className = '', compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', compact ? 'py-10' : 'py-16', className)}>
      <Spinner size="lg" />
      <p className="text-[13px] font-medium text-ink-500">{label}…</p>
    </div>
  )
}
