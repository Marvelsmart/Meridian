import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { CATEGORY_META } from '@/lib/constants'
import { CategoryIcon } from './CategoryIcon'

const SLICE_COLORS = ['#243fe0', '#121822', '#10b981', '#f59e0b', '#f43f5e', '#97a2b3']

/**
 * Category breakdown: donut + ranked legend. Only rendered when there is
 * spending to explain — charts are never decoration here.
 */
export function SpendingSummary({ data = [], total = 0, loading = false, className = '' }) {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-6', className)}>
        <div className="size-36 animate-pulse rounded-full bg-ink-100" />
        <div className="flex-1 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-3.5 animate-pulse rounded bg-ink-100" />
          ))}
        </div>
      </div>
    )
  }

  const slices = data.slice(0, 5)
  const remainder = data.slice(5)
  const remainderTotal = remainder.reduce((sum, item) => sum + item.amount, 0)
  const chartData = remainderTotal
    ? [...slices, { category: 'other', label: 'Other', amount: remainderTotal, percent: (remainderTotal / total) * 100 }]
    : slices

  return (
    <div className={cn('flex flex-col gap-5 sm:flex-row sm:items-center', className)}>
      <div className="relative mx-auto size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="label"
              innerRadius={54}
              outerRadius={76}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.category} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const entry = payload[0]
                return (
                  <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-pop">
                    <p className="text-[11.5px] font-semibold text-ink-900">{entry.name}</p>
                    <p className="amount mt-0.5 text-[11.5px] text-ink-600">{formatCurrency(entry.value)}</p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-medium text-ink-500">Total spend</p>
          <p className="amount text-[15px] font-semibold text-ink-900">{formatCurrency(total)}</p>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1">
        {chartData.map((item, index) => (
          <li key={item.category} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-50">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-800">
              {CATEGORY_META[item.category]?.label ?? item.label}
            </span>
            <span className="amount text-[12.5px] font-semibold text-ink-900">{formatCurrency(item.amount)}</span>
            <span className="w-11 text-right text-[11.5px] text-ink-500">{item.percent.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
