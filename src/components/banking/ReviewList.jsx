import { DescriptionList, DetailRow, CopyButton } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Label/value rows shared by every review & receipt screen. */
export function ReviewList({ rows = [], className = '', title = null, footer = null, description = null }) {
  return (
    <div className={className}>
      {title ? <h3 className="text-[13px] font-semibold text-ink-900">{title}</h3> : null}
      {description ? <p className="mt-0.5 text-[12.5px] text-ink-500">{description}</p> : null}
      <DescriptionList className={cn('rounded-card border border-ink-200 bg-white px-4', (title || description) && 'mt-3')}>
        {rows
          .filter(Boolean)
          .map((row) => (
            <DetailRow
              key={row.label}
              label={row.label}
              value={
                row.copyValue ? (
                  <span className="inline-flex items-center gap-1">
                    {row.value}
                    <CopyButton value={row.copyValue} iconOnly label={`Copy ${row.label}`} />
                  </span>
                ) : (
                  row.value
                )
              }
              mono={row.mono}
            />
          ))}
      </DescriptionList>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  )
}

/** Small "reference" chip with copy support, used on receipts and details. */
export function ReferenceChip({ reference, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-[11.5px] font-medium text-ink-700',
        className,
      )}
    >
      {reference}
      <CopyButton value={reference} iconOnly label="Copy reference" />
    </span>
  )
}
