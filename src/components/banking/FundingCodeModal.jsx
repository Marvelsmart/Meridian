import { useState } from 'react'
import { AlertCircle, LockKeyhole } from 'lucide-react'
import { Button, Input, Modal, Alert } from '@/components/ui'

export function FundingCodeModal({ open, onClose, onVerified }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)

  const verify = () => {
    if (code !== '5105') {
      setError('Verification code is incorrect.')
      return
    }
    setCode('')
    setError(null)
    onVerified()
  }

  return (
    <Modal open={open} onClose={onClose} title="Verify add money access" size="sm">
      <div className="space-y-4">
        {error ? <Alert tone="danger" icon={AlertCircle}>{error}</Alert> : null}
        <p className="text-[13.5px] leading-6 text-ink-600">Enter your verification code to continue to Add Money.</p>
        <Input
          label="Verification code"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 4)); setError(null) }}
          leftIcon={LockKeyhole}
          autoFocus
        />
        <Button fullWidth onClick={verify} disabled={code.length !== 4}>Continue</Button>
      </div>
    </Modal>
  )
}