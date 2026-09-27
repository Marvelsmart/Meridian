import { useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check, ChevronDown, Clock3, Copy, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ACCOUNT_TYPES } from '@/lib/constants'
import { formatCurrency, maskAccountNumber } from '@/lib/format'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { IconButton } from '@/components/ui'

/**
 * The account "hero" on the dashboard: identity, balance and 30-day flow.
 * Deliberately the only dark surface in the product.
 */
export function BalanceCard({
  account,
  accounts = [],
  onSelectAccount,
  hidden = false,
  onToggleHidden,
  summary = null,
  pendingCount = 0,
  loading = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef(null)
  useOnClickOutside(switcherRef, () => setSwitcherOpen(false), switcherOpen)

  const copyAccountNumber = async () => {
    if (!account) return
    try {
      await navigator.clipboard?.writeText(account.number)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  if (loading || !account) {
    return (
      <div className={cn('rounded-card bg-ink-900 p-6 shadow-pop', className)}>
        <div className="h-3.5 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-9 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-3 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-12 w-full animate-pulse rounded bg-white/10" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-card bg-ink-900 p-5 text-white shadow-pop sm:p-6', className)}>
      <div
        className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-brand-600/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0" ref={switcherRef}>
          <button
            type="button"
            onClick={() => setSwitcherOpen((open) => !open)}
            disabled={accounts.length < 2}
            className="group inline-flex items-center gap-2 rounded-lg py-1 pr-2 text-left transition hover:bg-white/5 disabled:cursor-default"
            aria-haspopup="listbox"
            aria-expanded={switcherOpen}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold">
              {account.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold">{account.name}</span>
              <span className="block text-[11.5px] text-white/60">
                {ACCOUNT_TYPES[account.type] ?? account.type} · {account.currency}
              </span>
            </span>
            {accounts.length > 1 ? (
              <ChevronDown className={cn('size-4 text-white/60 transition', switcherOpen && 'rotate-180')} />
            ) : null}
          </button>

          {switcherOpen && accounts.length > 1 ? (
            <ul
              role="listbox"
              className="absolute left-0 top-full z-20 mt-2 w-64 animate-pop overflow-hidden rounded-card border border-ink-200 bg-white p-1.5 text-ink-900 shadow-pop"
            >
              {accounts.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.id === account.id}
                    onClick={() => {
                      onSelectAccount?.(item.id)
                      setSwitcherOpen(false)
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-ink-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{item.name}</span>
                      <span className="block text-[11.5px] text-ink-500">
                        {maskAccountNumber(item.number)} · {formatCurrency(item.balance)}
                      </span>
                    </span>
                    {item.id === account.id ? <Check className="size-4 text-brand-600" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            label={hidden ? 'Show balances' : 'Hide balances'}
            icon={hidden ? EyeOff : Eye}
            size="sm"
            onClick={onToggleHidden}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          />
          <IconButton
            label="Copy account number"
            icon={copied ? Check : Copy}
            size="sm"
            onClick={copyAccountNumber}
            className={cn('hover:bg-white/10', copied ? 'text-success-500' : 'text-white/70 hover:text-white')}
          />
        </div>
      </div>

      <div className="relative mt-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/50">Available balance</p>
        <p className="amount mt-1.5 text-[30px] font-semibold leading-none sm:text-[34px]">
          {hidden ? '$ ••••••••' : formatCurrency(account.available)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
          <span>
            Account{' '}
            <span className="amount font-medium text-white/90">
              {hidden ? maskAccountNumber(account.number) : account.number}
            </span>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>
            Ledger{' '}
            <span className="amount font-medium text-white/90">
              {hidden ? '$••••' : formatCurrency(account.ledgerBalance)}
            </span>
          </span>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-success-500/15 text-success-500">
            <ArrowDownLeft className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11.5px] text-white/55">Money in · 30d</p>
            <p className="amount text-[13.5px] font-semibold">
              {hidden ? '$••••' : formatCurrency(summary?.credits ?? 0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11.5px] text-white/55">Money out · 30d</p>
            <p className="amount text-[13.5px] font-semibold">
              {hidden ? '$••••' : formatCurrency(summary?.debits ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {pendingCount > 0 ? (
        <div className="relative mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12.5px] text-white/75">
          <Clock3 className="size-3.5 text-warning-500" aria-hidden="true" />
          {pendingCount} transaction{pendingCount > 1 ? 's' : ''} pending review
        </div>
      ) : null}

    </div>
  )
}
