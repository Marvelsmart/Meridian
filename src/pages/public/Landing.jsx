import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Globe,
  Lock,
  PiggyBank,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { ACCOUNTS } from '@/data/users'
import { TRANSACTIONS } from '@/data/transactions'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, SectionCard } from '@/components/ui'
import { BalanceCard, TransactionItem } from '@/components/banking'

const FEATURES = [
  {
    icon: Send,
    title: 'Transfers that land instantly',
    body: 'Send to U.S. bank accounts and digital wallets in seconds — fees are visible before you confirm.',
  },
  {
    icon: CreditCard,
    title: 'Cards you actually control',
    body: 'Freeze, unfreeze, and manage spending limits from your phone. Virtual cards for online purchases in one tap.',
  },
  {
    icon: ReceiptText,
    title: 'Bills without the queue',
    body: 'Utilities, subscriptions and recurring expenses — all in one simple place for effortless monthly payments.',
  },
  {
    icon: TrendingUp,
    title: 'Understand every dollar',
    body: 'See spending trends, monthly statements and exports that make your money habits easy to understand.',
  },
  {
    icon: ShieldCheck,
    title: 'Security that is visible',
    body: 'Two-factor authentication, device activity, and login alerts you can review anytime.',
  },
  {
    icon: PiggyBank,
    title: 'Savings on autopilot',
    body: 'Set a goal, automate a transfer, and grow your cash without lifting a finger.',
  },
]

export default function Landing() {
  useDocumentTitle('Modern U.S. banking')
  const previewAccount = ACCOUNTS[0]
  const previewTransactions = TRANSACTIONS.slice(0, 4)

  return (
    <div className="bg-white">
      <section className="border-b border-ink-200">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-[12px] font-medium text-ink-600">
              <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
              Member FDIC · secure digital banking
            </span>

            <h1 className="mt-6 text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink-900 sm:text-[46px]">
              Banking that moves with your life.
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-600">
              {BRAND.name} brings your checking, savings, cards and spending insights into one calm interface — built for
              people who want better control over every dollar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" to="/register" iconRight={ArrowRight}>
                Open an account
              </Button>
              <Button size="lg" variant="secondary" to="/login">
                Sign in
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-200 pt-6">
              {[
                { label: 'Customers', value: '2.4M+' },
                { label: 'Transfers monthly', value: '$84M' },
                { label: 'Uptime', value: '99.98%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[12px] font-medium uppercase tracking-[0.07em] text-ink-400">{stat.label}</dt>
                  <dd className="amount mt-1 text-[19px] font-semibold text-ink-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-ink-100/70" aria-hidden="true" />
            <div className="space-y-4">
              <BalanceCard
                account={previewAccount}
                accounts={[]}
                summary={{ credits: 2184000, debits: 986320 }}
                pendingCount={1}
              />
              <SectionCard
                title="Recent activity"
                description="What your dashboard shows"
                bodyClassName="divide-y divide-ink-100 px-3 py-1"
              >
                {previewTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} variant="compact" />
                ))}
              </SectionCard>
            </div>
            <p className="mt-3 text-center text-[11.5px] text-ink-400">
              Interface preview using mock data — no real money is involved.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-ink-200 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-700">Everything in one place</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
              Built for the way money actually moves.
            </h2>
            <p className="mt-4 text-[14.5px] leading-7 text-ink-600">
              No noisy dashboards and no features you will never use. Every screen answers a question you have about
              your money.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-6 text-ink-600">{feature.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="accounts" className="border-b border-ink-200">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:py-20">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-700">Accounts</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[32px]">
              The right account for each part of your life.
            </h2>
            <p className="mt-4 text-[14.5px] leading-7 text-ink-600">
              Hold everyday spending and savings side by side, with clear limits and no surprises about what a transfer
              costs.
            </p>
            <Button className="mt-6" variant="secondary" to="/register">
              Compare account types
            </Button>
          </div>

          <ul className="grid gap-3">
            {[
              {
                icon: PiggyBank,
                name: 'Everyday Savings',
                detail: '0.04% APY, $25,000 daily transfer limit',
                note: 'For everyday spending and goals',
              },
              {
                icon: TrendingUp,
                name: 'Business Current',
                detail: '$50,000 daily limit, unlimited inflows',
                note: 'For freelancers and growing households',
              },
              {
                icon: Globe,
                name: 'Domiciliary USD',
                detail: 'Hold, receive and transfer cash globally',
                note: 'For travel and international spending',
              },
            ].map((account) => {
              const Icon = account.icon
              return (
                <li key={account.name} className="flex items-start gap-4 rounded-card border border-ink-200 bg-white p-4 shadow-card">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-semibold text-ink-900">{account.name}</h3>
                    <p className="mt-0.5 text-[13px] text-ink-600">{account.detail}</p>
                    <p className="mt-1 text-[12.5px] text-ink-400">{account.note}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section id="security" className="border-b border-ink-200 bg-ink-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-300">Security</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
              You can see everything we do to protect your money.
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-7 text-white/70">
              Review your active sessions, approve devices, rotate your password and switch on two-factor
              authentication — all from the security centre.
            </p>
            <Button className="mt-6" to="/register">
              Open a secured account
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: 'Two-factor auth', body: 'Authenticator app or SMS codes' },
              { icon: Lock, title: 'Device sessions', body: 'Sign out any device instantly' },
              { icon: Users, title: 'Login alerts', body: 'Know the moment someone signs in' },
              { icon: BadgeCheck, title: 'Card controls', body: 'Freeze cards without a phone call' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <li key={item.title} className="rounded-card border border-white/10 bg-white/5 p-4">
                  <Icon className="size-5 text-brand-300" aria-hidden="true" />
                  <h3 className="mt-3 text-[14px] font-semibold text-white">{item.title}</h3>
                  <p className="mt-0.5 text-[12.5px] leading-5 text-white/60">{item.body}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-700">Getting started</p>
              <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink-900">
                From sign-up to your first transfer in minutes.
              </h2>
            </div>
            <ol className="grid gap-4">
              {[
                { title: 'Open your account', body: 'Register with your name, email and phone number — no paperwork.' },
                { title: 'Fund it your way', body: 'Top up by bank transfer or card and set your transfer limits.' },
                { title: 'Use it everywhere', body: 'Transfer, pay bills, manage cards and track cash flow — all in one place.' },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-card border border-ink-200 bg-white p-4 shadow-card">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[14.5px] font-semibold text-ink-900">{step.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-6 text-ink-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-card border border-ink-200 bg-ink-50 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink-900">
                Try the full product.
              </h2>
              <p className="mt-1.5 text-[13.5px] text-ink-600">
                Explore the banking experience in a fictional environment — nothing you do affects real money.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button variant="secondary" to="/login">
                Sign in
              </Button>
              <Button to="/register" iconRight={ArrowRight}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
