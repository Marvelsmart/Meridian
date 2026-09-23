import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HelpCircle, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { AccountMenu, NotificationsMenu } from './HeaderMenus'

/** Desktop top bar: search, notifications, help link and the account menu. */
export function Header({ className = '' }) {
  const { user, notifications, unreadCount, actions } = useAppData()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-ink-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8',
        className,
      )}
    >
      <form
        className="relative hidden max-w-md flex-1 sm:block"
        onSubmit={(event) => {
          event.preventDefault()
          navigate(query.trim() ? `/app/transactions?q=${encodeURIComponent(query.trim())}` : '/app/transactions')
        }}
        role="search"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions, references, beneficiaries"
          aria-label="Search transactions"
          className="h-10 w-full rounded-field border border-ink-200 bg-ink-50 pl-10 pr-3 text-[13.5px] text-ink-900 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:bg-white"
        />
      </form>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <Link
          to="/app/transfer"
          className="hidden rounded-field bg-brand-600 px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-700 lg:inline-flex"
        >
          Send money
        </Link>
        <NotificationsMenu
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={actions.markNotificationRead}
          onReadAll={actions.markAllNotificationsRead}
        />
        <Link
          to="/app/security"
          title="Security centre"
          aria-label="Security centre"
          className="hidden rounded-field p-2.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 sm:inline-flex"
        >
          <HelpCircle className="size-[18px]" />
        </Link>
        <AccountMenu user={user} onSignOut={signOut} />
      </div>
    </header>
  )
}
