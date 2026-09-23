import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCurrency, maskAccountNumber } from '@/lib/format'

/** Account chooser used by transfer, bills, airtime, withdraw and statements. */
export function AccountSelect({ accounts = [], value, onChange, label = 'Pay from', hidden = false, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-[13px] font-medium text-ink-700">{label}</span>
      <div className="flex flex-col gap-2">
        {accounts.map((account) => {
          const active = account.id === value
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onChange?.(account.id)}
              aria-pressed={active}
              className={cn(
                'flex items-center justify-between gap-3 rounded-card border p-3.5 text-left transition',
                active ? 'border-brand-600 bg-brand-50/50' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-medium text-ink-900">{account.name}</span>
                <span className="amount block text-[12px] text-ink-500">
                  {maskAccountNumber(account.number)} · {hidden ? '$••••' : formatCurrency(account.available)} available
                </span>
              </span>
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  active ? 'border-brand-600 bg-brand-600' : 'border-ink-300',
                )}
              >
                {active ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
