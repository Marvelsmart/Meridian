import { cn } from '@/lib/cn'
import { formatPercent } from '@/lib/format'
import { Skeleton } from '@/components/ui'

/**
 * Compact metric tile used for the financial overview, cards summary and
 * statements totals. Percentage deltas are optional and colour-coded.
 */
export function StatCard({
  label,
  value,
  icon: Icon = null,
  tone = 'ink',
  delta = null,
  deltaLabel = null,
  hint = null,
  loading = false,
  className = '',
  onClick = null,
}) {
  const tones = {
    ink: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-700',
  }

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={cn(
        'flex min-w-0 flex-col rounded-card border border-ink-200 bg-white p-3.5 text-left shadow-card transition sm:p-4',
        onClick && 'hover:border-ink-300 hover:shadow-pop',
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
        <p className="min-w-0 truncate text-[12px] font-medium text-ink-500 sm:text-[12.5px]">{label}</p>
        {Icon ? (
          <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-lg sm:size-7', tones[tone] ?? tones.ink)}>
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-6 w-24" />
      ) : (
        /**
         * Fluid figure: the amount stays on one line inside a two-up tile on a
         * 320px phone without ever spilling out of the card, and lands back on
         * the original 19px from ~420px upwards.
         */
        <p className="amount mt-2.5 min-w-0 text-[clamp(0.95rem,4.5vw,1.1875rem)] font-semibold leading-tight text-ink-900">
          {value}
        </p>
      )}

      {delta !== null || hint ? (
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px]">
          {delta !== null && !loading ? (
            <span
              className={cn(
                'font-semibold',
                delta > 0 ? 'text-success-600' : delta < 0 ? 'text-danger-600' : 'text-ink-500',
              )}
            >
              {formatPercent(delta)}
            </span>
          ) : null}
          {hint ? (
            <span className="min-w-0 truncate text-ink-500">{hint}</span>
          ) : deltaLabel ? (
            <span className="min-w-0 truncate text-ink-500">{deltaLabel}</span>
          ) : null}
        </div>
      ) : null}
    </Wrapper>
  )
}
