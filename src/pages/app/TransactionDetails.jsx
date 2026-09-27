import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock3, Download, Flag, Repeat, SearchX, XCircle } from 'lucide-react'
import * as api from '@/lib/api'
import {
  CATEGORY_META,
  TRANSACTION_CHANNELS,
  paymentMethodLabel,
  transactionStatusLabel,
  transactionTypeLabel,
} from '@/lib/constants'
import {
  formatClockTime,
  formatCurrency,
  formatLongDate,
  formatTime,
  maskAccountNumber,
  toDate,
} from '@/lib/format'
import { downloadFile } from '@/lib/download'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Card, DescriptionList, DetailRow, SectionCard } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/ui/States'
import { CategoryIcon, ReferenceChip, TransactionStatus } from '@/components/banking'

/**
 * Builds the progress timeline from whatever the transaction actually carries.
 * Every branch is defensive: a missing or unparsable date, an unknown status or
 * an absent counterparty must never blank the screen.
 */
function timelineFor(transaction) {
  const created = toDate(transaction?.date)
  const hasDate = !Number.isNaN(created.getTime())
  const settled = hasDate ? new Date(created.getTime() + 12000) : null
  const base = [
    {
      label: 'Initiated',
      description: hasDate ? `Request received at ${formatTime(created)}` : 'Request received',
      state: 'done',
    },
    { label: 'Processing', description: 'Sent to the payment network', state: 'done' },
  ]
  if (transaction?.status === 'successful') {
    return [...base, { label: 'Completed', description: settled ? `Settled at ${formatTime(settled)}` : 'Settled', state: 'done' }]
  }
  if (transaction?.status === 'pending') {
    return [...base, { label: 'Pending review', description: 'Waiting for the beneficiary bank to confirm', state: 'current' }]
  }
  if (transaction?.status === 'failed') {
    return [base[0], { label: 'Failed', description: 'Rejected by the beneficiary bank. No funds left your account.', state: 'failed' }]
  }
  return [...base, { label: 'Reversed', description: 'Funds returned to your account', state: 'reversed' }]
}

/** Resolves the account a transaction belongs to (null when it is unknown). */
function useTransactionAccount(transaction) {
  const { accounts } = useAppData()
  if (!transaction?.accountId) return null
  return accounts.find((account) => account.id === transaction.accountId) ?? null
}

function accountLabel(account) {
  if (!account) return 'Account unavailable'
  const digits = String(account.number ?? '').replace(/\D/g, '')
  return digits.length >= 4 ? `${account.name} •••• ${digits.slice(-4)}` : account.name
}

export default function TransactionDetails() {
  const { transactionId } = useParams()
  const toast = useToast()
  const { data: transaction, loading, error, refetch } = useAsync(
    () => api.fetchTransaction(transactionId),
    [transactionId],
  )
  const account = useTransactionAccount(transaction)

  useDocumentTitle(transaction ? 'Transaction details' : 'Transaction')

  const downloadReceipt = useCallback(() => {
    if (!transaction) return
    const reference = transaction.reference ?? transaction.id ?? 'receipt'
    const fee = Number(transaction.fee ?? 0)
    const lines = [
      'Northstar — transaction receipt',
      `Description,${transaction.description ?? ''}`,
      `Transaction ID,${transaction.id ?? ''}`,
      `Reference,${reference}`,
      `Date,${formatLongDate(transaction.date)}`,
      `Time,${formatClockTime(transaction.date)}`,
      `Type,${transactionTypeLabel(transaction)}`,
      `Direction,${transaction.type === 'credit' ? 'Money in' : 'Money out'}`,
      `Amount,${Number(transaction.amount ?? 0).toFixed(2)}`,
      `Fee,${fee.toFixed(2)}`,
      `Status,${transactionStatusLabel(transaction.status)}`,
      `Counterparty,${transaction.counterparty?.name ?? ''}`,
      `Bank,${transaction.counterparty?.bank ?? ''}`,
      `Category,${CATEGORY_META[transaction.category]?.label ?? transaction.category ?? ''}`,
      `Payment method,${paymentMethodLabel(transaction)}`,
      `Channel,${TRANSACTION_CHANNELS[transaction.channel] ?? transaction.channel ?? ''}`,
      `Account,${account ? accountLabel(account) : ''}`,
      `Balance after,${Number(transaction.balanceAfter ?? 0).toFixed(2)}`,
    ]
    downloadFile({
      content: lines.join('\n'),
      filename: `northstar-receipt-${reference}.csv`,
      mimeType: 'text/csv',
    })
    toast.success('Receipt downloaded', `${reference} saved as CSV.`)
  }, [account, transaction, toast])

  if (loading) {
    return (
      <Card>
        <LoadingState label="Loading transaction" />
      </Card>
    )
  }

  if (error || !transaction) {
    // Not-found is a normal outcome: show a proper state (never a blank screen)
    // and a way back to the history that both cases can use.
    const notFound = !error || error.code === 'not_found'
    return (
      <div className="space-y-4">
        <Card>
          {notFound ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                <SearchX className="size-5" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-[16px] font-semibold text-ink-900">Transaction Not Found</h1>
              <p className="mt-1.5 max-w-md text-[13px] leading-5 text-ink-500">
                We couldn&apos;t find the transaction you&apos;re looking for. It may have been removed, or the link is
                incomplete.
              </p>
            </div>
          ) : (
            <ErrorState
              title="We could not load that transaction"
              description={error?.message ?? 'Please try again in a moment.'}
              onRetry={refetch}
            />
          )}
          <div className="flex flex-col justify-center gap-2 pb-5 sm:flex-row">
            <Button variant="secondary" to="/app/transactions">
              Back to transactions
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const isCredit = transaction.type === 'credit'
  const timeline = timelineFor(transaction)
  const fee = Number(transaction.fee ?? 0)
  const amount = Number(transaction.amount ?? 0)
  const counterpartyName = transaction.counterparty?.name ?? null

  return (
    <div className="space-y-5">
      <Link to="/app/transactions" className="text-[12.5px] font-medium text-ink-500 transition hover:text-ink-900">
        ← Back to transactions
      </Link>

      <Card>
        <div className="flex flex-col items-center py-2 text-center">
          <CategoryIcon category={transaction.category} size="lg" />
          <p className="amount mt-4 text-[26px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[30px]">
            {isCredit ? '+' : '−'}
            {formatCurrency(amount)}
          </p>
          <p className="mt-1.5 text-[13.5px] text-ink-600">{transaction.description ?? transactionTypeLabel(transaction)}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <TransactionStatus status={transaction.status} />
            {transaction.reference ? <ReferenceChip reference={transaction.reference} /> : null}
          </div>
          <p className="mt-3 text-[12.5px] text-ink-400">
            {formatLongDate(transaction.date)} · {formatClockTime(transaction.date)}
          </p>
        </div>

        {transaction.status === 'failed' ? (
          <Alert tone="danger" icon={XCircle} title="This payment did not go through" className="mt-4">
            {formatCurrency(amount)} was not debited. You can try again if you still need to send it.
          </Alert>
        ) : null}
        {transaction.status === 'pending' ? (
          <Alert tone="warning" icon={Clock3} title="Pending review" className="mt-4">
            The beneficiary bank is still confirming this payment. Most pending transfers settle within 30 minutes.
          </Alert>
        ) : null}
        {transaction.status === 'reversed' ? (
          <Alert tone="info" icon={Repeat} title="Reversed" className="mt-4">
            The amount was returned to your account. Reversals normally complete within 24 hours.
          </Alert>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Transaction details">
          <DescriptionList>
            <DetailRow label="Merchant" value={counterpartyName ?? transaction.description ?? '—'} />
            <DetailRow label="Transaction type" value={transactionTypeLabel(transaction)} />
            <DetailRow
              label="Category"
              value={CATEGORY_META[transaction.category]?.label ?? transaction.category ?? '—'}
            />
            <DetailRow label="Direction" value={isCredit ? 'Money in' : 'Money out'} />
            <DetailRow label="Amount" value={formatCurrency(amount)} />
            <DetailRow label="Fee" value={fee ? formatCurrency(fee) : 'No fee'} />
            {fee ? <DetailRow label="Total" value={formatCurrency(isCredit ? amount - fee : amount + fee)} /> : null}
            <DetailRow label="Payment method" value={paymentMethodLabel(transaction)} />
            <DetailRow
              label="Channel"
              value={TRANSACTION_CHANNELS[transaction.channel] ?? transaction.channel ?? '—'}
            />
            <DetailRow label="Account" value={accountLabel(account)} />
            <DetailRow label="Status" value={transactionStatusLabel(transaction.status)} />
            <DetailRow label="Transaction ID" value={transaction.id ?? '—'} mono />
            <DetailRow label="Reference" value={transaction.reference ?? '—'} mono />
            <DetailRow label="Date" value={formatLongDate(transaction.date)} />
            <DetailRow label="Time" value={formatClockTime(transaction.date)} />
            {transaction.balanceAfter !== undefined && transaction.balanceAfter !== null ? (
              <DetailRow label="Balance after" value={formatCurrency(transaction.balanceAfter)} />
            ) : null}
          </DescriptionList>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Counterparty" description="Who this transaction moved money to or from">
            <DescriptionList>
              <DetailRow label="Name" value={counterpartyName ?? '—'} />
              {transaction.description ? <DetailRow label="Description" value={transaction.description} /> : null}
              {transaction.counterparty?.bank ? <DetailRow label="Bank" value={transaction.counterparty.bank} /> : null}
              {transaction.counterparty?.accountNumber ? (
                <DetailRow
                  label="Account number"
                  value={maskAccountNumber(transaction.counterparty.accountNumber)}
                  mono
                />
              ) : null}
              {transaction.narration ? <DetailRow label="Narration" value={transaction.narration} /> : null}
              {transaction.meta?.provider ? <DetailRow label="Provider" value={transaction.meta.provider} /> : null}
              {transaction.meta?.customerRef ? <DetailRow label="Customer ref" value={transaction.meta.customerRef} mono /> : null}
              {transaction.meta?.phone ? <DetailRow label="Phone number" value={transaction.meta.phone} /> : null}
              {transaction.meta?.planLabel ? <DetailRow label="Bundle" value={transaction.meta.planLabel} /> : null}
              {transaction.cardId ? <DetailRow label="Card" value={`Ending ${String(transaction.cardId).slice(-2)}••`} /> : null}
            </DescriptionList>
          </SectionCard>

          <SectionCard title="Progress" description="How this transaction moved through the rails">
            <ol className="space-y-4">
              {timeline.map((step) => (
                <li key={step.label} className="flex gap-3">
                  <span
                    className={
                      step.state === 'done'
                        ? 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success-500 text-white'
                        : step.state === 'current'
                          ? 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-warning-500'
                          : step.state === 'failed'
                            ? 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white'
                            : 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-400 text-white'
                    }
                  >
                    <span className="size-2 rounded-full bg-white" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">{step.label}</p>
                    <p className="text-[12.5px] text-ink-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Actions">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                fullWidth
                icon={Download}
                onClick={downloadReceipt}
              >
                Download receipt
              </Button>
              {transaction.counterparty?.accountNumber && transaction.type === 'debit' ? (
                <Button
                  fullWidth
                  icon={Repeat}
                  to={`/app/transfer?account=${transaction.counterparty.accountNumber}&name=${encodeURIComponent(
                    transaction.counterparty.name ?? '',
                  )}&amount=${transaction.amount}`}
                >
                  Send again
                </Button>
              ) : null}
            </div>
            <Button
              variant="ghost"
              className="mt-2"
              icon={Flag}
              onClick={() =>
                toast.info(
                  'Report submitted',
                  'Our support team will review this transaction and respond within 24 hours.',
                )
              }
            >
              Report a problem with this transaction
            </Button>
          </SectionCard>
        </div>
      </div>

    </div>
  )
}
