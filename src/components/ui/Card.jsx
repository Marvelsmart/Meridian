import { cn } from '@/lib/cn'

export function Card({ as: Tag = 'div', className = '', padded = true, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-card border border-ink-200 bg-white shadow-card',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

/** Card with a consistent title / description / action header. */
export function SectionCard({
  title,
  description = null,
  action = null,
  children,
  className = '',
  bodyClassName = '',
  padded = true,
  footer = null,
}) {
  return (
    <section className={cn('overflow-hidden rounded-card border border-ink-200 bg-white shadow-card', className)}>
      {title || action ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] text-ink-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(padded && 'p-5', bodyClassName)}>{children}</div>
      {footer ? <footer className="border-t border-ink-100 bg-ink-50/60 px-5 py-3">{footer}</footer> : null}
    </section>
  )
}

const ALERT_TONES = {
  info: 'border-brand-100 bg-brand-50/70 text-brand-900',
  success: 'border-success-100 bg-success-50 text-success-700',
  warning: 'border-warning-100 bg-warning-50 text-warning-600',
  danger: 'border-danger-100 bg-danger-50 text-danger-700',
}

export function Alert({ tone = 'info', title, children, icon: Icon = null, action = null, className = '' }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-card border p-3.5', ALERT_TONES[tone] ?? ALERT_TONES.info, className)}
    >
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : null}
      <div className="min-w-0 flex-1 text-[13px] leading-5">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
