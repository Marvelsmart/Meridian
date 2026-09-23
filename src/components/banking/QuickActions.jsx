import { cn } from '@/lib/cn'
import { QUICK_ACTIONS } from '@/config/navigation'
import { Link } from 'react-router-dom'

/** The 8 primary jobs on the dashboard — a grid, not a carousel. */
export function QuickActions({ onAction = null, className = '' }) {
  return (
    <div className={cn('grid grid-cols-4 gap-2 sm:grid-cols-4 lg:grid-cols-8 lg:gap-3', className)}>
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        const content = (
          <>
            <span className="flex size-11 items-center justify-center rounded-xl bg-white text-ink-800 ring-1 ring-inset ring-ink-200 transition-colors group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="mt-2 block text-[12px] font-medium leading-4 text-ink-700 group-hover:text-ink-900">
              {action.label}
            </span>
          </>
        )

        const classes =
          'group flex flex-col items-center rounded-card border border-ink-200 bg-ink-50/40 px-2 py-3 text-center transition hover:border-ink-300 hover:bg-white hover:shadow-card'

        if (action.action) {
          return (
            <button key={action.label} type="button" onClick={() => onAction?.(action.action)} className={classes}>
              {content}
            </button>
          )
        }

        return (
          <Link key={action.label} to={action.to} className={classes} title={action.description}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}
