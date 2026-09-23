import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const BASE =
  'inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_1px_2px_rgba(18,24,34,0.10)]',
  secondary: 'bg-white text-ink-800 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 active:bg-ink-100',
  subtle: 'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300/60',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700/90',
  'danger-ghost': 'text-danger-600 ring-1 ring-inset ring-danger-100 hover:bg-danger-50',
  success: 'bg-success-600 text-white hover:bg-success-700',
}

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-field px-4 text-sm',
  lg: 'h-12 gap-2 rounded-field px-5 text-[15px]',
}

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon = null,
    iconRight: IconRight = null,
    fullWidth = false,
    to = null,
    href = null,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const classes = cn(
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className={cn('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      ) : null}
      {children ? <span className="truncate">{children}</span> : null}
      {IconRight && !loading ? (
        <IconRight className={cn('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      ) : null}
    </>
  )

  if (to && !disabled && !loading) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href && !disabled && !loading) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
})

const ICON_SIZES = {
  sm: 'size-8 rounded-lg',
  md: 'size-10 rounded-field',
  lg: 'size-12 rounded-field',
}

const ICON_TONES = {
  neutral: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  brand: 'text-brand-700 bg-brand-50 hover:bg-brand-100',
  danger: 'text-danger-600 hover:bg-danger-50',
  outline: 'text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50',
}

export const IconButton = forwardRef(function IconButton(
  { label, icon: Icon, size = 'md', tone = 'neutral', className = '', loading = false, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50',
        ICON_SIZES[size] ?? ICON_SIZES.md,
        ICON_TONES[tone] ?? ICON_TONES.neutral,
        className,
      )}
      {...props}
    >
      <Icon className={cn('size-4', loading && 'animate-pulse')} aria-hidden="true" />
    </button>
  )
})
