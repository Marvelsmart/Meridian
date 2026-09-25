import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import {
  balanceToInputText,
  DEMO_BALANCE_PRESETS,
  MAX_INITIAL_BALANCE,
  MIN_INITIAL_BALANCE,
  parseBalanceInput,
} from '@/config/demo'
import { FieldShell } from '@/components/ui'

/**
 * Opening balance selector for the signup form.
 *
 * Reports only the numeric amount through `onChange` so the selected value can
 * flow straight into the signup payload and, later, a real API call. The amount
 * is explicitly a demo figure — it never represents a real deposit.
 */
export function InitialBalancePicker({
  value = null,
  onChange,
  presets = DEMO_BALANCE_PRESETS,
  error = null,
  disabled = false,
  label = 'Initial demo balance',
  hint = 'This amount is for demonstration purposes only — no real money is deposited.',
  className = '',
}) {
  const matchesPreset = value !== null && presets.includes(Number(value))
  const [custom, setCustom] = useState(() => !matchesPreset)
  const [text, setText] = useState(() => (matchesPreset || value === null ? '' : balanceToInputText(value)))

  const selectPreset = (amount) => {
    setCustom(false)
    setText('')
    onChange?.(amount)
  }

  const selectCustom = () => {
    setCustom(true)
    const parsed = parseBalanceInput(text)
    onChange?.(parsed)
  }

  const changeText = (raw) => {
    const next = raw.replace(/[^0-9.]/g, '')
    setText(next)
    onChange?.(parseBalanceInput(next))
  }

  return (
    <FieldShell
      id="initial-balance"
      label={label}
      required
      error={error}
      hint={hint}
      className={className}
      action={
        value !== null && !error ? (
          <span className="amount text-[12.5px] font-semibold text-brand-700">{formatCurrency(value)}</span>
        ) : null
      }
    >
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {presets.map((amount) => {
          const active = !custom && Number(value) === amount
          return (
            <button
              key={amount}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => selectPreset(amount)}
              className={cn(
                'amount rounded-full border px-3.5 py-2 text-[13px] font-semibold transition disabled:opacity-50',
                active
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              {formatCurrency(amount)}
            </button>
          )
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          disabled={disabled}
          onClick={selectCustom}
          className={cn(
            'rounded-full border px-3.5 py-2 text-[13px] font-semibold transition disabled:opacity-50',
            custom
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50',
          )}
        >
          Custom amount
        </button>
      </div>

      {custom ? (
        <div
          className={cn(
            'mt-1 flex items-center gap-2 rounded-field border bg-white px-3.5 transition-colors focus-within:border-brand-500',
            error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300',
          )}
        >
          <span className="text-[15px] font-semibold text-ink-400">$</span>
          <input
            id="initial-balance"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            value={text}
            onChange={(event) => changeText(event.target.value)}
            placeholder="0.00"
            aria-label="Custom initial demo balance"
            aria-invalid={Boolean(error)}
            className="amount h-11 min-w-0 flex-1 border-0 bg-transparent text-[15px] font-semibold text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-300"
          />
          <span className="shrink-0 text-[12px] text-ink-400">
            min {formatCurrency(MIN_INITIAL_BALANCE, { showSymbol: false })} · max{' '}
            {formatCurrency(MAX_INITIAL_BALANCE, { showSymbol: false })}
          </span>
        </div>
      ) : null}
    </FieldShell>
  )
}
