import { CalendarRange, Filter, RotateCcw, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CATEGORY_OPTIONS, DATE_RANGE_OPTIONS, STATUS_OPTIONS } from '@/lib/constants'
import { Button, Input, Select } from '@/components/ui'

const TYPE_OPTIONS = [
  { value: 'credit', label: 'Money in' },
  { value: 'debit', label: 'Money out' },
]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
]

/** Search + filter controls shared by the transactions history page. */
export function TransactionFilters({ filters, onChange, accounts = [], onReset, resultCount = 0, className = '' }) {
  const update = (patch) => onChange({ ...filters, ...patch, page: 1 })

  const activeFilters = [
    filters.status !== 'all',
    filters.category !== 'all',
    filters.type !== 'all',
    filters.accountId !== 'all',
    filters.range !== '30d',
  ].filter(Boolean).length

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            leftIcon={Search}
            placeholder="Search description, reference, recipient"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
            aria-label="Search transactions"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-1 lg:justify-end">
          <Select
            value={filters.range}
            onChange={(event) => update({ range: event.target.value })}
            options={DATE_RANGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            placeholder={null}
            className="lg:w-[150px]"
            aria-label="Date range"
          />
          <Select
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
            options={[{ value: 'all', label: 'All statuses' }, ...STATUS_OPTIONS]}
            placeholder={null}
            className="lg:w-[140px]"
            aria-label="Status"
          />
          <Select
            value={filters.category}
            onChange={(event) => update({ category: event.target.value })}
            options={[{ value: 'all', label: 'All categories' }, ...CATEGORY_OPTIONS]}
            placeholder={null}
            className="lg:w-[160px]"
            aria-label="Category"
          />
          <Select
            value={filters.type}
            onChange={(event) => update({ type: event.target.value })}
            options={[{ value: 'all', label: 'In & out' }, ...TYPE_OPTIONS]}
            placeholder={null}
            className="lg:w-[130px]"
            aria-label="Direction"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.accountId}
            onChange={(event) => update({ accountId: event.target.value })}
            options={[{ value: 'all', label: 'All accounts' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
            placeholder={null}
            className="sm:w-[180px]"
            aria-label="Account"
          />
          <Select
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value })}
            options={SORT_OPTIONS}
            placeholder={null}
            className="sm:w-[170px]"
            aria-label="Sort by"
          />

          {filters.range === 'custom' ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.from ?? ''}
                onChange={(event) => update({ from: event.target.value })}
                aria-label="From date"
                className="h-11 rounded-field border border-ink-200 px-3 text-[13px] text-ink-800 outline-none focus:border-brand-500"
              />
              <span className="text-ink-400">→</span>
              <input
                type="date"
                value={filters.to ?? ''}
                onChange={(event) => update({ to: event.target.value })}
                aria-label="To date"
                className="h-11 rounded-field border border-ink-200 px-3 text-[13px] text-ink-800 outline-none focus:border-brand-500"
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500">
            <Filter className="size-3.5" aria-hidden="true" />
            {activeFilters ? `${activeFilters} filter${activeFilters > 1 ? 's' : ''} · ` : ''}
            {resultCount} result{resultCount === 1 ? '' : 's'}
          </span>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>

      {filters.range === 'custom' && !filters.from && !filters.to ? (
        <p className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <CalendarRange className="size-3.5" aria-hidden="true" />
          Pick a start and end date to narrow the list.
        </p>
      ) : null}
    </div>
  )
}
