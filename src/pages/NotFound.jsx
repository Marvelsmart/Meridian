import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui'
import { Logo } from '@/components/layout/Logo'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <Logo />
      <span className="mt-10 flex size-14 items-center justify-center rounded-full bg-ink-900 text-white">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-400">Error 404</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-ink-900">We could not find that page</h1>
      <p className="mt-2 max-w-md text-[13.5px] leading-6 text-ink-500">
        The link may be broken or the page may have moved. Everything you need is a tap away.
      </p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" to="/" icon={Home}>
          Back to home
        </Button>
        <Button to="/app/dashboard">Go to dashboard</Button>
      </div>
      <p className="mt-8 text-[12.5px] text-ink-400">
        Need help?{' '}
        <Link to="/app/security" className="font-medium text-brand-700 hover:underline">
          Visit the security centre
        </Link>
      </p>
    </div>
  )
}
