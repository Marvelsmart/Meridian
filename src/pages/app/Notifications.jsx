import { useMemo, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { NotificationItem } from '@/components/banking'
import { useAppData } from '@/context/AppDataContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, Card, EmptyState, Tabs } from '@/components/ui'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'transaction', label: 'Transactions' },
  { value: 'security', label: 'Security' },
  { value: 'account', label: 'Account' },
  { value: 'promo', label: 'Offers' },
]

export default function NotificationsPage() {
  useDocumentTitle('Notifications')
  const { notifications, actions } = useAppData()
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return filter === 'all' ? notifications : notifications.filter((item) => item.category === filter)
  }, [filter, notifications])

  const unreadCount = notifications.filter((item) => !item.read).length

  const handleReadAll = async () => {
    if (!unreadCount) return
    await actions.markAllNotificationsRead()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Notifications</h1>
          <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
            Security, account and transaction updates from Northstar.
          </p>
        </div>
        <Button variant="secondary" icon={CheckCheck} onClick={handleReadAll} disabled={!unreadCount}>
          Mark all read
        </Button>
      </div>

      <Card padded={false}>
        <div className="border-b border-ink-100 p-4">
          <Tabs
            variant="pill"
            value={filter}
            onChange={setFilter}
            ariaLabel="Notification categories"
            items={CATEGORIES.map((category) => ({
              value: category.value,
              label: category.label,
              count: category.value === 'all' ? notifications.length : notifications.filter((item) => item.category === category.value).length,
            }))}
          />
        </div>

        <div className="divide-y divide-ink-100">
          {filtered.length ? (
            filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={actions.markNotificationRead}
                onDelete={actions.deleteNotification}
              />
            ))
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications in this view"
              description="Your activity feed is clear for this category."
              compact
            />
          )}
        </div>
      </Card>
    </div>
  )
}
