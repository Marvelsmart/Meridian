import { cn } from '@/lib/cn'

/** Minimal table primitives so every data table shares the same rhythm. */
export function Table({ children, className = '' }) {
  return (
    // Only the table scrolls sideways on small screens — never the whole page.
    <div className="scroll-x w-full">
      <table className={cn('w-full border-collapse text-left', className)}>{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead className="border-b border-ink-200">
      <tr>{children}</tr>
    </thead>
  )
}

export function TBody({ children, className = '' }) {
  return <tbody className={cn('divide-y divide-ink-100', className)}>{children}</tbody>
}

export function TR({ children, className = '', clickable = false, ...props }) {
  return (
    <tr
      className={cn(clickable && 'cursor-pointer transition-colors hover:bg-ink-50/80', className)}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TH({ children, className = '', align = 'left' }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-500 sm:px-4',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TD({ children, className = '', align = 'left' }) {
  return (
    <td
      className={cn(
        'px-3 py-3 text-[13px] text-ink-700 sm:px-4 sm:py-3.5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}
