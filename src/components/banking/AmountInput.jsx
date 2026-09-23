import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'

/**
 * The amount entry shown in every money flow (transfer, bills, airtime, withdraw).
 * Large, numeric, with quick-amount chips and an available-balance hint.
 */
export function AmountInput({
  label = 'Amount',
  value,
  onChange,
  presets = [],
  available = null,
  error = null,
  hint = null,
  currencySymbol = '$',
  autoFocus = false,
  disabled = false,
  className = '',
  id = 'amount',
}) {
  const handleChange = (raw) => {
    const cleaned = String(raw).replace(/[^\d.]/g, '')
    const [whole, ...rest] = cleaned.split('.')
    const next = rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole
    onChange?.(next)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-700">
          {label}
        </label>
        {available !== null ? (
          <button
            type="button"
            onClick={() => onChange?.(String(available))}
            className="text-[12.5px] font-medium text-brand-700 hover:underline"
          >
            Available {formatCurrency(available)}
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'flex items-center gap-2 rounded-card border bg-white px-4 py-3 transition-colors focus-within:border-brand-500',
          error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300',
        )}
      >
        <span className="text-xl font-semibold text-ink-400">{currencySymbol}</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          value={value ?? ''}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(error)}
          className="amount w-full border-0 bg-transparent text-2xl font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:cursor-not-allowed"
        />
      </div>

      {error ? (
        <p className="text-[12.5px] font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-ink-500">{hint}</p>
      ) : null}

      {presets.length ? (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(String(preset))}
              className={cn(
                'amount rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
                Number(value) === preset
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
