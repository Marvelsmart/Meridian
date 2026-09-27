import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronRight, LogOut, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BRAND } from '@/lib/constants'
import { MOBILE_MORE_LINKS, NAV_GROUPS } from '@/config/navigation'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { Avatar, Drawer, Spinner } from '@/components/ui'
import { ErrorState } from '@/components/ui/States'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'

const ALL_NAV = NAV_GROUPS.flatMap((group) => group.items)

/** Authenticated application shell: sidebar + header + mobile navigation. */
export function AppLayout() {
  const { status, error, reload, user, unreadCount } = useAppData()
  const { signOut } = useAuth()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const title = useMemo(() => {
    const match = ALL_NAV.find((item) => location.pathname.startsWith(item.to))
    return match?.label ?? null
  }, [location.pathname])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50">
        <Logo />
        <Spinner />
        <p className="text-[13px] text-ink-500">Loading your accounts…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
        <div className="w-full max-w-md rounded-card border border-ink-200 bg-white shadow-card">
          <ErrorState
            title="We could not load your account"
            description="Check your connection and try again — your data is safe."
            error={error}
            onRetry={reload}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar />

      <div className="lg:pl-[264px]">
        <Header />
        <MobileHeader title={title} />

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-7">
          <Outlet />
        </main>
      </div>

      <MobileNav onMore={() => setMoreOpen(true)} />

      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)} side="bottom" title="More" description="Everything else you can do with Northstar">
        <div className="flex items-center gap-3 rounded-card border border-ink-200 p-3.5">
          <Avatar name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} tone="brand" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-ink-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[12px] text-ink-500">{user?.email}</p>
          </div>
          {unreadCount ? (
            <span className="rounded-full bg-danger-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {unreadCount} new
            </span>
          ) : null}
        </div>

        <ul className="mt-3 divide-y divide-ink-100">
          {MOBILE_MORE_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 py-3.5 transition',
                      isActive ? 'text-brand-700' : 'text-ink-800',
                    )
                  }
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">{item.label}</span>
                    <span className="block text-[12px] text-ink-500">{item.description}</span>
                  </span>
                  <ChevronRight className="size-4 text-ink-300" />
                </NavLink>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 space-y-2 rounded-card bg-ink-50 p-3.5 text-[12.5px] text-ink-600">
          <p className="flex items-center gap-2">
            <Phone className="size-3.5 text-ink-400" aria-hidden="true" />
            {BRAND.supportPhone}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-3.5 text-ink-400" aria-hidden="true" />
            {BRAND.supportEmail}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-field border border-danger-100 py-3 text-[13.5px] font-semibold text-danger-600 transition hover:bg-danger-50"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </Drawer>
    </div>
  )
}
