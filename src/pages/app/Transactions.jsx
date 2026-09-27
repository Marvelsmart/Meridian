import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Download, ListFilter } from 'lucide-react'
import * as api from '@/lib/api'
import { DATE_RANGE_OPTIONS } from '@/lib/constants'
import { formatCurrency, toInputDate } from '@/lib/format'
import { transactionsToCsv } from '@/lib/statement'
import { downloadFile } from '@/lib/download'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, Card, Pagination, SectionCard } from '@/components/ui'
import { TransactionFilters } from '@/components/banking/TransactionFilters'
import { TransactionList, StatCard } from '@/components/banking'

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  category: 'all',
  type: 'all',
  accountId: 'all',
  range: '30d',
  from: '',
  to: '',
  sort: 'date-desc',
  page: 1,
}

function rangeToDates(range, from, to) {
  const option = DATE_RANGE_OPTIONS.find((item) => item.value === range)
  if (range === 'custom') return { from: from || null, to: to || null }
  if (range === 'all' || !option?.days) return { from: null, to: null }
  const start = new Date()
  start.setDate(start.getDate() - option.days)
  return { from: start, to: new Date() }
}

export default function Transactions() {
  useDocumentTitle('Transactions')
  const { accounts } = useAppData()
  const toast = useToast()
  const [params, setParams] = useSearchParams()

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: params.get('q') ?? '',
    status: params.get('status') ?? 'all',
    category: params.get('category') ?? 'all',
    range: params.get('range') ?? '30d',
    page: Number(params.get('page') ?? 1) || 1,
  }))

  useEffect(() => {
    const next = new URLSearchParams()
    if (filters.search) next.set('q', filters.search)
    if (filters.status !== 'all') next.set('status', filters.status)
    if (filters.category !== 'all') next.set('category', filters.category)
    if (filters.range !== '30d') next.set('range', filters.range)
    if (filters.page > 1) next.set('page', String(filters.page))
    setParams(next, { replace: true })
  }, [filters, setParams])

  const { from, to } = rangeToDates(filters.range, filters.from, filters.to)

  const { data, loading, error, refetch } = useAsync(
    () =>
      api.fetchTransactions({
        page: filters.page,
        pageSize: 10,
        search: filters.search,
        status: filters.status,
        category: filters.category,
        type: filters.type,
        accountId: filters.accountId,
        sort: filters.sort,
        from,
        to,
      }),
    [
      filters.page,
      filters.search,
      filters.status,
      filters.category,
      filters.type,
      filters.accountId,
      filters.sort,
      filters.range,
      filters.from,
      filters.to,
    ],
  )

  const summary = data?.summary
  const items = data?.items ?? []

  const handleExport = useCallback(() => {
    if (!items.length) {
      toast.error('Nothing to export', 'Adjust your filters so at least one transaction is listed.')
      return
    }
    downloadFile({
      content: transactionsToCsv(items, {
        title: 'Northstar — filtered transactions',
        period: `${toInputDate(from ?? new Date())} to ${toInputDate(to ?? new Date())}`,
      }),
      filename: `northstar-transactions-${toInputDate(new Date())}.csv`,
      mimeType: 'text/csv',
    })
    toast.success('Export ready', `${items.length} transactions downloaded as CSV.`)
  }, [items, from, to, toast])

  const dateLabel = useMemo(
    () => DATE_RANGE_OPTIONS.find((item) => item.value === filters.range)?.label ?? 'Selected period',
    [filters.range],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Transactions</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-6 text-ink-500">
            Every debit and credit across your accounts, with the reference you can quote to support.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Transactions"
          value={`${summary?.count ?? 0}`}
          icon={ListFilter}
          hint={dateLabel}
          loading={loading && !data}
        />
        <StatCard
          label="Money in"
          value={formatCurrency(summary?.credits ?? 0)}
          icon={ArrowDownLeft}
          tone="success"
          hint={`${summary?.inflowCount ?? 0} credits`}
          loading={loading && !data}
        />
        <StatCard
          label="Money out"
          value={formatCurrency(summary?.debits ?? 0)}
          icon={ArrowUpRight}
          tone="ink"
          hint={`${summary?.outflowCount ?? 0} debits`}
          loading={loading && !data}
        />
        <StatCard
          label="Excluded"
          value={`${summary?.ignored ?? 0}`}
          icon={ListFilter}
          tone="warning"
          hint="Failed & reversed"
          loading={loading && !data}
        />
      </div>

      <Card padded={false}>
        <div className="border-b border-ink-100 p-4">
          <TransactionFilters
            filters={filters}
            onChange={setFilters}
            accounts={accounts}
            resultCount={data?.total ?? 0}
            onReset={() => setFilters({ ...DEFAULT_FILTERS })}
          />
        </div>

        <div className="px-3 py-2">
          <TransactionList
            transactions={items}
            loading={loading}
            error={error}
            onRetry={refetch}
            showBalance
            emptyTitle="No transactions match your filters"
            emptyDescription="Try widening the date range, clearing the search, or picking a different status."
            emptyActionLabel="Reset filters"
            onEmptyAction={() => setFilters({ ...DEFAULT_FILTERS })}
          />
        </div>

        {data && data.total > 0 ? (
          <div className="border-t border-ink-100 px-4 py-3">
            <Pagination
              page={data.page}
              pageCount={data.pageCount}
              onChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </div>
        ) : null}
      </Card>

      <SectionCard title="Reading your history" description="What the numbers mean">
        <ul className="space-y-2 text-[13px] leading-6 text-ink-600">
          <li>Failed and reversed transactions are excluded from totals but still listed for your records.</li>
          <li>The balance beside each row is the account balance after that transaction.</li>
          <li>Exports include the reference, channel and counterparty so you can reconcile offline.</li>
        </ul>
      </SectionCard>

    </div>
  )
}
