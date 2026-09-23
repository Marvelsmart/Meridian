import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CATEGORY_META, TRANSACTION_CHANNELS } from '@/lib/constants'
import { formatCurrency, formatTime } from '@/lib/format'
import { CategoryIcon } from './CategoryIcon'
import { TransactionStatus } from './TransactionStatus'

/**
 * A single transaction row. Used by the dashboard, transaction history,
 * card activity, statements and search results so the layout never drifts.
 */
export function TransactionItem({ transaction, variant = 'default', showBalance = false, className = '' }) {
  const isCredit = transaction.type === 'credit'
  const counterparty = transaction.counterparty?.name
  const channel = TRANSACTION_CHANNELS[transaction.channel]
  const categoryLabel = CATEGORY_META[transaction.category]?.label

  const subtitle =
    variant === 'grouped'
      ? [formatTime(transaction.date), counterparty ?? categoryLabel].filter(Boolean).join(' · ')
      : [counterparty ?? categoryLabel, channel].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/app/transactions/${transaction.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-ink-50',
        variant === 'compact' && 'py-2.5',
        className,
      )}
    >
      <span className="relative">
        <CategoryIcon category={transaction.category} size={variant === 'compact' ? 'sm' : 'md'} />
        <span
          className={cn(
            'absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ring-2 ring-white',
            isCredit ? 'bg-success-500' : 'bg-ink-700',
          )}
          aria-hidden="true"
        >
          {isCredit ? (
            <ArrowDownLeft className="size-2.5 text-white" strokeWidth={3} />
          ) : (
            <ArrowUpRight className="size-2.5 text-white" strokeWidth={3} />
          )}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-ink-900">{transaction.description}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{subtitle}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className={cn('amount text-[13.5px] font-semibold', isCredit ? 'text-success-600' : 'text-ink-900')}>
          {isCredit ? '+' : '−'}
          {formatCurrency(transaction.amount, { showSymbol: true })}
        </p>
        {transaction.status !== 'successful' ? (
          <TransactionStatus status={transaction.status} size="xs" />
        ) : showBalance ? (
          <span className="amount text-[12px] text-ink-400">{formatCurrency(transaction.balanceAfter ?? 0)}</span>
        ) : (
          <span className="text-[12px] text-ink-400">{formatTime(transaction.date)}</span>
        )}
      </div>

      {variant === 'detail' ? <ChevronRight className="size-4 shrink-0 text-ink-300" /> : null}
    </Link>
  )
}
