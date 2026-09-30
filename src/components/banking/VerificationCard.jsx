import { AlertTriangle, BadgeCheck, Clock3, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DEFAULT_VERIFICATION_STATUS, verificationMeta } from '@/config/verification'
import { Select } from '@/components/ui'

const TONE_ICONS = {
  'badge-check': BadgeCheck,
  clock: Clock3,
  search: Search,
  alert: AlertTriangle,
}

/**
 * Customer-facing identity verification status.
 *
 * The states (Verified / Pending / Under review / Required) follow the checks a
 * U.S. retail bank asks of a new customer. The status the customer selects is
 * recorded on their profile and reviewed by the bank.
 */
export function VerificationCard({
  status = DEFAULT_VERIFICATION_STATUS,
  onStatusChange = null,
  options = [],
  title = 'Identity Verification',
  className = '',
}) {
  const meta = verificationMeta(status)
  const Icon = TONE_ICONS[meta.icon] ?? BadgeCheck

  return (
    <div className={cn('rounded-card border border-ink-200 bg-white p-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              meta.badge,
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-ink-900">{title}</h3>
            <p className="mt-0.5 text-[13px] font-medium text-ink-700">{meta.label}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset',
            meta.badge,
          )}
        >
          {meta.label}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-5 text-ink-600">{meta.summary}</p>
      <p className="mt-1 text-[12.5px] leading-5 text-ink-500">{meta.detail}</p>

      {onStatusChange && options.length ? (
        <div className="mt-4 border-t border-ink-100 pt-3">
          <Select
            label="Verification status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            options={options}
            placeholder={null}
          />
        </div>
      ) : null}

      <p className="mt-3 text-[11.5px] leading-5 text-ink-400">
        Your verification status is saved to your profile and reviewed by our team.
      </p>
    </div>
  )
}
