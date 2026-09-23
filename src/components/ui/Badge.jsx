import { cn } from '@/lib/cn'
import { avatarTone } from '@/data/banks'
import { initialsOf } from '@/lib/format'

const TONES = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-success-50 text-success-700 ring-success-100',
  warning: 'bg-warning-50 text-warning-600 ring-warning-100',
  danger: 'bg-danger-50 text-danger-700 ring-danger-100',
}

const SIZES = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-lg',
}

export function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot ? <span className={cn('size-1.5 rounded-full', dotColor(tone))} /> : null}
      {children}
    </span>
  )
}

function dotColor(tone) {
  if (tone === 'success') return 'bg-success-500'
  if (tone === 'warning') return 'bg-warning-500'
  if (tone === 'danger') return 'bg-danger-500'
  if (tone === 'brand') return 'bg-brand-500'
  return 'bg-ink-400'
}

/** Initials avatar; automatically picks a stable tone from the name. */
export function Avatar({ name, size = 'md', tone = null, className = '', square = false }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold ring-1 ring-inset',
        square ? 'rounded-xl' : 'rounded-full',
        SIZES[size] ?? SIZES.md,
        tone ? TONES[tone] ?? TONES.neutral : avatarTone(name),
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  )
}
