import { cn } from '@/lib/cn'
import { STATUS_META } from '@/lib/constants'

/** Status pill used everywhere a transaction state is shown. */
export function TransactionStatus({ status, size = 'md', withDot = true, className = '' }) {
  const meta = STATUS_META[status] ?? STATUS_META.successful
  return (
    <span
      title={`Status: ${meta.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        meta.className,
        size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[11.5px]',
        className,
      )}
    >
      {withDot ? <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden="true" /> : null}
      {meta.label}
    </span>
  )
}
