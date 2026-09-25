import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Check, Search, Star, UserPlus, Users } from 'lucide-react'
import { BANKS } from '@/data/banks'
import { formatAccountNumber, formatCurrency, maskAccountNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Avatar, Badge, Button, Card, Checkbox, EmptyState, Input, Modal, SectionCard, Select, StepIndicator, Tabs, Textarea } from '@/components/ui'
import { AccountSelect, AmountInput, BeneficiaryFormDialog, DeviceValidationModal, ProcessingPanel, ReviewList, SuccessPanel } from '@/components/banking'
import { PROCESSING_STEPS, TRANSFER_STEPS, useTransferFlow } from './useTransferFlow'

const NARRATION_CHIPS = ['Rent', 'School fees', 'Family support', 'Project payment', 'Refund', 'Shopping']
const BANK_OPTIONS = BANKS.map((bank) => ({ value: bank.code, label: bank.name }))

export default function Transfer() {
  useDocumentTitle('Send money')
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const { accounts, activeAccount, beneficiaries, actions } = useAppData()
  const beneficiaryDialog = useDisclosure(false)

  const flow = useTransferFlow({ accounts, activeAccount, actions, searchParams: params })
  const favourites = useMemo(
    () => [...beneficiaries].sort((a, b) => Number(b.favourite) - Number(a.favourite)),
    [beneficiaries],
  )

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
          Transfer to a saved beneficiary or any U.S. bank account. You review everything before it is sent.
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
          <Card padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-4">
              <Tabs
                variant="pill"
                value={flow.mode}
                onChange={flow.setMode}
                ariaLabel="Recipient type"
                items={[
                  { value: 'saved', label: 'Saved beneficiaries' },
                  { value: 'new', label: 'New recipient' },
                ]}
              />
              <Button variant="secondary" size="sm" icon={UserPlus} onClick={beneficiaryDialog.open}>
                Add beneficiary
              </Button>
            </div>

            <div className="p-4">{flow.mode === 'saved' ? (
                favourites.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {favourites.map((beneficiary) => {
                      const active = flow.recipient?.accountNumber === beneficiary.accountNumber
                      return (
                        <button
                          key={beneficiary.id}
                          type="button"
                          onClick={() => flow.setRecipient(beneficiary)}
                          className={cn(
                            'flex items-center gap-3 rounded-card border p-3.5 text-left transition',
                            active
                              ? 'border-brand-600 bg-brand-50/50'
                              : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
                          )}
                        >
                          <Avatar name={beneficiary.name} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13.5px] font-medium text-ink-900">
                                {beneficiary.name}
                              </span>
                              {beneficiary.favourite ? (
                                <Star className="size-3.5 shrink-0 fill-warning-500 text-warning-500" aria-hidden="true" />
                              ) : null}
                            </span>
                            <span className="amount block truncate text-[12px] text-ink-500">
                              {beneficiary.bank} · {maskAccountNumber(beneficiary.accountNumber)}
                            </span>
                          </span>
                          {active ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
                              <Check className="size-3 text-white" strokeWidth={3} />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No saved beneficiaries yet"
                    description="Add someone you pay often and they will appear here for one-tap transfers."
                    action={<Button onClick={beneficiaryDialog.open}>Add a beneficiary</Button>}
                    compact
                  />
                )
              ) : (
                <div className="space-y-4">
                  <Select
                    label="Bank"
                    value={flow.form.bankCode}
                    onChange={(event) => flow.setForm({ ...flow.form, bankCode: event.target.value })}
                    options={BANK_OPTIONS}
                    error={flow.formErrors.bankCode}
                    placeholder="Select a bank"
                    required
                  />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                      label="Account number"
                      inputMode="numeric"
                      placeholder="10-digit account number"
                      value={flow.form.accountNumber}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 10)
                        flow.setForm({ ...flow.form, accountNumber: digits })
                        flow.setRecipient(null)
                      }}
                      error={flow.formErrors.accountNumber}
                      required
                    />
                    <Button
                      variant="secondary"
                      className="shrink-0 sm:mb-0.5"
                      icon={Search}
                      loading={flow.resolving}
                      disabled={flow.form.accountNumber.length !== 10 || !flow.form.bankCode}
                      onClick={flow.resolveRecipient}
                    >
                      Resolve
                    </Button>
                  </div>

                  {flow.recipient ? (
                    <div className="flex items-center gap-3 rounded-card border border-success-100 bg-success-50 p-3.5">
                      <Avatar name={flow.recipient.name} size="sm" tone="success" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success-700">
                          <Check className="size-3.5" strokeWidth={3} />
                          {flow.recipient.name}
                        </p>
                        <p className="amount text-[12px] text-success-600">
                          {formatAccountNumber(flow.form.accountNumber)} · confirmed by name enquiry
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-ink-500">
                      Enter the account number and tap Resolve — we confirm the account name with the bank.
                    </p>
                  )}
                </div>
              )}</div>
          </Card>

          <Card>
            <AccountSelect accounts={accounts} value={flow.accountId} onChange={flow.setAccountId} label="Send from" />
          </Card>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => navigate('/app/dashboard')}>
              Cancel
            </Button>
            <Button onClick={flow.goNext} disabled={!flow.recipient}>
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

          <div className="flex items-center justify-between gap-2">
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

          {!flow.recipient?.id ? (
            <div className="space-y-3 rounded-card border border-ink-200 p-3.5">
              <Checkbox
                checked={flow.saveBeneficiary}
                onChange={flow.setSaveBeneficiary}
                label="Save this recipient for next time"
                description="They will be added to your beneficiaries as a favourite."
              />
              {flow.saveBeneficiary ? (
                <Input
                  label="Nickname"
                  placeholder="e.g. Landlord"
                  value={flow.nickname}
                  onChange={(event) => flow.setNickname(event.target.value)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
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
              ]}
            />

            <p className="text-[12.5px] leading-5 text-ink-500">
              Please confirm these details. Transfers cannot be cancelled once they are sent — you would need to contact
              support to request a reversal.
            </p>

            <div className="flex items-center justify-between gap-2">
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

          <Input
            label="Transaction PIN"
            type="password"
            inputMode="numeric"
            placeholder="Enter your 4-digit PIN"
            value={flow.pin}
            maxLength={4}
            onChange={(event) => flow.setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            hint="Demo environment — enter any 4 digits, e.g. 1234."
            autoFocus
          />

          <div className="flex items-center justify-between gap-2">
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


      <BeneficiaryFormDialog
        open={beneficiaryDialog.isOpen}
        onClose={beneficiaryDialog.close}
        onSaved={(saved) => {
          flow.setRecipient({ ...saved, bankCode: saved.bankCode })
          flow.setMode('saved')
        }}
      />
      <DeviceValidationModal open={flow.deviceBlocked} onClose={() => flow.setDeviceBlocked(false)} />
    </div>
  )
}
