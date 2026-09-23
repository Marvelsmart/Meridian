import { Eye, EyeOff, Lock, Nfc, Snowflake } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CARD_STATUS_META } from '@/data/cards'
import { formatCardExpiry, formatCardNumber } from '@/lib/format'
import { IconButton } from '@/components/ui'

const SURFACES = {
  ink: 'bg-ink-900',
  brand: 'bg-brand-700',
  slate: 'bg-ink-600',
}

/** Simulated card face — invented numbers only, never real card data. */
export function CardVisual({ card, revealed = false, onToggleReveal = null, className = '', compact = false }) {
  const meta = CARD_STATUS_META[card.status] ?? CARD_STATUS_META.active
  const frozen = card.status === 'frozen'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card p-5 text-white shadow-pop',
        SURFACES[card.color] ?? SURFACES.ink,
        compact ? 'h-[168px]' : 'h-[200px]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -bottom-16 size-48 rounded-full bg-white/5 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-white/60">{card.nickname}</p>
          <p className="mt-0.5 text-[13px] font-semibold">{card.type} card</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', meta.className)}>{meta.label}</span>
          {onToggleReveal ? (
            <IconButton
              label={revealed ? 'Hide card details' : 'Show card details'}
              icon={revealed ? EyeOff : Eye}
              size="sm"
              onClick={onToggleReveal}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            />
          ) : null}
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <span className="flex h-7 w-10 items-center justify-center rounded-md bg-gradient-to-br from-white/85 to-white/50">
          <span className="h-4 w-6 rounded-sm bg-white/40" />
        </span>
        {card.contactless ? <Nfc className="size-4 text-white/70" aria-hidden="true" /> : null}
      </div>

      <p className="relative mt-4 text-[17px] font-medium tracking-[0.14em]">
        {revealed ? formatCardNumber(card.number) : card.maskedNumber}
      </p>

      <div className="relative mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-white/50">Card holder</p>
          <p className="truncate text-[12.5px] font-medium">{card.holderName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-white/50">Expires</p>
          <p className="text-[12.5px] font-medium">{formatCardExpiry(card.expiry)}</p>
        </div>
        {revealed ? (
          <div className="text-right">
            <p className="text-[10.5px] uppercase tracking-[0.1em] text-white/50">CVV</p>
            <p className="text-[12.5px] font-medium">{card.cvv}</p>
          </div>
        ) : null}
        <p className="text-[15px] font-semibold italic tracking-tight">{card.brand}</p>
      </div>

      {frozen ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/55 backdrop-blur-[1px]">
          <Snowflake className="size-6" aria-hidden="true" />
          <p className="text-[13px] font-semibold">Card frozen</p>
          <p className="flex items-center gap-1 text-[11.5px] text-white/70">
            <Lock className="size-3" aria-hidden="true" />
            Payments are blocked
          </p>
        </div>
      ) : null}
    </div>
  )
}
