import { Link, Outlet } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Wallet } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { Button } from '@/components/ui'
import { SupportCard } from '@/components/banking'
import { CustomerCareChat } from '@/components/banking/CustomerCareChat'
import { useAuth } from '@/context/AuthContext'
import { Logo } from './Logo'

/**
 * Sections the marketing header can jump to.
 *
 * These are buttons rather than `href="#features"` anchors on purpose: the app
 * runs on `HashRouter`, so writing to the URL fragment is read as a route change
 * and would drop the visitor on the 404 view. Scrolling by hand leaves the
 * router — and the back button — completely untouched.
 */
const SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'security', label: 'Security' },
  { id: 'support', label: 'Support' },
]

function scrollToSection(id) {
  const target = document.getElementById(id)
  if (!target) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}

/** Marketing shell for the landing page. */
export function PublicLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
        {/* One calm row on tablet/desktop; on the narrowest phones the brand and
            the two calls to action wrap onto their own lines instead of being
            squeezed or clipped. */}
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:gap-x-4 sm:px-6 sm:py-0">
          <Logo />
          <nav className="hidden items-center gap-7 text-[13.5px] font-medium text-ink-600 md:flex">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="cursor-pointer transition hover:text-ink-900"
              >
                {section.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* A signed-in visitor is not shown the sign-up flow again. */}
            {isAuthenticated ? (
              <Button size="sm" to="/app/dashboard" iconRight={ArrowRight}>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" to="/login">
                  Sign in
                </Button>
                <Button size="sm" to="/register">
                  Open an account
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      <CustomerCareChat />

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
              { label: `About ${BRAND.name}`, to: '/' },
              { label: 'Careers', to: '/' },
              { label: 'Press', to: '/' },
              { label: 'Customer care', to: isAuthenticated ? '/app/support' : '/login' },
            ]}
          />
          <div>
            <h3 className="text-[13px] font-semibold text-ink-900">Support</h3>
            <p className="mt-3 text-[13px] text-ink-500">Chat with customer care in the app.</p>
            <SupportCard variant="compact" title="Need help?" description="Open the customer-care chat." className="mt-4" />
            <ul className="mt-5 space-y-2 text-[12.5px] text-ink-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Member FDIC
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="size-3.5" aria-hidden="true" />
                Secure digital banking
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-200">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[12px] text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© {new Date().getFullYear()} {BRAND.name} Financial Services. All rights reserved.</p>
            <p>{BRAND.name}, Member FDIC. All products subject to approval.</p>
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
