import { Check, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, CopyButton, DescriptionList, DetailRow } from '@/components/ui'

/** Shared "we are processing your request" panel for all money flows. */
export function ProcessingPanel({ title = 'Processing your transfer', steps = [], activeIndex = 0, message = null }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50">
        <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-ink-500">
        {message ?? 'Please keep this screen open — this usually takes a few seconds.'}
      </p>

      {steps.length ? (
        <ol className="mt-7 w-full max-w-sm space-y-3 text-left">
          {steps.map((step, index) => {
            const done = index < activeIndex
            const current = index === activeIndex
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                    done && 'border-success-500 bg-success-500 text-white',
                    current && 'border-brand-600 text-brand-700',
                    !done && !current && 'border-ink-200 text-ink-400',
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                <span className={cn('text-[13px]', current ? 'font-semibold text-ink-900' : 'text-ink-500')}>
                  {step}
                </span>
                {current ? <Loader2 className="size-3.5 animate-spin text-ink-400" /> : null}
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}

/** Shared receipt screen: success icon, key details, follow-up actions. */
export function SuccessPanel({
  title = 'Transfer completed successfully',
  message,
  rows = [],
  primaryAction = null,
  secondaryAction = null,
  onPrimary = null,
  onSecondary = null,
  token = null,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col items-center py-4 text-center', className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-success-50">
        <Check className="size-7 text-success-600" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-ink-900">{title}</h2>
      {message ? <p className="mt-1.5 max-w-md text-[13px] leading-5 text-ink-500">{message}</p> : null}

      {token ? (
        <div className="mt-5 w-full max-w-sm rounded-card border border-dashed border-ink-300 bg-ink-50 px-4 py-3">
          <p className="text-[11.5px] uppercase tracking-[0.08em] text-ink-500">Electricity token</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <p className="font-mono text-[15px] font-semibold tracking-[0.08em] text-ink-900">{token}</p>
            <CopyButton value={token} iconOnly label="Copy token" />
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <DescriptionList className="mt-6 w-full max-w-sm rounded-card border border-ink-200 px-4 text-left">
          {rows.map((row) => (
            <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
          ))}
        </DescriptionList>
      ) : null}

      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
          {secondaryAction ? (
            <Button variant="secondary" onClick={onSecondary} fullWidth>
              {secondaryAction}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button onClick={onPrimary} fullWidth>
              {primaryAction}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** Failure variant of the receipt screen. */
export function FailurePanel({ title = 'We could not complete this', message, onRetry = null, onClose = null }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-50">
        <XCircle className="size-7 text-danger-600" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mt-1.5 max-w-md text-[13px] leading-5 text-ink-500">{message}</p>
      <div className="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
        {onClose ? (
          <Button variant="secondary" onClick={onClose} fullWidth>
            Close
          </Button>
        ) : null}
        {onRetry ? (
          <Button onClick={onRetry} fullWidth>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  )
}
