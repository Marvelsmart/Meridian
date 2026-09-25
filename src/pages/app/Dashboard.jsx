import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Bell, Clock3, Sparkles, TrendingUp, Wallet } from 'lucide-react'
import * as api from '@/lib/api'
import { dailyFlow, inRange, spendByCategory, sumsFor } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
import { useAppData } from '@/context/AppDataContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, SectionCard, SkeletonCard } from '@/components/ui'
import { EmptyState } from '@/components/ui/States'
import {
  BalanceCard,
  DepositDialog,
  FundingCodeModal,
  MoneyFlowChart,
  NotificationItem,
  QuickActions,
  SpendingSummary,
  StatCard,
  TransactionList,
} from '@/components/banking'

function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const {
    user,
    accounts,
    activeAccount,
    selectAccount,
    transactions,
    notifications,
    actions,
    prefs,
    toggleHideBalances,
    dataVersion,
  } = useAppData()
  const navigate = useNavigate()
  const [depositOpen, setDepositOpen] = useState(false)
  const [fundingCodeOpen, setFundingCodeOpen] = useState(false)

  const { data: summary, loading, error } = useAsync(
    () => api.fetchDashboardSummary({ accountId: activeAccount?.id }),
    [activeAccount?.id, dataVersion],
  )

  const accountTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.accountId === activeAccount?.id),
    [transactions, activeAccount?.id],
  )

  const last30Days = useMemo(() => {
    const since = new Date()
    since.setDate(since.getDate() - 30)
    return inRange(accountTransactions, since, new Date())
  }, [accountTransactions])

  const categories = useMemo(() => spendByCategory(last30Days), [last30Days])
  const flowSeries = useMemo(() => dailyFlow(accountTransactions, 14), [accountTransactions])
  const monthSpend = useMemo(() => sumsFor(last30Days), [last30Days])
  const recent = useMemo(() => accountTransactions.slice(0, 6), [accountTransactions])
  const topNotifications = useMemo(() => notifications.slice(0, 3), [notifications])
  const showSkeletons = loading && !summary

  const handleQuickAction = (action) => {
    if (action === 'deposit') setFundingCodeOpen(true)
  }

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-ink-500">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]">
            {greetingFor()}, {user?.firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" to="/app/statements">
            Statements
          </Button>
          <Button size="sm" to="/app/transfer" icon={ArrowUpRight}>
            Send money
          </Button>
        </div>
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <BalanceCard
            account={activeAccount}
            accounts={accounts}
            onSelectAccount={selectAccount}
            hidden={prefs.hideBalances}
            onToggleHidden={toggleHideBalances}
            summary={summary?.summary}
            pendingCount={summary?.pending ?? 0}
            loading={showSkeletons}
          />

          <SectionCard title="Quick actions" description="Move money without leaving the dashboard">
            <QuickActions onAction={handleQuickAction} />
          </SectionCard>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Money in · 30d"
              value={formatCurrency(summary?.summary?.credits ?? 0)}
              icon={ArrowDownLeft}
              tone="success"
              hint={`${summary?.summary?.inflowCount ?? 0} credits`}
              loading={showSkeletons}
            />
            <StatCard
              label="Money out · 30d"
              value={formatCurrency(summary?.summary?.debits ?? 0)}
              icon={ArrowUpRight}
              tone="ink"
              hint={`${summary?.summary?.outflowCount ?? 0} debits`}
              loading={showSkeletons}
            />
            <StatCard
              label="Pending"
              value={`${summary?.pending ?? 0} item${(summary?.pending ?? 0) === 1 ? '' : 's'}`}
              icon={Clock3}
              tone="warning"
              hint="Awaiting settlement"
              loading={showSkeletons}
            />
            <StatCard
              label="Spend this month"
              value={formatCurrency(monthSpend.debits)}
              icon={TrendingUp}
              tone="brand"
              hint="Debits including fees"
            />
          </div>

          <SectionCard
            title="Notifications"
            description="Security and transaction alerts"
            bodyClassName="divide-y divide-ink-100 px-2 py-1"
            action={
              <Link to="/app/notifications" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
                View all
              </Link>
            }
          >
            {topNotifications.length ? (
              topNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={actions.markNotificationRead}
                  compact
                />
              ))
            ) : (
              <EmptyState icon={Bell} title="No notifications" description="You are all caught up." compact />
            )}
          </SectionCard>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard
            title="Recent transactions"
            description={activeAccount ? `Latest activity on ${activeAccount.name}` : undefined}
            bodyClassName="px-3 py-1"
            action={
              <Link to="/app/transactions" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
                See all
              </Link>
            }
          >
            <TransactionList
              transactions={recent}
              loading={showSkeletons}
              error={error}
              emptyTitle="No transactions yet"
              emptyDescription="Your transfers, card payments and bills will appear here."
              emptyActionLabel="Make a transfer"
              onEmptyAction={() => navigate('/app/transfer')}
            />
            {recent.length ? (
              <p className="px-2 pb-3 pt-1 text-[12.5px] text-ink-500">
                Showing the latest {recent.length} of {accountTransactions.length} transactions on this account.
              </p>
            ) : null}
          </SectionCard>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <SectionCard title="Spending summary" description="By category · last 30 days">
            {showSkeletons ? (
              <SkeletonCard className="border-0 p-0 shadow-none" />
            ) : categories.length ? (
              <SpendingSummary data={categories} total={monthSpend.debits} />
            ) : (
              <EmptyState
                icon={Wallet}
                title="No spending in this period"
                description="Once money leaves this account, the breakdown appears here."
                compact
              />
            )}
          </SectionCard>

          <SectionCard
            title="Money flow"
            description="Money in and out · last 14 days"
            action={<Sparkles className="size-4 text-ink-300" aria-hidden="true" />}
          >
            {showSkeletons ? (
              <div className="h-[220px] animate-shimmer rounded-xl" />
            ) : (
              <MoneyFlowChart data={flowSeries} />
            )}
          </SectionCard>
        </div>
      </div>

      <FundingCodeModal
        open={fundingCodeOpen}
        onClose={() => setFundingCodeOpen(false)}
        onVerified={() => {
          setFundingCodeOpen(false)
          setDepositOpen(true)
        }}
      />
      <DepositDialog open={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  )
}
