import { NavLink } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NAV_GROUPS } from '@/config/navigation'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui'
import { SupportCard } from '@/components/banking'
import { Logo } from './Logo'

/** Desktop sidebar: brand, grouped navigation, support + account footer. */
export function Sidebar({ className = '' }) {
  const { user, unreadCount } = useAppData()
  const { signOut } = useAuth()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-ink-200 bg-white lg:flex',
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-ink-100 px-5">
        <Logo />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const badge = item.to === '/app/notifications' && unreadCount ? unreadCount : null
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                          isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn('size-[18px] shrink-0', isActive ? 'text-brand-700' : 'text-ink-400 group-hover:text-ink-600')}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge ? (
                            <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                              {badge}
                            </span>
                          ) : null}
                          {isActive ? <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" /> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-ink-100 p-3">
        <SupportCard variant="compact" title="Need help?" description="Chat with Support on WhatsApp." />

        <div className="mt-3 flex items-center gap-3 rounded-card p-2">
          <Avatar name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size="sm" tone="brand" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="flex items-center gap-1 truncate text-[11.5px] text-ink-500">
              <ShieldCheck className="size-3 text-success-600" aria-hidden="true" />
              {user?.tier ?? 'Tier 3'} verified
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-100 hover:text-danger-600"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
