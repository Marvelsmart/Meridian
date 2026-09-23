import { forwardRef, useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

const FIELD_BASE =
  'w-full rounded-field border bg-white text-sm text-ink-900 placeholder:text-ink-400 transition-colors ' +
  'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500'

export function FieldShell({ id, label, hint, error, required, children, className, action }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-[13px] font-medium text-ink-700">
            {label}
            {required ? <span className="ml-0.5 text-danger-500">*</span> : null}
          </label>
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-danger-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    required = false,
    leftIcon: LeftIcon = null,
    rightSlot = null,
    action = null,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required} action={action}>
      <div className="relative">
        {LeftIcon ? (
          <LeftIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            FIELD_BASE,
            'h-11 px-3.5',
            LeftIcon && 'pl-10',
            (rightSlot || isPassword) && 'pr-11',
            error ? 'border-danger-500 focus:border-danger-500' : 'border-ink-200 hover:border-ink-300 focus:border-brand-500',
            className,
          )}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : rightSlot ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        ) : null}
      </div>
    </FieldShell>
  )
})

export const Select = forwardRef(function Select(
  { label, hint, error, required = false, options = [], placeholder = 'Select an option', children, className = '', id, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <FieldShell id={selectId} label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          'h-11 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236d7a8c\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")] bg-[length:20px] bg-[position:right_10px_center] bg-no-repeat px-3.5 pr-10',
          error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300 focus:border-brand-500',
          className,
        )}
        {...props}
      >
        {options.length ? (
          <>
            {placeholder ? (
              <option value="">{placeholder}</option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </>
        ) : (
          children
        )}
      </select>
    </FieldShell>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required = false, className = '', id, rows = 3, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  return (
    <FieldShell id={textareaId} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          'resize-none px-3.5 py-3 leading-6',
          error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300 focus:border-brand-500',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})
