import { Component } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

/**
 * Last line of defence against a blank white screen.
 *
 * Runtime errors are logged to the console (never swallowed) and the customer
 * gets a recoverable message with a way back, so one broken screen can no
 * longer take the whole application down.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surfaced on purpose: the actual error must stay visible in devtools.
    console.error('[Northstar] Unhandled UI error:', error, info?.componentStack)
  }

  handleRetry = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
        <div className="w-full max-w-md rounded-card border border-ink-200 bg-white p-6 text-center shadow-card">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[16px] font-semibold text-ink-900">This screen could not be displayed</h1>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-500">
            Something unexpected happened while rendering this page. Your account data is unaffected.
          </p>
          {error?.message ? (
            <p className="mt-3 break-words rounded-lg bg-ink-50 px-3 py-2 text-left font-mono text-[11.5px] leading-5 text-ink-600">
              {String(error.message)}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" icon={RefreshCw} onClick={this.handleRetry}>
              Try again
            </Button>
            <Button icon={Home} to="/app/dashboard">
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
