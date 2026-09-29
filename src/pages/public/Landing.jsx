/**
 * Public marketing homepage.
 *
 * Anonymous by design: this route resolves without a session, so it renders
 * marketing copy only — never balances, card numbers or transaction history.
 * A signed-in visitor sees the same page with the calls to action pointed at
 * their dashboard instead of the sign-up flow.
 */
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Phone,
  PiggyBank,
  ReceiptText,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import heroImage from '@/assets/hero-bank.jpg'
import supportImage from '@/assets/support-team.jpg'
import { BRAND } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui'

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

const HERO_STATS = [
  { label: 'Customers', value: '2.4M+' },
  { label: 'Transfers monthly', value: '$84M' },
  { label: 'Uptime', value: '99.98%' },
]

const ACCOUNT_TYPES = [
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
]

const SECURITY_POINTS = [
  { icon: ShieldCheck, title: 'Two-factor auth', body: 'Authenticator app or SMS codes' },
  { icon: Lock, title: 'Device sessions', body: 'Sign out any device instantly' },
  { icon: Users, title: 'Login alerts', body: 'Know the moment someone signs in' },
  { icon: BadgeCheck, title: 'Card controls', body: 'Freeze cards without a phone call' },
]

const STEPS = [
  { title: 'Open your account', body: 'Register with your name, email and phone number — no paperwork.' },
  { title: 'Fund it your way', body: 'Top up by bank transfer or card and set your transfer limits.' },
  { title: 'Use it everywhere', body: 'Transfer, pay bills, manage cards and track cash flow — all in one place.' },
]

const SUPPORT_DETAILS = [
  { icon: Phone, label: 'Call us', value: BRAND.supportPhone },
  { icon: Mail, label: 'Email us', value: BRAND.supportEmail },
  { icon: Clock, label: 'Opening hours', value: 'Phone lines open 24/7, every day of the year' },
]

export default function Landing() {
  useDocumentTitle('Modern U.S. banking')
  const { isAuthenticated } = useAuth()

  // A signed-in visitor should not be pitched the sign-up flow again.
  const primary = isAuthenticated
    ? { to: '/app/dashboard', label: 'Go to your dashboard' }
    : { to: '/register', label: 'Open an account' }
  const secondary = isAuthenticated
    ? { to: '/app/transactions', label: 'View transactions' }
    : { to: '/login', label: 'Sign in' }

  return (
    <div className="bg-white">
      {/*
        Hero. The photograph is decorative and sits behind a sideways scrim that
        darkens the copy side far more than the picture side, so the headline
        holds its contrast at every width without hiding the branch behind it.
      */}
      <section className="relative isolate overflow-hidden bg-ink-950">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink-950 to-transparent"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur">
              <ShieldCheck className="size-3.5 text-brand-300" aria-hidden="true" />
              Member FDIC · Deposits insured up to $250,000
            </span>

            <h1 className="mt-6 text-[clamp(2rem,6.6vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-white">
              Banking that moves with your life.
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/75">
              {BRAND.name} brings your checking, savings, cards and spending insights into one calm interface — built for
              people who want better control over every dollar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" to={primary.to} iconRight={ArrowRight}>
                {primary.label}
              </Button>
              <Button size="lg" variant="secondary" to={secondary.to}>
                {secondary.label}
              </Button>
            </div>

            <p className="mt-4 text-[12.5px] text-white/60">
              No monthly fees · No minimum balance · Open an account in about five minutes
            </p>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 sm:gap-6">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/55">{stat.label}</dt>
                  <dd className="amount mt-1 text-[19px] font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-b border-ink-200 bg-ink-50/60">
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

      <section id="accounts" className="scroll-mt-20 border-b border-ink-200">
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
            {ACCOUNT_TYPES.map((account) => {
              const Icon = account.icon
              return (
                <li key={account.name} className="flex items-start gap-4 rounded-card border border-ink-200 bg-white p-4 shadow-card">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-semibold text-ink-900">{account.name}</h3>
                    <p className="mt-0.5 text-[13px] text-ink-600">{account.detail}</p>
                    <p className="mt-1 text-[12.5px] text-ink-500">{account.note}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="scroll-mt-20 border-b border-ink-200 bg-ink-50/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
            <img
              src={supportImage}
              alt="Bank support specialists answering customer calls at their desks in a bright operations floor"
              className="h-72 w-full object-cover sm:h-96"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-700">Real people</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[32px]">
              Talk to a person, not a phone tree.
            </h2>
            <p className="mt-4 text-[14.5px] leading-7 text-ink-600">
              Questions about a transfer, a card or a statement are answered by bankers who see the same account view you
              do — no scripted triage and no being passed between departments.
            </p>

            <dl className="mt-7 grid gap-4">
              {SUPPORT_DETAILS.map((detail) => {
                const Icon = detail.icon
                return (
                  <div key={detail.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-ink-700 ring-1 ring-inset ring-ink-200">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[12px] font-medium uppercase tracking-[0.07em] text-ink-500">{detail.label}</dt>
                      <dd className="wrap-anywhere text-[14px] font-medium text-ink-900">{detail.value}</dd>
                    </div>
                  </div>
                )
              })}
            </dl>

            <Button className="mt-7" variant="secondary" to={isAuthenticated ? '/app/support' : '/login'}>
              {isAuthenticated ? 'Open the support centre' : 'Sign in to message us'}
            </Button>
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-20 border-b border-ink-200 bg-ink-900">
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
            <Button className="mt-6" to={isAuthenticated ? '/app/security' : '/register'}>
              {isAuthenticated ? 'Review your sessions' : 'Open a secured account'}
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {SECURITY_POINTS.map((item) => {
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
              {STEPS.map((step, index) => (
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
                {isAuthenticated ? 'Pick up where you left off.' : 'Open your account today.'}
              </h2>
              <p className="mt-1.5 text-[13.5px] text-ink-600">
                {isAuthenticated
                  ? `Your ${BRAND.name} dashboard is ready when you are.`
                  : 'It takes about five minutes, and there is nothing to pay to get started.'}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              {isAuthenticated ? (
                <Button to="/app/dashboard" iconRight={ArrowRight}>
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button variant="secondary" to="/login">
                    Sign in
                  </Button>
                  <Button to="/register" iconRight={ArrowRight}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
