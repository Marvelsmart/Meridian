import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { formatAccountNumber, formatCurrency, maskAccountNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Avatar, Badge, Button, Card, Input, Select, StepIndicator, Textarea } from '@/components/ui'
import { AccountSelect, AmountInput, DeviceValidationModal, ProcessingPanel, ReviewList, SuccessPanel } from '@/components/banking'
import { PROCESSING_STEPS, TRANSFER_STEPS, useTransferFlow } from './useTransferFlow'

const NARRATION_CHIPS = ['Rent', 'School fees', 'Family support', 'Project payment', 'Refund', 'Shopping']
export default function Transfer() {
  useDocumentTitle('Send money')
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const [pinDevicePromptOpen, setPinDevicePromptOpen] = useState(false)
  const { accounts, activeAccount, actions } = useAppData()
  const { session, markDeviceValidated } = useAuth()

  const flow = useTransferFlow({ accounts, activeAccount, actions, searchParams: params, deviceValidated: session?.deviceValidated, onDeviceValidated: markDeviceValidated })

  useEffect(() => {
    if (flow.step === 'confirm' && session?.deviceValidated === false) setPinDevicePromptOpen(true)
  }, [flow.step, session?.deviceValidated])

  const submit = async () => {
    const transaction = await flow.submitTransfer()
    if (transaction) {
      toast.success('Transfer completed successfully', `${formatCurrency(transaction.amount)} sent to ${flow.recipient.name}.`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Send money</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Enter the recipient account details, then review them before submitting your transfer.
        </p>
      </div>

      {flow.step !== 'success' ? (
        <Card>
          <StepIndicator
            steps={TRANSFER_STEPS}
            current={Math.max(0, flow.stepIndex)}
            onStepClick={(index) => flow.setStep(TRANSFER_STEPS[index].value)}
          />
        </Card>
      ) : null}

      {flow.error && flow.step !== 'success' ? (
        <Alert tone="danger" icon={AlertCircle} title="Please check the details">
          {flow.error}
        </Alert>
      ) : null}

      {flow.step === 'recipient' ? (
        <div className="space-y-4">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Input label="Account name" value={flow.form.name} onChange={(event) => { flow.setForm({ ...flow.form, name: event.target.value }); flow.setRecipient(null) }} error={flow.formErrors.name} autoComplete="off" required />
            <Input label="Bank name" value={flow.form.bank} onChange={(event) => { flow.setForm({ ...flow.form, bank: event.target.value }); flow.setRecipient(null) }} error={flow.formErrors.bank} autoComplete="off" required />
            <Input label="Routing number" inputMode="numeric" value={flow.form.routingNumber} onChange={(event) => { flow.setForm({ ...flow.form, routingNumber: event.target.value.replace(/\D/g, '').slice(0, 9) }); flow.setRecipient(null) }} error={flow.formErrors.routingNumber} required />
            <Input label="Sorting code" inputMode="numeric" value={flow.form.sortingCode} onChange={(event) => { flow.setForm({ ...flow.form, sortingCode: event.target.value.replace(/\D/g, '').slice(0, 8) }); flow.setRecipient(null) }} error={flow.formErrors.sortingCode} required />
            <Input label="Account number" value={flow.form.accountNumber} onChange={(event) => { flow.setForm({ ...flow.form, accountNumber: event.target.value.trim().slice(0, 34) }); flow.setRecipient(null) }} error={flow.formErrors.accountNumber} autoComplete="off" required />
            <Select label="Account type" value={flow.form.accountType} onChange={(event) => { flow.setForm({ ...flow.form, accountType: event.target.value }); flow.setRecipient(null) }} error={flow.formErrors.accountType} required>
              <option value="">Choose account type</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </Select>
          </Card>

          <Card>
            <AccountSelect accounts={accounts} value={flow.accountId} onChange={flow.setAccountId} label="Send from" />
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => navigate('/app/dashboard')}>
              Cancel
            </Button>
            <Button onClick={flow.goNext} disabled={!flow.recipientDetailsValid}>
              Continue
            </Button>
          </div>

        </div>
      ) : null}


      {flow.step === 'amount' ? (
        <Card className="space-y-5">
          <AmountInput
            label="How much are you sending?"
            value={flow.amount}
            onChange={flow.setAmount}
            presets={[5000, 10000, 25000, 50000, 100000]}
            available={flow.selectedAccount?.available}
            hint={`Single transfer limit: ${formatCurrency(flow.selectedAccount?.limits?.singleTransfer ?? 0)}`}
            autoFocus
          />

          <ReviewList
            rows={[
              { label: 'From', value: flow.selectedAccount?.name ?? '—' },
              {
                label: 'To',
                value: `${flow.recipient?.name ?? '—'} · ${maskAccountNumber(flow.recipient?.accountNumber)}`,
              },
              { label: 'Transfer fee', value: flow.fee ? formatCurrency(flow.fee) : 'Free' },
              { label: 'Total debit', value: formatCurrency(flow.total) },
            ]}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={flow.goBack}>
              Back
            </Button>
            <Button onClick={flow.goNext} disabled={!flow.amount}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {flow.step === 'description' ? (
        <Card className="space-y-5">
          <Textarea
            label="What is this transfer for?"
            placeholder="e.g. Rent for February"
            value={flow.narration}
            onChange={(event) => flow.setNarration(event.target.value)}
            hint="This appears on your statement and the recipient’s alert."
            required
          />

          <div className="flex flex-wrap gap-2">
            {NARRATION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => flow.setNarration(chip)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
                  flow.narration === chip
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50',
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={flow.goBack}>
              Back
            </Button>
            <Button onClick={flow.goNext} disabled={!flow.narration.trim()}>
              Review transfer
            </Button>
          </div>
        </Card>
      ) : null}

      {flow.step === 'review' ? (
        <div className="space-y-4">
          <Card className="space-y-5">
            <div className="flex items-start gap-3 rounded-card bg-ink-50 p-4">
              <Avatar name={flow.recipient?.name ?? ''} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink-900">{flow.recipient?.name}</p>
                <p className="amount text-[12.5px] text-ink-500">
                  {flow.recipient?.bank} · {formatAccountNumber(flow.recipient?.accountNumber ?? '')}
                </p>
              </div>
              <span className="ml-auto text-right">
                <span className="amount block text-[16px] font-semibold text-ink-900">
                  {formatCurrency(flow.amountValue)}
                </span>
                <Badge tone="brand">{flow.narration}</Badge>
              </span>
            </div>

            <ReviewList
              title="Transfer summary"
              rows={[
                { label: 'From account', value: flow.selectedAccount?.name ?? '—' },
                { label: 'Available balance', value: formatCurrency(flow.selectedAccount?.available ?? 0) },
                { label: 'Amount', value: formatCurrency(flow.amountValue) },
                { label: 'Fee', value: flow.fee ? formatCurrency(flow.fee) : 'Free' },
                { label: 'Total debit', value: formatCurrency(flow.total) },
                { label: 'Description', value: flow.narration },
                { label: 'Routing number', value: flow.recipient?.routingNumber },
                { label: 'Sorting code', value: flow.recipient?.sortingCode },
                { label: 'Account type', value: flow.recipient?.accountType },
              ]}
            />

            <p className="text-[12.5px] leading-5 text-ink-500">
              Please confirm these details. Transfers cannot be cancelled once they are sent — you would need to contact
              support to request a reversal.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" onClick={flow.goBack}>
                Back
              </Button>
              <Button onClick={flow.beginAuthorization}>Confirm and continue</Button>
            </div>
          </Card>
        </div>
      ) : null}

      {flow.step === 'confirm' ? (
        <Card className="space-y-5">
          <div className="text-center">
            <p className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-ink-500">You are sending</p>
            <p className="amount mt-1 text-[26px] font-semibold text-ink-900">{formatCurrency(flow.amountValue)}</p>
            <p className="mt-1 text-[13px] text-ink-600">
              to {flow.recipient?.name} · {flow.recipient?.bank}
            </p>
          </div>

          {session?.deviceValidated === false ? (
            <div className="space-y-2 rounded-card border border-warning-200 bg-warning-50 p-3.5 text-[12.5px] leading-5 text-warning-800">
              <p className="font-semibold">PIN required due to new device</p>
              <p>Your PIN will verify this device before the transfer. Never share your PIN with customer care.</p>
            </div>
          ) : null}
          <Input
            label="Transaction PIN"
            type="password"
            inputMode="numeric"
            placeholder="Enter your 4-digit PIN"
            value={flow.pin}
            maxLength={4}
            onChange={(event) => flow.setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            hint="Your PIN is verified securely and is never saved with transaction details."
            autoFocus
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={flow.goBack} disabled={flow.pin.length > 0}>
              Back
            </Button>
            <Button onClick={submit} disabled={flow.pin.length !== 4}>
              Send {formatCurrency(flow.amountValue)}
            </Button>
          </div>
        </Card>
      ) : null}

      {flow.step === 'processing' ? (
        <Card>
          <ProcessingPanel
            title="Sending your transfer"
            steps={PROCESSING_STEPS}
            activeIndex={flow.processingIndex}
            message="Do not close this screen — we are confirming the payment with the beneficiary bank."
          />
        </Card>
      ) : null}

      {flow.step === 'success' && flow.result ? (
        <Card>
          <SuccessPanel
            title="Transfer completed successfully"
            message={`${formatCurrency(flow.result.amount)} was sent to ${flow.recipient?.name}.`}
            rows={[
              { label: 'Recipient', value: flow.recipient?.name },
              { label: 'Bank', value: flow.recipient?.bank },
              { label: 'Account number', value: formatAccountNumber(flow.recipient?.accountNumber ?? ''), mono: true },
              { label: 'Amount', value: formatCurrency(flow.result.amount) },
              { label: 'Fee', value: formatCurrency(flow.result.fee) },
              { label: 'Reference', value: flow.result.reference, mono: true },
              { label: 'Date', value: new Date(flow.result.date).toLocaleString('en-GB') },
            ]}
            secondaryAction="Send another"
            onSecondary={flow.resetFlow}
            primaryAction="View transaction"
            onPrimary={() => navigate(`/app/transactions/${flow.result.id}`)}
          />
        </Card>
      ) : null}


      <DeviceValidationModal open={flow.deviceBlocked} onClose={() => flow.setDeviceBlocked(false)} />
      <DeviceValidationModal
        open={pinDevicePromptOpen}
        onClose={() => setPinDevicePromptOpen(false)}
        title="PIN required due to new device"
        message="Your transaction PIN will verify this device before the transfer. If you do not recognize this sign-in, contact customer care. You can change or reset your PIN in Security."
      />
    </div>
  )
}
