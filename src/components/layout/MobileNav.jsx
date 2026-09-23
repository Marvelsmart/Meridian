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
              <li key={item.label} className="flex">
                <button
                  type="button"
                  onClick={onMore}
                  className="flex flex-1 flex-col items-center gap-1 py-2.5 text-ink-500 transition active:bg-ink-50"
                >
                  <Icon className="size-[21px]" aria-hidden="true" />
                  <span className="text-[10.5px] font-medium">{item.label}</span>
                </button>
              </li>
            )
          }

          return (
            <li key={item.to} className="flex">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 flex-col items-center gap-1 py-2.5 transition active:bg-ink-50',
                    isActive ? 'text-brand-700' : 'text-ink-500',
                  )
                }
              >
                {({ isActive }) =>
                  item.primary ? (
                    <>
                      <span
                        className={cn(
                          'flex size-10 -mt-3 items-center justify-center rounded-full shadow-pop transition',
                          isActive ? 'bg-brand-700' : 'bg-brand-600',
                        )}
                      >
                        <Icon className="size-5 text-white" aria-hidden="true" />
                      </span>
                      <span className="text-[10.5px] font-semibold text-ink-700">{item.label}</span>
                    </>
                  ) : (
                    <>
                      <Icon className={cn('size-[21px]', isActive && 'stroke-[2.4]')} aria-hidden="true" />
                      <span className={cn('text-[10.5px]', isActive ? 'font-semibold' : 'font-medium')}>
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
