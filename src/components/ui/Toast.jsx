import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const TONES = {
  success: {
    icon: CheckCircle2,
    className: 'border-success-100 bg-white',
    iconClass: 'text-success-600 bg-success-50',
  },
  error: {
    icon: XCircle,
    className: 'border-danger-100 bg-white',
    iconClass: 'text-danger-600 bg-danger-50',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning-100 bg-white',
    iconClass: 'text-warning-600 bg-warning-50',
  },
  info: {
    icon: Info,
    className: 'border-ink-200 bg-white',
    iconClass: 'text-brand-600 bg-brand-50',
  },
}

/** Presentational toast card. State lives in ToastContext. */
export function ToastItem({ toast, onDismiss }) {
  const tone = TONES[toast.tone] ?? TONES.info
  const Icon = tone.icon
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-card border p-3.5 shadow-pop animate-rise',
        tone.className,
      )}
    >
      <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', tone.iconClass)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-[13px] leading-5 text-ink-600">{toast.description}</p> : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick?.()
              onDismiss(toast.id)
            }}
            className="mt-2 text-[13px] font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

/** Fixed stack. On mobile it sits above the bottom navigation. */
export function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-24 z-[80] flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] lg:bottom-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
