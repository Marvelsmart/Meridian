import { BRAND } from './constants'
import { formatCurrency, formatDate, formatDateTime, formatAccountNumber } from './format'

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Frontend-generated CSV so the download works without any backend. */
export function transactionsToCsv(transactions, { title = 'Transactions', period = null } = {}) {
  const lines = [
    title,
    period ? `Period,${csvCell(period)}` : null,
    `Generated,${formatDateTime(new Date())}`,
    `Records,${transactions.length}`,
    '',
    'Date,Description,Type,Category,Status,Reference,Counterparty,Debit,Credit,Balance',
  ].filter(Boolean)

  transactions.forEach((txn) => {
    lines.push(
      [
        formatDate(txn.date),
        csvCell(txn.description),
        txn.type,
        txn.category,
        txn.status,
        txn.reference,
        csvCell(txn.counterparty?.name ?? ''),
        txn.type === 'debit' ? (txn.amount + txn.fee).toFixed(2) : '',
        txn.type === 'credit' ? txn.amount.toFixed(2) : '',
        (txn.balanceAfter ?? 0).toFixed(2),
      ].join(','),
    )
  })

  return lines.join('\n')
}

/** Frontend-generated CSV so the download works without any backend. */
export function buildStatementCsv(statement) {
  const { account, period, totals, transactions, generatedAt } = statement
  const lines = [
    `${BRAND.name} — Account statement`,
    `Account name,${csvCell(`${account.name} (${account.type})`)}`,
    `Account number,${csvCell(account.number)}`,
    `Currency,${account.currency}`,
    `Period,${period.from} to ${period.to}`,
    `Generated,${formatDateTime(generatedAt)}`,
    '',
    'Opening balance,Closing balance,Total credits,Total debits',
    [totals.openingBalance, totals.closingBalance, totals.credits, totals.debits].map((v) => v.toFixed(2)).join(','),
    '',
    'Date,Description,Type,Category,Status,Reference,Debit,Credit,Balance',
  ]

  transactions.forEach((txn) => {
    lines.push(
      [
        formatDate(txn.date, { month: 'short' }),
        csvCell(txn.description),
        txn.type,
        txn.category,
        txn.status,
        txn.reference,
        txn.type === 'debit' ? (txn.amount + txn.fee).toFixed(2) : '',
        txn.type === 'credit' ? txn.amount.toFixed(2) : '',
        (txn.balanceAfter ?? 0).toFixed(2),
      ].join(','),
    )
  })

  return lines.join('\n')
}

/** Printable HTML statement (opens in a new tab via a Blob URL). */
export function buildStatementHtml(statement) {
  const { account, period, totals, transactions, generatedAt } = statement
  const rows = transactions
    .map(
      (txn) => `<tr>
      <td>${formatDate(txn.date)}</td>
      <td>${txn.description}${txn.counterparty?.bank ? `<span class="muted"> · ${txn.counterparty.bank}</span>` : ''}</td>
      <td class="muted">${txn.reference}</td>
      <td class="num">${txn.type === 'debit' ? formatCurrency(txn.amount + txn.fee) : '—'}</td>
      <td class="num">${txn.type === 'credit' ? formatCurrency(txn.amount) : '—'}</td>
      <td class="num">${formatCurrency(txn.balanceAfter ?? 0)}</td>
    </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>${BRAND.name} statement ${period.from} → ${period.to}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #121822; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #121822; padding-bottom: 16px; }
  h1 { font-size: 18px; margin: 0 0 4px; letter-spacing: -0.01em; }
  p { margin: 2px 0; font-size: 12px; color: #4f5b6d; }
  .summary { display: flex; gap: 32px; margin: 24px 0; }
  .summary div { font-size: 12px; }
  .summary strong { display: block; font-size: 16px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px; color: #6d7a8c; border-bottom: 1px solid #dfe3ea; padding: 8px 6px; }
  td { padding: 8px 6px; border-bottom: 1px solid #eef0f4; vertical-align: top; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #6d7a8c; }
  footer { margin-top: 24px; font-size: 10px; color: #97a2b3; }
</style></head>
<body>
  <header>
    <div>
      <h1>${BRAND.name} — Account statement</h1>
      <p>${account.name} · ${account.type} · ${formatAccountNumber(account.number)}</p>
      <p>${account.bank} · ${account.currency}</p>
    </div>
    <div style="text-align:right">
      <p>Statement period</p>
      <p><strong>${period.from} → ${period.to}</strong></p>
      <p>Generated ${formatDateTime(generatedAt)}</p>
    </div>
  </header>
  <section class="summary">
    <div>Opening balance<strong>${formatCurrency(totals.openingBalance)}</strong></div>
    <div>Closing balance<strong>${formatCurrency(totals.closingBalance)}</strong></div>
    <div>Total credits<strong>${formatCurrency(totals.credits)}</strong></div>
    <div>Total debits<strong>${formatCurrency(totals.debits)}</strong></div>
    <div>Transactions<strong>${transactions.length}</strong></div>
  </section>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Reference</th><th style="text-align:right">Debit</th><th style="text-align:right">Credit</th><th style="text-align:right">Balance</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>This statement was generated by the ${BRAND.name} demo frontend from mock data. It is not a financial document.</footer>
</body></html>`
}
