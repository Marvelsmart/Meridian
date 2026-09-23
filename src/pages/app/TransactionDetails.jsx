import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock3, Download, Flag, Repeat, XCircle } from 'lucide-react'
import * as api from '@/lib/api'
import { CATEGORY_META, STATUS_META, TRANSACTION_CHANNELS } from '@/lib/constants'
import { formatCurrency, formatDateTime, formatTime } from '@/lib/format'
import { downloadFile } from '@/lib/download'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Card } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/ui/States'
import { CategoryIcon, ReferenceChip, TransactionStatus } from '@/components/banking'

function timelineFor(transaction) {
  const created = new Date(transaction.date)
  const settled = new Date(created.getTime() + 12000)
  const base = [
    { label: 'Initiated', description: `Request received at ${formatTime(created)}`, state: 'done' },
    { label: 'Processing', description: 'Sent to the payment network', state: 'done' },
  ]
  if (transaction.status === 'successful') {
    return [...base, { label: 'Completed', description: `Settled at ${formatTime(settled)}`, state: 'done' }]
  }
  if (transaction.status === 'pending') {
    return [...base, { label: 'Pending review', description: 'Waiting for the beneficiary bank to confirm', state: 'current' }]
  }
  if (transaction.status === 'failed') {
    return [base[0], { label: 'Failed', description: 'Rejected by the beneficiary bank. No funds left your account.', state: 'failed' }]
  }
  return [...base, { label: 'Reversed', description: 'Funds returned to your account', state: 'reversed' }]
}

export default function TransactionDetails() {
  const { transactionId } = useParams()
  const toast = useToast()
  const { data: transaction, loading, error, refetch } = useAsync(
    () => api.fetchTransaction(transactionId),
    [transactionId],
  )

  useDocumentTitle(transaction ? 'Transaction details' : 'Transaction')

  const downloadReceipt = useCallback(() => {
    if (!transaction) return
    const lines = [
      'Northstar — transaction receipt',
      `Description,${transaction.description}`,
      `Reference,${transaction.reference}`,
      `Date,${formatDateTime(transaction.date)}`,
      `Type,${transaction.type === 'credit' ? 'Credit' : 'Debit'}`,
      `Amount,${transaction.amount.toFixed(2)}`,
      `Fee,${transaction.fee.toFixed(2)}`,
      `Status,${STATUS_META[transaction.status]?.label ?? transaction.status}`,
      `Counterparty,${transaction.counterparty?.name ?? ''}`,
      `Bank,${transaction.counterparty?.bank ?? ''}`,
      `Category,${CATEGORY_META[transaction.category]?.label ?? transaction.category}`,
      `Channel,${TRANSACTION_CHANNELS[transaction.channel] ?? transaction.channel}`,
      `Balance after,${(transaction.balanceAfter ?? 0).toFixed(2)}`,
    ]
    downloadFile({
      content: lines.join('\n'),
      filename: `northstar-receipt-${transaction.reference}.csv`,
      mimeType: 'text/csv',
    })
    toast.success('Receipt downloaded', `${transaction.reference} saved as CSV.`)
  }, [transaction, toast])

  if (loading) {
    return (
      <Card>
        <LoadingState label="Loading transaction" />
      </Card>
    )
  }

  if (error || !transaction) {
    return (
      <Card>
        <ErrorState
          title="We could not find that transaction"
          description={error?.message ?? 'It may have been removed or the reference is incorrect.'}
          onRetry={refetch}
        />
        <div className="flex justify-center pb-4">
          <Button variant="secondary" to="/app/transactions">
            Back to all transactions
          </Button>
        </div>
      </Card>
    )
  }

  const isCredit = transaction.type === 'credit'
  const timeline = timelineFor(transaction)

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
            {formatCurrency(transaction.amount)}
          </p>
          <p className="mt-1.5 text-[13.5px] text-ink-600">{transaction.description}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <TransactionStatus status={transaction.status} />
            <ReferenceChip reference={transaction.reference} />
          </div>
          <p className="mt-3 text-[12.5px] text-ink-400">{formatDateTime(transaction.date)}</p>
        </div>

        {transaction.status === 'failed' ? (
          <Alert tone="danger" icon={XCircle} title="This payment did not go through" className="mt-4">
            {formatCurrency(transaction.amount)} was not debited. You can try again if you still need to send it.
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
            <DetailRow label="Description" value={transaction.description} />
            <DetailRow label="Category" value={CATEGORY_META[transaction.category]?.label ?? transaction.category} />
            <DetailRow label="Direction" value={isCredit ? 'Money in' : 'Money out'} />
            <DetailRow label="Amount" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Fee" value={transaction.fee ? formatCurrency(transaction.fee) : 'No fee'} />
            {transaction.fee ? (
              <DetailRow
                label="Total"
                value={formatCurrency(isCredit ? transaction.amount - transaction.fee : transaction.amount + transaction.fee)}
              />
            ) : null}
            <DetailRow label="Channel" value={TRANSACTION_CHANNELS[transaction.channel] ?? transaction.channel} />
            <DetailRow label="Reference" value={transaction.reference} mono />
            <DetailRow label="Date" value={formatDateTime(transaction.date)} />
            {transaction.balanceAfter !== undefined ? (
              <DetailRow label="Balance after" value={formatCurrency(transaction.balanceAfter)} />
            ) : null}
          </DescriptionList>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Counterparty">
            <DescriptionList>
              <DetailRow label="Name" value={transaction.counterparty?.name ?? '—'} />
              {transaction.counterparty?.bank ? <DetailRow label="Bank" value={transaction.counterparty.bank} /> : null}
              {transaction.counterparty?.accountNumber ? (
                <DetailRow
                  label="Account number"
                  value={transaction.counterparty.accountNumber}
                  mono
                />
              ) : null}
              {transaction.narration ? <DetailRow label="Narration" value={transaction.narration} /> : null}
              {transaction.meta?.provider ? <DetailRow label="Provider" value={transaction.meta.provider} /> : null}
              {transaction.meta?.customerRef ? <DetailRow label="Customer ref" value={transaction.meta.customerRef} mono /> : null}
              {transaction.meta?.phone ? <DetailRow label="Phone number" value={transaction.meta.phone} /> : null}
              {transaction.meta?.planLabel ? <DetailRow label="Bundle" value={transaction.meta.planLabel} /> : null}
              {transaction.cardId ? <DetailRow label="Card" value={`Ending ${transaction.cardId.slice(-2)}••`} /> : null}
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
