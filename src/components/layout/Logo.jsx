import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { BRAND } from '@/lib/constants'

/** Meridian wordmark: a restrained geometric mark plus the name. */
export function Logo({ to = '/', inverted = false, size = 'md', showName = true, className = '' }) {
  const marks = { sm: 'size-7 text-[12px]', md: 'size-8 text-[13px]', lg: 'size-10 text-[15px]' }
  const names = { sm: 'text-[15px]', md: 'text-[16.5px]', lg: 'text-[19px]' }

  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label={`${BRAND.name} home`}>
      <span
        className={cn(
          'flex items-center justify-center rounded-[9px] font-bold tracking-tight',
          inverted ? 'bg-white text-ink-900' : 'bg-ink-900 text-white',
          marks[size] ?? marks.md,
        )}
        aria-hidden="true"
      >
        M
      </span>
      {showName ? (
        <span className={cn('flex flex-col', names[size] ?? names.md)}>
          <span className={cn('font-semibold leading-none tracking-[-0.02em]', inverted ? 'text-white' : 'text-ink-900')}>
            {BRAND.name}
          </span>
          <span className={cn('mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em]', inverted ? 'text-white/50' : 'text-ink-400')}>
            Digital banking
          </span>
        </span>
      ) : null}
    </Link>
  )
}
