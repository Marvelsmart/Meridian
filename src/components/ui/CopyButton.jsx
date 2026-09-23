import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Copies a value (account number, reference, token) with visual feedback. */
export function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied', className = '', iconOnly = false }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = String(value ?? '')
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
      else {
        const input = document.createElement('textarea')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const Icon = copied ? Check : Copy

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? copiedLabel : label}
      aria-label={copied ? copiedLabel : label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-medium transition-colors',
        iconOnly ? 'p-1.5' : 'px-2 py-1',
        copied ? 'text-success-600' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {iconOnly ? null : copied ? copiedLabel : label}
    </button>
  )
}

export function DetailRow({ label, value, className = '', align = 'left', mono = false }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2.5', className)}>
      <dt className="shrink-0 text-[13px] text-ink-500">{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-right text-[13px] font-medium text-ink-900',
          align === 'left' && 'text-left',
          mono && 'font-mono text-[12.5px]',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function DescriptionList({ children, className = '' }) {
  return <dl className={cn('divide-y divide-ink-100', className)}>{children}</dl>
}
