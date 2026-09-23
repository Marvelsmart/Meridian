import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useEscapeKey, useScrollLock } from '@/hooks/useOnClickOutside'
import { Button, IconButton } from './Button'

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

/**
 * Centered dialog on desktop, bottom sheet on mobile — one consistent overlay
 * primitive for every flow, form and confirmation in the app.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
  bodyClassName = '',
}) {
  useEscapeKey(onClose, open)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/45 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-pop animate-rise sm:rounded-card',
          SIZES[size] ?? SIZES.md,
          className,
        )}
      >
        {title ? (
          <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink-900">{title}</h2>
              {description ? <p className="mt-0.5 text-[13px] leading-5 text-ink-500">{description}</p> : null}
            </div>
            <IconButton label="Close" icon={X} size="sm" onClick={onClose} className="-mr-1 -mt-0.5" />
          </header>
        ) : null}

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-5', bodyClassName)}>{children}</div>

        {footer ? (
          <footer className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

const DRAWER_SIDES = {
  right: 'right-0 top-0 h-full w-full max-w-md animate-slide-in-right border-l',
  left: 'left-0 top-0 h-full w-full max-w-sm border-r',
  bottom: 'bottom-0 left-0 w-full max-h-[88vh] rounded-t-2xl border-t animate-rise',
}

export function Drawer({ open, onClose, side = 'right', title, description, children, footer = null, className = '' }) {
  useEscapeKey(onClose, open)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'absolute flex flex-col overflow-hidden border-ink-200 bg-white shadow-pop animate-fade-in',
          DRAWER_SIDES[side] ?? DRAWER_SIDES.right,
          className,
        )}
      >
        {title ? (
          <header className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink-900">{title}</h2>
              {description ? <p className="mt-0.5 text-[13px] text-ink-500">{description}</p> : null}
            </div>
            <IconButton label="Close" icon={X} size="sm" onClick={onClose} />
          </header>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <footer className="border-t border-ink-100 bg-ink-50/60 px-5 py-4 safe-bottom">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

const CONFIRM_TONES = {
  danger: { wrapper: 'bg-danger-50 text-danger-600', confirmVariant: 'danger' },
  warning: { wrapper: 'bg-warning-50 text-warning-600', confirmVariant: 'primary' },
  brand: { wrapper: 'bg-brand-50 text-brand-700', confirmVariant: 'primary' },
}

/** Yes/no dialog with a loading state on the confirm button. */
export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon: Icon = null,
  loading = false,
}) {
  const toneStyles = CONFIRM_TONES[tone] ?? CONFIRM_TONES.brand

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      size="sm"
      closeOnBackdrop={!loading}
      className="sm:max-w-md"
    >
      <div className="flex flex-col items-start">
        {Icon ? (
          <span className={cn('flex size-11 items-center justify-center rounded-full', toneStyles.wrapper)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
        <h2 className="mt-4 text-base font-semibold text-ink-900">{title}</h2>
        <p className="mt-1.5 text-[13px] leading-5 text-ink-500">{description}</p>

        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading} fullWidth className="sm:w-auto">
            {cancelLabel}
          </Button>
          <Button variant={toneStyles.confirmVariant} onClick={onConfirm} loading={loading} fullWidth className="sm:w-auto">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
