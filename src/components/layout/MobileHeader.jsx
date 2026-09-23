import { cn } from '@/lib/cn'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { AccountMenu, NotificationsMenu } from './HeaderMenus'
import { Logo } from './Logo'

/** Compact sticky header for phones and small tablets. */
export function MobileHeader({ title = null, className = '' }) {
  const { user, notifications, unreadCount, actions } = useAppData()
  const { signOut } = useAuth()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-ink-200 bg-white/95 px-4 backdrop-blur lg:hidden',
        className,
      )}
    >
      {title ? (
        <h1 className="min-w-0 truncate text-[15px] font-semibold text-ink-900">{title}</h1>
      ) : (
        <Logo size="sm" />
      )}

      <div className="flex shrink-0 items-center gap-0.5">
        <NotificationsMenu
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={actions.markNotificationRead}
          onReadAll={actions.markAllNotificationsRead}
        />
        <AccountMenu user={user} onSignOut={signOut} />
      </div>
    </header>
  )
}
