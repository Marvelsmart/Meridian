import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Multi-step flow indicator used by transfer and bills. */
export function StepIndicator({ steps, current = 0, onStepClick = null, className = '' }) {
  return (
    <div className={cn('w-full', className)}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
          const clickable = Boolean(onStepClick) && index < current
          return (
            <li key={step.label ?? index} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick(index) : undefined}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors',
                  state === 'done' && 'border-brand-600 bg-brand-600 text-white',
                  state === 'current' && 'border-brand-600 bg-white text-brand-700',
                  state === 'upcoming' && 'border-ink-200 bg-white text-ink-400',
                  clickable && 'cursor-pointer hover:border-brand-700',
                )}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
              </button>
              <span
                className={cn(
                  'hidden truncate text-[12.5px] font-medium sm:block',
                  state === 'upcoming' ? 'text-ink-400' : 'text-ink-700',
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={cn('h-px flex-1 rounded-full', index < current ? 'bg-brand-500' : 'bg-ink-200')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      {steps[current] ? (
        <p className="mt-3 text-[12.5px] font-medium text-ink-500 sm:hidden">
          Step {current + 1} of {steps.length} · {steps[current].label}
        </p>
      ) : null}
    </div>
  )
}

export function Pagination({ page = 1, pageCount = 1, onChange, className = '' }) {
  if (pageCount <= 1) return null
  const pages = []
  const window = 1
  for (let index = 1; index <= pageCount; index += 1) {
    const isEdge = index === 1 || index === pageCount
    const isNear = Math.abs(index - page) <= window
    if (isEdge || isNear) pages.push(index)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <nav className={cn('flex items-center justify-between gap-3', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-field border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 transition hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>
      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((item, index) =>
          item === '…' ? (
            <span key={`gap-${index}`} className="px-1.5 text-ink-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'min-w-9 rounded-field px-2.5 py-2 text-[13px] font-medium transition',
                item === page ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <p className="text-[12.5px] font-medium text-ink-500 sm:hidden">
        Page {page} of {pageCount}
      </p>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded-field border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 transition hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  )
}
