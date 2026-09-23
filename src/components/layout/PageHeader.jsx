import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Consistent page title block: optional back link, description and actions. */
export function PageHeader({ title, description = null, backTo = null, backLabel = 'Back', actions = null, meta = null, className = '' }) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        {backTo ? (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[24px]">
          {title}
        </h1>
        {description ? <p className="mt-1 max-w-2xl text-[13.5px] leading-6 text-ink-500">{description}</p> : null}
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
