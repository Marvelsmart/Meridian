import { ShieldAlert } from 'lucide-react'
import { Button, Modal } from '@/components/ui'

export function DeviceValidationModal({ open, onClose, title = 'New device identified', message = 'This is a new device. Your transaction PIN will verify it before your first transfer. If you do not recognize this sign-in, contact customer care.' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" closeOnBackdrop={false}>
      <div className="space-y-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-warning-50 text-warning-600"><ShieldAlert className="size-5" aria-hidden="true" /></div>
        <p className="text-[13.5px] leading-6 text-ink-600">{message}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" fullWidth onClick={() => window.dispatchEvent(new Event('northstar:open-support-chat'))}>Contact Customer Care</Button>
          <Button to="/app/security" fullWidth onClick={onClose}>Change or reset PIN</Button>
        </div>
      </div>
    </Modal>
  )
}