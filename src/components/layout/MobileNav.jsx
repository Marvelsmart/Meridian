import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { MOBILE_NAV } from '@/config/navigation'

/**
 * Mobile bottom tab bar. The centre action is a raised primary button so the
 * most common job (moving money) is always one thumb-tap away.
 */
export function MobileNav({ onMore, className = '' }) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur safe-bottom lg:hidden',
        className,
      )}
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const isMore = item.action === 'more'

          if (isMore) {
            return (
              <li key={item.label} className="flex min-w-0">
                <button
                  type="button"
                  onClick={onMore}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 text-ink-500 transition active:bg-ink-50"
                >
                  <Icon className="size-[21px] shrink-0" aria-hidden="true" />
                  <span className="max-w-full truncate text-[11px] font-medium leading-4">{item.label}</span>
                </button>
              </li>
            )
          }

          return (
            <li key={item.to} className="flex min-w-0">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 transition active:bg-ink-50',
                    isActive ? 'text-brand-700' : 'text-ink-500',
                  )
                }
              >
                {({ isActive }) =>
                  item.primary ? (
                    <>
                      <span
                        className={cn(
                          'flex size-10 shrink-0 -mt-3 items-center justify-center rounded-full shadow-pop transition',
                          isActive ? 'bg-brand-700' : 'bg-brand-600',
                        )}
                      >
                        <Icon className="size-5 text-white" aria-hidden="true" />
                      </span>
                      <span className="max-w-full truncate text-[11px] font-semibold leading-4 text-ink-700">{item.label}</span>
                    </>
                  ) : (
                    <>
                      <Icon className={cn('size-[21px] shrink-0', isActive && 'stroke-[2.4]')} aria-hidden="true" />
                      <span
                        className={cn(
                          'max-w-full truncate text-[11px] leading-4',
                          isActive ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )
                }
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
