import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

/** 14-day in / out flow. Two restrained series, no gradients-heavy styling. */
export function MoneyFlowChart({ data = [], height = 220, className = '' }) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="creditFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#243fe0" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#243fe0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef0f4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6d7a8c' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6d7a8c' }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value) => formatCompact(value)}
          />
          <Tooltip
            cursor={{ stroke: '#c6cdd9', strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-pop">
                  <p className="text-[11.5px] font-semibold text-ink-900">{label}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} className="mt-1 flex items-center gap-2 text-[11.5px] text-ink-600">
                      <span className="size-2 rounded-full" style={{ background: entry.stroke }} />
                      {entry.name === 'credits' ? 'Money in' : 'Money out'}
                      <span className="amount font-semibold text-ink-900">{formatCurrency(entry.value)}</span>
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="credits"
            stroke="#243fe0"
            strokeWidth={2}
            fill="url(#creditFill)"
            name="credits"
          />
          <Area
            type="monotone"
            dataKey="debits"
            stroke="#97a2b3"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="transparent"
            name="debits"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
