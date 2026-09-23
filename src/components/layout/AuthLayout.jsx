import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { Logo } from './Logo'

/**
 * Split screen used by login, register and password recovery:
 * the form stays focused on the left, brand reassurance on the right.
 */
export function AuthLayout({ title, subtitle, children, footer = null, points = [], backTo = '/', backLabel = 'Back to home' }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full flex-col px-5 py-8 sm:px-8 lg:w-[52%] lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {backLabel}
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-[13.5px] leading-6 text-ink-500">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-[13px] text-ink-500">{footer}</div> : null}
        </div>

        <p className="text-[12px] text-ink-400">
          Demo environment · mock data only · not a real financial institution
        </p>
      </div>

      <aside className="relative hidden flex-1 overflow-hidden bg-ink-900 lg:block">
        <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/40">Northstar digital banking</p>
          <h2 className="mt-5 max-w-md text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
            One account for spending, saving and everything in between.
          </h2>
          <ul className="mt-8 space-y-4">
            {(points.length
              ? points
              : [
                  'Instant transfers to U.S. accounts',
                  'Freeze and unfreeze cards in one tap',
                  'Bills and subscriptions in the same place',
                  'Statements you can actually download',
                ]
            ).map((point) => (
              <li key={point} className="flex items-start gap-3 text-[13.5px] leading-6 text-white/75">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-500/15 text-success-500">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-12 max-w-md rounded-card border border-white/10 bg-white/5 p-5">
            <p className="text-[13.5px] leading-6 text-white/80">
              “I moved my rent, internet and family transfers here in a week. It is the first banking app I have not
              deleted.”
            </p>
            <p className="mt-3 text-[12.5px] font-medium text-white/50">Chioma N. · Small business owner</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
