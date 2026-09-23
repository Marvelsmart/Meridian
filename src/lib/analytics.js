import { CATEGORY_META } from './constants'
import { startOfDay, endOfDay, toDate } from './format'

export function signedAmount(txn) {
  if (typeof txn.signedAmount === 'number') return txn.signedAmount
  return txn.type === 'credit' ? txn.amount - txn.fee : -(txn.amount + txn.fee)
}

export function affectsBalance(txn) {
  return txn.status === 'successful' || txn.status === 'pending'
}

/** Credits / debits / counts, ignoring failed & reversed movements. */
export function sumsFor(transactions) {
  return transactions.reduce(
    (totals, txn) => {
      if (!affectsBalance(txn)) {
        totals.ignored += 1
        return totals
      }
      if (txn.type === 'credit') {
        totals.credits += txn.amount
        totals.inflowCount += 1
      } else {
        totals.debits += txn.amount + txn.fee
        totals.outflowCount += 1
      }
      totals.count += 1
      return totals
    },
    { credits: 0, debits: 0, count: 0, ignored: 0, inflowCount: 0, outflowCount: 0 },
  )
}

/** Filter + sort, shared by the transactions page and the statements page. */
export function filterTransactions(transactions, filters = {}) {
  const {
    search = '',
    status = 'all',
    category = 'all',
    type = 'all',
    accountId = 'all',
    from = null,
    to = null,
    sort = 'date-desc',
  } = filters

  const term = String(search).trim().toLowerCase()
  const fromTime = from ? startOfDay(from).getTime() : null
  const toTime = to ? endOfDay(to).getTime() : null

  const filtered = transactions.filter((txn) => {
    if (status !== 'all' && txn.status !== status) return false
    if (category !== 'all' && txn.category !== category) return false
    if (type !== 'all' && txn.type !== type) return false
    if (accountId !== 'all' && txn.accountId !== accountId) return false
    const time = toDate(txn.date).getTime()
    if (fromTime !== null && time < fromTime) return false
    if (toTime !== null && time > toTime) return false
    if (term) {
      const haystack = [
        txn.description,
        txn.reference,
        txn.type,
        txn.status,
        txn.narration,
        txn.counterparty?.name,
        txn.counterparty?.bank,
        txn.counterparty?.accountNumber,
        txn.meta?.provider,
        txn.meta?.phone,
        CATEGORY_META[txn.category]?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })

  const sorted = [...filtered]
  switch (sort) {
    case 'date-asc':
      sorted.sort((a, b) => toDate(a.date) - toDate(b.date))
      break
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount)
      break
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount)
      break
    default:
      sorted.sort((a, b) => toDate(b.date) - toDate(a.date))
  }
  return sorted
}

/** [{ category, label, amount, percent }] for debits only, biggest first. */
export function spendByCategory(transactions) {
  const totals = new Map()
  let total = 0
  transactions.forEach((txn) => {
    if (txn.type !== 'debit' || !affectsBalance(txn)) return
    const key = txn.category
    const value = txn.amount + txn.fee
    totals.set(key, (totals.get(key) ?? 0) + value)
    total += value
  })
  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_META[category]?.label ?? category,
      amount,
      percent: total ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/** Month buckets for the 6-month trend chart. */
export function monthlyTrend(transactions, months = 6) {
  const buckets = []
  const now = new Date()
  for (let index = months - 1; index >= 0; index -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1)
    buckets.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString('en-GB', { month: 'short' }),
      credits: 0,
      debits: 0,
    })
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  transactions.forEach((txn) => {
    if (!affectsBalance(txn)) return
    const date = toDate(txn.date)
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (!bucket) return
    if (txn.type === 'credit') bucket.credits += txn.amount
    else bucket.debits += txn.amount + txn.fee
  })
  return buckets
}

/** Day buckets for the dashboard's 14-day flow chart. */
export function dailyFlow(transactions, days = 14) {
  const buckets = []
  const now = new Date()
  for (let index = days - 1; index >= 0; index -= 1) {
    const cursor = new Date(now)
    cursor.setDate(cursor.getDate() - index)
    buckets.push({
      key: startOfDay(cursor).toISOString(),
      label: cursor.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      credits: 0,
      debits: 0,
    })
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  transactions.forEach((txn) => {
    if (!affectsBalance(txn)) return
    const bucket = byKey.get(startOfDay(txn.date).toISOString())
    if (!bucket) return
    if (txn.type === 'credit') bucket.credits += txn.amount
    else bucket.debits += txn.amount + txn.fee
  })
  return buckets
}

export function inRange(transactions, from, to) {
  const fromTime = from ? startOfDay(from).getTime() : null
  const toTime = to ? endOfDay(to).getTime() : null
  return transactions.filter((txn) => {
    const time = toDate(txn.date).getTime()
    if (fromTime !== null && time < fromTime) return false
    if (toTime !== null && time > toTime) return false
    return true
  })
}

/** Day groups with human labels ("Today", "Yesterday", "12 Feb 2026"). */
export function groupByDay(transactions) {
  const groups = []
  const index = new Map()
  transactions.forEach((txn) => {
    const date = toDate(txn.date)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (!index.has(key)) {
      const diffDays = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86400000)
      const label =
        diffDays === 0
          ? 'Today'
          : diffDays === 1
            ? 'Yesterday'
            : date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
              })
      const group = { key, label, date, items: [], total: 0 }
      index.set(key, group)
      groups.push(group)
    }
    const group = index.get(key)
    group.items.push(txn)
    group.total += txn.type === 'credit' ? txn.amount : -(txn.amount + txn.fee)
  })
  return groups
}

export function topCounterparties(transactions, limit = 4) {
  const totals = new Map()
  transactions.forEach((txn) => {
    if (txn.type !== 'debit') return
    const name = txn.counterparty?.name
    if (!name) return
    const current = totals.get(name) ?? { name, amount: 0, count: 0, bank: txn.counterparty?.bank ?? null }
    current.amount += txn.amount + txn.fee
    current.count += 1
    totals.set(name, current)
  })
  return [...totals.values()].sort((a, b) => b.amount - a.amount).slice(0, limit)
}

/** Opening / closing balances + totals for a statement window. */
export function statementTotals(scopedTransactions) {
  const sums = sumsFor(scopedTransactions)
  const newest = [...scopedTransactions].sort((a, b) => toDate(b.date) - toDate(a.date))[0]
  const closingBalance = newest?.balanceAfter ?? 0
  const openingBalance = closingBalance - sums.credits + sums.debits
  return {
    ...sums,
    openingBalance: Number(openingBalance.toFixed(2)),
    closingBalance: Number(closingBalance.toFixed(2)),
    lastActivity: newest?.date ?? null,
  }
}


