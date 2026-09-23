import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  PiggyBank,
  ReceiptText,
  RotateCcw,
  Smartphone,
  TrendingUp,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { CATEGORY_META } from '@/lib/constants'

const ICONS = {
  transfer: ArrowLeftRight,
  income: TrendingUp,
  bills: ReceiptText,
  card: CreditCard,
  withdrawal: Banknote,
  savings: PiggyBank,
  refund: RotateCcw,
}

const TONE_CLASSES = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-brand-50 text-brand-600',
  ink: 'bg-ink-100 text-ink-700',
}

const SIZES = {
  sm: 'size-9 rounded-lg',
  md: 'size-10 rounded-xl',
  lg: 'size-12 rounded-xl',
}

/** Category glyph used by transaction rows, tables, receipts and detail pages. */
export function CategoryIcon({ category, size = 'md', className = '', tone = null }) {
  const Icon = ICONS[category] ?? ReceiptText
  const resolvedTone = tone ?? CATEGORY_META[category]?.tone ?? 'ink'
  return (
    <span className={cn('flex shrink-0 items-center justify-center', SIZES[size] ?? SIZES.md, TONE_CLASSES[resolvedTone] ?? TONE_CLASSES.ink, className)}>
      <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} aria-hidden="true" />
    </span>
  )
}

export function categoryLabel(category) {
  return CATEGORY_META[category]?.label ?? category
}
