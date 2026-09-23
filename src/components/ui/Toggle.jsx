import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Checkbox({ checked, onChange, label, description, error, disabled = false, className = '' }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-[6px] border transition-colors',
            checked ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600',
            error && 'border-danger-500',
          )}
        >
          {checked ? <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden="true" /> : null}
        </span>
      </span>
      {label || description ? (
        <span className="min-w-0">
          {label ? <span className="block text-sm font-medium text-ink-800">{label}</span> : null}
          {description ? <span className="mt-0.5 block text-[12.5px] leading-5 text-ink-500">{description}</span> : null}
        </span>
      ) : null}
    </label>
  )
}

export function Switch({ checked, onChange, label, description, disabled = false, id, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {label || description ? (
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-800">{label}</p>
          {description ? <p className="mt-0.5 text-[12.5px] leading-5 text-ink-500">{description}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-ink-300',
        )}
      >
        <span
          className={cn(
            'inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
          )}
        />
      </button>
    </div>
  )
}
