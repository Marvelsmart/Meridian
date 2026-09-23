import { ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { groupByDay } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
import { SkeletonRows } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { TransactionItem } from './TransactionItem'

/**
 * Renders a transaction list with grouping, plus the loading / empty / error
 * states every data view in the app is expected to handle.
 */
export function TransactionList({
  transactions = [],
  loading = false,
  error = null,
  onRetry = null,
  grouped = true,
  showBalance = false,
  variant = 'default',
  emptyTitle = 'No transactions yet',
  emptyDescription = 'Once money moves in or out of this account, it will show up here.',
  emptyAction = null,
  emptyActionLabel = null,
  onEmptyAction = null,
  skeletonRows = 5,
  className = '',
  footer = null,
}) {
  if (loading) {
    return (
      <div className={cn('px-2', className)}>
        <SkeletonRows rows={skeletonRows} />
      </div>
    )
  }

  if (error) {
    return <ErrorState compact onRetry={onRetry} error={error} title="We could not load transactions" />
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyAction ??
          (emptyActionLabel && onEmptyAction ? (
            <button
              type="button"
              onClick={onEmptyAction}
              className="mt-5 rounded-field bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {emptyActionLabel}
            </button>
          ) : null)
        }
        compact
      />
    )
  }

  if (!grouped) {
    return (
      <div className={cn('divide-y divide-ink-100', className)}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            variant={variant}
            showBalance={showBalance}
          />
        ))}
        {footer}
      </div>
    )
  }

  const groups = groupByDay(transactions)

  return (
    <div className={cn('space-y-1', className)}>
      {groups.map((group) => (
        <section key={group.key}>
          <header className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-500">{group.label}</h3>
            <span className={cn('amount text-[11.5px] font-medium', group.total < 0 ? 'text-ink-500' : 'text-success-600')}>
              {group.total < 0 ? '−' : '+'}
              {formatCurrency(Math.abs(group.total))}
            </span>
          </header>
          <div className="divide-y divide-ink-100">
            {group.items.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                variant="grouped"
                showBalance={showBalance}
              />
            ))}
          </div>
        </section>
      ))}
      {footer}
    </div>
  )
}
