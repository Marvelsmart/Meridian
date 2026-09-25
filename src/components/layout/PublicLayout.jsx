import { Link, Outlet } from 'react-router-dom'
import { ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { Button } from '@/components/ui'
import { SupportCard } from '@/components/banking'
import { Logo } from './Logo'

/** Marketing shell for the landing page. */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-[13.5px] font-medium text-ink-600 md:flex">
            <a href="#features" className="transition hover:text-ink-900">
              Features
            </a>
            <a href="#accounts" className="transition hover:text-ink-900">
              Accounts
            </a>
            <a href="#security" className="transition hover:text-ink-900">
              Security
            </a>
            <a href="#support" className="transition hover:text-ink-900">
              Support
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" to="/login">
              Sign in
            </Button>
            <Button size="sm" to="/register">
              Open an account
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer id="support" className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-ink-500">{BRAND.tagline} Built for everyday money and the people who move it.</p>
          </div>
          <FooterColumn
            title="Product"
            links={[
              { label: 'Everyday savings', to: '/register' },
              { label: 'Business current', to: '/register' },
              { label: 'Cards', to: '/login' },
              { label: 'Statements', to: '/login' },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: 'About Northstar', to: '/' },
              { label: 'Careers', to: '/' },
              { label: 'Press', to: '/' },
              { label: 'Contact', to: '/' },
            ]}
          />
          <div>
            <h3 className="text-[13px] font-semibold text-ink-900">Support</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] text-ink-500">
              <li>{BRAND.supportPhone}</li>
              <li>{BRAND.supportEmail}</li>
              <li>{BRAND.address}</li>
            </ul>
            <SupportCard variant="compact" title="Need help?" description="Chat with Support on WhatsApp." className="mt-4" />
            <ul className="mt-5 space-y-2 text-[12.5px] text-ink-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Member FDIC
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="size-3.5" aria-hidden="true" />
                Secure digital banking
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Frontend demo — mock data only
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-200">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[12px] text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© {new Date().getFullYear()} {BRAND.name} Financial Services. All rights reserved.</p>
            <p>Demo build for product review — no real money moves.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-ink-900">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-[13px]">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-ink-500 transition hover:text-ink-900">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
