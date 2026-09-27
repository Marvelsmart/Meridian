import { useEffect, useState } from 'react'
import { Banknote, Loader2 } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { formatCurrency } from '@/lib/format'
import { Alert, Button, Checkbox, Modal, Select } from '@/components/ui'
import { AccountSelect } from './AccountSelect'
import { AmountInput } from './AmountInput'
import { SuccessPanel } from './FlowPanels'
import { ReviewList } from './ReviewList'
import { useMoneyFlow } from './useMoneyFlow'

const PRESETS = [5000, 20000, 50000, 100000]
const LOCATIONS = ['Union Square', 'SoHo', 'Downtown Seattle', 'Midtown Manhattan', 'Civic Center', 'Harbor District']

/** Withdraw — generate an ATM approval code for the account holder. */
export function WithdrawDialog({ open, onClose }) {
  const { accounts, activeAccount, actions } = useAppData()
  const toast = useToast()
  const flow = useMoneyFlow(open)
  const [accountId, setAccountId] = useState(activeAccount?.id)
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState(LOCATIONS[0])
  const [charges, setCharges] = useState(true)

  useEffect(() => {
    if (open && activeAccount) setAccountId(activeAccount.id)
  }, [open, activeAccount])

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount
  const fee = charges ? 105 : 0
  const total = (Number(amount) || 0) + fee

  const submit = async () => {
    const response = await flow.run(() =>
      actions.withdraw({ accountId, amount, destination, fee: charges ? 105 : 0 }),
    )
    if (response) {
      toast.success('Withdrawal approved', `${formatCurrency(Number(amount))} is ready at ${destination}.`)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={flow.isSuccess ? undefined : 'Withdraw cash'}
      description={flow.isSuccess ? undefined : 'Generate an approval code for any Northstar ATM.'}
    >
      {flow.isForm ? (
        <div className="space-y-5">
          {flow.error ? (
            <Alert tone="danger" title="We could not process this withdrawal">
              {flow.error.message}
            </Alert>
          ) : null}

          <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} label="Withdraw from" />

          <AmountInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            presets={PRESETS}
            available={selectedAccount?.available}
            error={flow.error?.fields?.amount}
            hint="You will receive a code to authorise the withdrawal at the ATM."
          />

          <Select
            label="Preferred location"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            options={LOCATIONS.map((location) => ({ value: location, label: location }))}
            placeholder={null}
          />

          <Checkbox
            checked={charges}
            onChange={setCharges}
            label="Include standard ATM charge ($3.50)"
            description="Charged for withdrawals outside Northstar ATMs."
          />

          <ReviewList
            rows={[
              { label: 'Amount', value: formatCurrency(Number(amount) || 0) },
              { label: 'Charge', value: fee ? formatCurrency(fee) : 'Free' },
              { label: 'Total debit', value: formatCurrency(total) },
            ]}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!amount} icon={Banknote}>
              Confirm withdrawal
            </Button>
          </div>
        </div>
      ) : null}

      {flow.isProcessing ? (
        <div className="flex flex-col items-center py-10">
          <Loader2 className="size-7 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-4 text-[13.5px] font-medium text-ink-800">Approving your withdrawal…</p>
        </div>
      ) : null}

      {flow.isSuccess && flow.result ? (
        <SuccessPanel
          title="Withdrawal approved"
          message={`Collect your cash at ${destination} within 30 minutes.`}
          rows={[
            { label: 'Amount', value: formatCurrency(flow.result.amount) },
            { label: 'Charge', value: formatCurrency(flow.result.fee) },
            { label: 'Location', value: destination },
            { label: 'Withdrawal code', value: flow.result.reference.slice(-6).toUpperCase(), mono: true },
          ]}
          primaryAction="Done"
          onPrimary={onClose}
        />
      ) : null}
    </Modal>
  )
}
