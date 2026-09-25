import { ShieldAlert } from 'lucide-react'
import { buildWhatsAppSupportLink, isWhatsAppSupportConfigured } from '@/config/support'
import { Button, Modal } from '@/components/ui'

export function DeviceValidationModal({ open, onClose }) {
  const supportLink = buildWhatsAppSupportLink({ message: 'Hello Northstar support, I need to validate a new device.' })
  return (
    <Modal open={open} onClose={onClose} title="New device identified" size="sm" closeOnBackdrop={false}>
      <div className="space-y-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-warning-50 text-warning-600"><ShieldAlert className="size-5" aria-hidden="true" /></div>
        <p className="text-[13.5px] leading-6 text-ink-600">Contact customer care to validate device.</p>
        {isWhatsAppSupportConfigured() ? <Button fullWidth onClick={() => window.open(supportLink, '_blank', 'noopener,noreferrer')}>Contact Customer Care</Button> : <p className="text-[12.5px] text-ink-500">Customer care contact details are not configured for this demo.</p>}
      </div>
    </Modal>
  )
}