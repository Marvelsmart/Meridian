import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NETWORKS } from '@/lib/constants'
import { Input } from '@/components/ui'

/** U.S. mobile carrier selector. */
export function NetworkSelector({ value, onChange, error = null, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-[13px] font-medium text-ink-700">Network</span>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Network">
        {NETWORKS.map((network) => {
          const active = value === network.id
          return (
            <button
              key={network.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange?.(network.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-card border px-2 py-3 transition',
                active ? 'border-brand-600 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              <span
                className="flex size-8 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: network.color, color: network.textOnColor }}
              >
                {network.name.slice(0, 2)}
              </span>
              <span className="text-[12px] font-medium text-ink-800">{network.name}</span>
            </button>
          )
        })}
      </div>
      {error ? <p className="text-[12.5px] font-medium text-danger-600">{error}</p> : null}
    </div>
  )
}

/** Searchable biller list grouped visually by abbreviation tile. */
export function ProviderPicker({ providers = [], value, onChange, className = '', searchPlaceholder = 'Search billers' }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return providers
    return providers.filter((provider) => provider.name.toLowerCase().includes(term) || provider.short.toLowerCase().includes(term))
  }, [providers, query])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {providers.length > 5 ? (
        <Input
          leftIcon={Search}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={searchPlaceholder}
        />
      ) : null}

      <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((provider) => {
          const active = provider.id === value
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onChange?.(provider.id)}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-3 rounded-card border p-3 text-left transition',
                active ? 'border-brand-600 bg-brand-50/50' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                style={{ background: provider.color }}
              >
                {provider.abbreviation}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink-900">{provider.short}</span>
                <span className="block truncate text-[11.5px] text-ink-500">{provider.name}</span>
              </span>
              {active ? <Check className="size-4 shrink-0 text-brand-600" /> : null}
            </button>
          )
        })}
        {!filtered.length ? (
          <p className="col-span-full py-6 text-center text-[13px] text-ink-500">
            No billers match “{query}”. Try a different name.
          </p>
        ) : null}
      </div>
    </div>
  )
}
