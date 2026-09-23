import { useEffect, useState } from 'react'
import { Building2, CreditCard, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { formatCurrency } from '@/lib/format'
import { Alert, Button, Modal } from '@/components/ui'
import { AccountSelect } from './AccountSelect'
import { AmountInput } from './AmountInput'
import { SuccessPanel } from './FlowPanels'
import { useMoneyFlow } from './useMoneyFlow'

const PRESETS = [5000, 20000, 50000, 100000, 250000]

const METHODS = [
  { value: 'transfer', label: 'Bank transfer', description: 'Instant, no fee', icon: Building2 },
  { value: 'card', label: 'Debit card', description: '1.4% processing fee', icon: CreditCard },
]

/** Add money — fund an account by transfer or saved card. */
export function DepositDialog({ open, onClose }) {
  const { accounts, activeAccount, actions } = useAppData()
  const toast = useToast()
  const flow = useMoneyFlow(open)
  const [accountId, setAccountId] = useState(activeAccount?.id)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('transfer')

  useEffect(() => {
    if (open && activeAccount) setAccountId(activeAccount.id)
  }, [open, activeAccount])

  const submit = async () => {
    const response = await flow.run(() => actions.addMoney({ accountId, amount, method }))
    if (response) {
      toast.success('Money added', `${formatCurrency(Number(amount))} is now available in your account.`)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={flow.isSuccess ? undefined : 'Add money'}
      description={flow.isSuccess ? undefined : 'Fund your account by bank transfer or a saved card.'}
    >
      {flow.isForm ? (
        <div className="space-y-5">
          {flow.error ? (
            <Alert tone="danger" title="We could not add money">
              {flow.error.message}
            </Alert>
          ) : null}

          <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} label="Add money to" />

          <AmountInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            presets={PRESETS}
            error={flow.error?.fields?.amount}
            hint="Minimum top-up is $500. No fee on bank transfers."
          />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink-700">Funding method</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {METHODS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    className={cn(
                      'flex items-start gap-3 rounded-card border p-3.5 text-left transition',
                      method === option.value ? 'border-brand-600 bg-brand-50/50' : 'border-ink-200 hover:bg-ink-50',
                    )}
                  >
                    <Icon className="mt-0.5 size-4 text-ink-500" aria-hidden="true" />
                    <span>
                      <span className="block text-[13px] font-medium text-ink-900">{option.label}</span>
                      <span className="block text-[12px] text-ink-500">{option.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!amount}>
              Add money
            </Button>
          </div>
        </div>
      ) : null}

      {flow.isProcessing ? (
        <div className="flex flex-col items-center py-10">
          <Loader2 className="size-7 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-4 text-[13.5px] font-medium text-ink-800">Confirming your top-up…</p>
          <p className="mt-1 text-[12.5px] text-ink-500">This usually takes a few seconds.</p>
        </div>
      ) : null}

      {flow.isSuccess && flow.result ? (
        <SuccessPanel
          title="Money added successfully"
          message={`${formatCurrency(flow.result.amount)} is now available in your account.`}
          rows={[
            { label: 'Amount', value: formatCurrency(flow.result.amount) },
            { label: 'Method', value: flow.result.counterparty?.name ?? 'Bank transfer' },
            { label: 'Reference', value: flow.result.reference, mono: true },
            { label: 'New balance', value: formatCurrency(flow.result.balanceAfter ?? 0) },
          ]}
          primaryAction="Done"
          onPrimary={onClose}
        />
      ) : null}
    </Modal>
  )
}
