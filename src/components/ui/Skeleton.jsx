import { cn } from '@/lib/cn'

/** Shimmering placeholder block. */
export function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <div className={cn('animate-shimmer', rounded, className)} aria-hidden="true" />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

/** Row skeleton shaped like TransactionItem, used while lists load. */
export function SkeletonRows({ rows = 5, className = '' }) {
  return (
    <div className={cn('divide-y divide-ink-100', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-3.5">
          <Skeleton className="size-10" rounded="rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="ml-auto h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={cn('rounded-card border border-ink-200 bg-white p-5 shadow-card', className)}>
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-4 h-8 w-40" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-3/4" />
    </div>
  )
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-9 border-[3px]' }
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-brand-200 border-t-brand-600',
        sizes[size] ?? sizes.md,
        className,
      )}
    />
  )
}
