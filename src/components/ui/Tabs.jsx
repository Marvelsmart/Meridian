import { cn } from '@/lib/cn'

const VARIANTS = {
  underline: {
    list: 'flex gap-1 overflow-x-auto border-b border-ink-200 no-scrollbar',
    item: 'relative shrink-0 px-3 py-2.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-800',
    active: 'text-ink-900',
  },
  pill: {
    // max-w-full + overflow-x-auto keeps a long tab row scrollable *inside* its
    // container instead of pushing the whole page wider than the viewport.
    list: 'inline-flex max-w-full gap-1 overflow-x-auto rounded-field bg-ink-100 p-1 no-scrollbar',
    item: 'shrink-0 rounded-[7px] px-3 py-1.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-800',
    active: 'bg-white text-ink-900 shadow-card',
  },
  segment: {
    list: 'flex w-full gap-1 rounded-field bg-ink-100 p-1',
    item: 'min-w-0 flex-1 rounded-[7px] px-3 py-2 text-[13px] font-semibold text-ink-500 transition-colors hover:text-ink-800',
    active: 'bg-white text-brand-700 shadow-card',
  },
}

export function Tabs({ items, value, onChange, variant = 'underline', className = '', ariaLabel = 'Sections' }) {
  const styles = VARIANTS[variant] ?? VARIANTS.underline
  return (
    <div className={cn(styles.list, className)} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = item.value === value
        const Icon = item.icon
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(styles.item, active && styles.active, 'inline-flex items-center justify-center gap-2')}
          >
            {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-ink-200/70 text-ink-600',
                )}
              >
                {item.count}
              </span>
            ) : null}
            {variant === 'underline' && active ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink-900" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function Progress({ value = 0, max = 100, tone = 'brand', size = 'md', label = null, className = '' }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const tones = {
    brand: 'bg-brand-600',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    ink: 'bg-ink-800',
  }
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-ink-500">
          <span>{label}</span>
          <span className="font-medium text-ink-700">{Math.round(percent)}%</span>
        </div>
      ) : null}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-ink-100', size === 'sm' ? 'h-1.5' : 'h-2')}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tones[tone] ?? tones.brand)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
