import { ShieldAlert } from 'lucide-react'
import { Button, Modal } from '@/components/ui'

export function DeviceValidationModal({ open, onClose, title = 'New device identified', message = 'This is a new device. If you do not recognize this sign-in, contact customer care.' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" closeOnBackdrop={false}>
      <div className="space-y-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-warning-50 text-warning-600"><ShieldAlert className="size-5" aria-hidden="true" /></div>
        <p className="text-[13.5px] leading-6 text-ink-600">{message}</p>
        <Button variant="secondary" fullWidth onClick={() => {
          onClose?.()
          window.dispatchEvent(new Event('northstar:open-support-chat'))
        }}>Contact Customer Care</Button>
      </div>
    </Modal>
  )
}