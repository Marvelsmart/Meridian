import { useMemo, useState } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import { cn } from '@/lib/cn'
import { AccountSelect } from '@/components/banking'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { formatCurrency, toInputDate } from '@/lib/format'
import { buildStatementHtml, buildStatementCsv } from '@/lib/statement'
import { openHtmlInNewTab } from '@/lib/download'
import { Button, Card, Input, SectionCard } from '@/components/ui'

export default function Statements() {
  useDocumentTitle('Statements')
  const { accounts, activeAccount, actions } = useAppData()
  const toast = useToast()
  const [accountId, setAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? '')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return toInputDate(d)
  })
  const [to, setTo] = useState(() => toInputDate(new Date()))
  const { data, loading, error, refetch } = useAsync(
    () => actions.reload(),
    [],
    { immediate: false },
  )

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount ?? accounts[0] ?? null

  const statement = useMemo(() => {
    if (!selectedAccount) return null
    const filtered = selectedAccount.transactions ?? []
    return {
      account: selectedAccount,
      period: { from, to },
      totals: {
        openingBalance: filtered.reduce((sum, item) => sum + (item.type === 'debit' ? item.amount : 0), 0),
        closingBalance: selectedAccount.balance,
        credits: filtered.filter((item) => item.type === 'credit').reduce((sum, item) => sum + item.amount, 0),
        debits: filtered.filter((item) => item.type === 'debit').reduce((sum, item) => sum + item.amount + (item.fee ?? 0), 0),
      },
      transactions: filtered.filter((item) => {
        const date = new Date(item.date)
        return date >= new Date(from) && date <= new Date(to)
      }),
      generatedAt: new Date().toISOString(),
    }
  }, [from, selectedAccount, to])

  const handleGenerate = async () => {
    if (!selectedAccount) return
    try {
      const next = await fetch(`/api`).catch(() => null)
      if (next) {
        toast.info('Preview ready', 'Your statement is ready to download.')
      }
      if (!statement || !statement.transactions.length) {
        toast.error('No transactions found', 'Try a wider date range for this account.')
        return
      }
      toast.success('Statement generated', `${selectedAccount.name} statement is ready.`)
    } catch (error) {
      toast.error('Statement unavailable', error.message)
    }
  }

  const handleDownloadCsv = () => {
    if (!statement || !statement.transactions.length) {
      toast.error('Nothing to export', 'Adjust the date range to include some account activity.')
      return
    }
    const csv = buildStatementCsv(statement)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `northstar-statement-${from}-${to}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('CSV downloaded', `${statement.transactions.length} rows were exported.`)
  }

  const handlePreviewHtml = () => {
    if (!statement || !statement.transactions.length) {
      toast.error('No transactions found', 'Try a wider date range for this account.')
      return
    }
    openHtmlInNewTab(buildStatementHtml(statement))
    toast.success('Statement preview opened', 'The printable statement opened in a new tab.')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Statements</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Download or preview account statements for any period. Perfect for audits and personal records.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} label="Account" />
          <Input label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          <div className="flex items-end">
            <Button onClick={handleGenerate} loading={loading}>Generate</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Opening balance" bodyClassName="p-4">
          <p className="text-[11px] uppercase tracking-[0.08em] text-ink-400">Start</p>
          <p className="mt-2 text-[20px] font-semibold text-ink-900">{formatCurrency(statement?.totals?.openingBalance ?? 0)}</p>
        </SectionCard>
        <SectionCard title="Closing balance" bodyClassName="p-4">
          <p className="text-[11px] uppercase tracking-[0.08em] text-ink-400">End</p>
          <p className="mt-2 text-[20px] font-semibold text-ink-900">{formatCurrency(statement?.totals?.closingBalance ?? 0)}</p>
        </SectionCard>
        <SectionCard title="Activity" bodyClassName="p-4">
          <p className="text-[11px] uppercase tracking-[0.08em] text-ink-400">Transactions</p>
          <p className="mt-2 text-[20px] font-semibold text-ink-900">{statement?.transactions.length ?? 0}</p>
        </SectionCard>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-ink-900">{selectedAccount?.name ?? 'Account statement'}</p>
            <p className="text-[12px] text-ink-500">{from} → {to}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Download} onClick={handleDownloadCsv}>Download CSV</Button>
            <Button variant="secondary" icon={Printer} onClick={handlePreviewHtml}>Print / HTML</Button>
          </div>
        </div>

        <div className="p-4">
          {error ? <p className="text-[13px] text-danger-600">{error.message}</p> : statement?.transactions.length ? (
            <>
              {/* Mobile: one compact row per transaction — no horizontal page scroll. */}
              <ul className="divide-y divide-ink-100 md:hidden">
                {statement.transactions.map((transaction) => (
                  <li key={transaction.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink-900">{transaction.description}</p>
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' · '}
                        <span className="capitalize">{transaction.type}</span>
                      </p>
                      <p className="amount mt-0.5 text-[11.5px] text-ink-400">
                        Balance {formatCurrency(transaction.balanceAfter ?? 0)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'amount shrink-0 text-[13px] font-semibold',
                        transaction.type === 'credit' ? 'text-success-600' : 'text-ink-900',
                      )}
                    >
                      {transaction.type === 'credit' ? '+' : '−'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Tablet and up: the full statement table. */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-ink-100 text-ink-500">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-ink-100">
                          <td className="py-2 pr-4">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                          <td className="py-2 pr-4">{transaction.description}</td>
                          <td className="py-2 pr-4">{transaction.type}</td>
                          <td className="py-2 pr-4">{formatCurrency(transaction.amount)}</td>
                          <td className="py-2 pr-4">{formatCurrency(transaction.balanceAfter ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="size-8 text-ink-400" />
              <p className="mt-3 text-[15px] font-semibold text-ink-900">No statement available</p>
              <p className="mt-1 text-[13px] text-ink-500">Select an account and a date range to generate a statement.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
