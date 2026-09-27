import { ACCOUNTS } from './users.js'
import { BANKS } from './banks.js'

/**
 * Deterministic transaction history generator.
 *
 * The dataset is generated (rather than hand-written) so it stays realistic and
 * internally consistent (running balances, references, timestamps) while still
 * being a plain array of objects that `lib/api.js` can serve and later replace
 * with a real API response.
 */

const DAYS_OF_HISTORY = 190
const PRNG_SEED = 20260214

const PEOPLE = [
  { name: 'Maya Thompson', bank: '021000021', account: '7943201186' },
  { name: 'Jordan Lee', bank: '026013673', account: '1122334455' },
  { name: 'Alicia Gomez', bank: '211274450', account: '9856421037' },
  { name: 'Sam Patel', bank: '325081403', account: '4985172063' },
  { name: 'Priya Shah', bank: '122105155', account: '6634812904' },
  { name: 'Daniel Brooks', bank: '091000019', account: '3308847715' },
  { name: 'Emma Wilson', bank: '151023121', account: '7749201358' },
  { name: 'Chris Nguyen', bank: '122242607', account: '8874316590' },
  { name: 'Olivia Grant', bank: '111000025', account: '2087915644' },
  { name: 'Ethan Reed', bank: '021000021', account: '5203116682' },
  { name: 'Noah Hughes', bank: '026013673', account: '9910437726' },
]

const MERCHANTS = [
  'Trader Joe’s',
  'Whole Foods Market',
  'Uber',
  'Netflix',
  'Spotify',
  'Starbucks',
  'City Parking',
  'Apple iCloud',
  'Lyft',
  'Pizza Port',
]

const BILL_MERCHANTS = [
  { name: 'PG&E Utility', provider: 'Pacific Gas & Electric', customer: '48762519' },
  { name: 'Spectrum Internet', provider: 'Spectrum', customer: '445-9012' },
  { name: 'Water District', provider: 'City Water', customer: 'WT-884021' },
  { name: 'Electric Co-op', provider: 'Green Valley Energy', customer: 'VG-664118' },
  { name: 'Internet Plus', provider: 'FiberOne', customer: 'FO-336520' },
  { name: 'City HOA', provider: 'Harbor View HOA', customer: 'HV-90314' },
]

const SAVINGS_GOALS = ['Rainy day goal', 'Emergency fund', 'New laptop goal']
const ATM_LOCATIONS = ['Union Square', 'SoHo', 'Downtown Seattle', 'Midtown Manhattan']
const REFUND_REASONS = ['failed transfer reversal', 'merchant refund', 'duplicate debit']
const CLIENTS = ['Northwind Labs', 'Bright Studio', 'Kilimanjaro Co.']
const NARRATIONS = ['Rent contribution', 'School fees', 'Project payment', 'Family support']

function mulberry32(seed) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeHelpers(random) {
  const pick = (list) => list[Math.floor(random() * list.length)]
  const int = (min, max) => Math.floor(random() * (max - min + 1)) + min
  const amount = (min, max, step = 50) => Math.round((random() * (max - min) + min) / step) * step
  const code = (length = 8) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let out = ''
    for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(random() * alphabet.length)]
    return out
  }
  return { pick, int, amount, code }
}

const TEMPLATES = [
  {
    weight: 22,
    build({ pick, amount, int }) {
      const person = pick(PEOPLE)
      const outgoing = pick([true, true, false])
      const fee = outgoing ? amount(0, 100, 1) : 0
      return {
        type: outgoing ? 'debit' : 'credit',
        category: 'transfer',
        description: outgoing ? `Transfer to ${person.name}` : `Transfer from ${person.name}`,
        counterparty: {
          name: person.name,
          bank: BANKS.find((bank) => bank.code === person.bank)?.name ?? 'Access Bank',
          accountNumber: person.account,
          kind: 'person',
        },
        amount: amount(8000, 420000),
        fee,
        channel: pick(['mobile', 'mobile', 'web']),
        narration: outgoing ? pick(NARRATIONS) : 'Payment received',
        prefix: 'TRF',
        accountId: pick(['acc_main', 'acc_main', 'acc_current']),
      }
    },
  },
  {
    weight: 10,
    build({ pick, amount }) {
      const bill = pick(BILL_MERCHANTS)
      return {
        type: 'debit',
        category: 'bills',
        description: bill.name,
        counterparty: { name: bill.provider, kind: 'bill' },
        amount: amount(3500, 78000),
        fee: 100,
        channel: pick(['mobile', 'web']),
        narration: `Bill payment — ${bill.provider}`,
        meta: { provider: bill.provider, customerRef: bill.customer, billCategory: bill.name },
        prefix: 'BIL',
        accountId: 'acc_main',
      }
    },
  },
  {
    weight: 18,
    build({ pick, amount }) {
      const merchant = pick(MERCHANTS)
      return {
        type: 'debit',
        category: 'card',
        description: merchant,
        counterparty: { name: merchant, kind: 'merchant' },
        amount: amount(1200, 145000, 20),
        fee: 0,
        channel: pick(['pos', 'web', 'mobile']),
        narration: 'Card purchase',
        cardId: pick(['card_01', 'card_01', 'card_02', 'card_03']),
        prefix: 'POS',
        accountId: 'acc_main',
      }
    },
  },
  {
    weight: 8,
    build({ pick, amount }) {
      return {
        type: 'debit',
        category: 'withdrawal',
        description: `ATM withdrawal — ${pick(ATM_LOCATIONS)}`,
        counterparty: { name: 'Northstar ATM', kind: 'atm' },
        amount: amount(5000, 100000, 1000),
        fee: pick([0, 105]),
        channel: 'atm',
        narration: 'Cash withdrawal',
        prefix: 'ATM',
        accountId: pick(['acc_main', 'acc_current']),
      }
    },
  },
  {
    weight: 7,
    build({ pick, amount }) {
      return {
        type: 'debit',
        category: 'savings',
        description: `Auto-save — ${pick(SAVINGS_GOALS)}`,
        counterparty: { name: 'Northstar Savings Vault', kind: 'savings' },
        amount: amount(10000, 60000, 1000),
        fee: 0,
        channel: 'direct_debit',
        narration: 'Automated savings',
        prefix: 'SVN',
        accountId: 'acc_main',
      }
    },
  },
  {
    weight: 6,
    build({ pick, amount }) {
      const person = pick(PEOPLE)
      return {
        type: 'credit',
        category: 'refund',
        description: `Refund — ${pick(REFUND_REASONS)}`,
        counterparty: { name: person.name, bank: 'Northstar Bank', accountNumber: person.account, kind: 'person' },
        amount: amount(2000, 45000),
        fee: 0,
        channel: pick(['mobile', 'web']),
        narration: 'Reversal credit',
        prefix: 'REF',
        accountId: 'acc_main',
      }
    },
  },
  {
    weight: 4,
    build({ pick, amount }) {
      const client = pick(CLIENTS)
      return {
        type: 'credit',
        category: 'income',
        description: `Client payment — ${client}`,
        counterparty: { name: client, bank: 'Stanbic IBTC', accountNumber: '0098761234', kind: 'business' },
        amount: amount(180000, 620000),
        fee: 0,
        channel: 'web',
        narration: 'Invoice settlement',
        prefix: 'INC',
        accountId: 'acc_current',
      }
    },
  },
]

/**
 * Demo statuses applied to the newest rows so all four status states
 * (successful / pending / failed / reversed) are visible without fabricating data.
 */
const STATUS_PLAN = { 1: 'pending', 5: 'failed', 9: 'pending', 14: 'reversed' }

function generateTransactions() {
  const random = mulberry32(PRNG_SEED)
  const helpers = makeHelpers(random)
  const { pick, int, amount, code } = helpers
  const totalWeight = TEMPLATES.reduce((sum, template) => sum + template.weight, 0)
  const now = new Date()
  const raw = []
  let sequence = 0

  for (let daysAgo = 0; daysAgo < DAYS_OF_HISTORY; daysAgo += 1) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(int(7, 22), int(0, 59), int(0, 59), 0)

    if (date.getDate() === 25) {
      const salaryDate = new Date(date)
      salaryDate.setHours(8, 12, 0, 0)
      sequence += 1
      raw.push({
        id: `txn_${String(sequence).padStart(4, '0')}`,
        reference: `SAL-${code(8)}`,
        type: 'credit',
        status: 'successful',
        category: 'income',
        description: 'Salary — Northwind Labs',
        counterparty: {
          name: 'Northwind Labs',
          bank: 'Stanbic IBTC',
          accountNumber: '0098761234',
          kind: 'employer',
        },
        amount: 1145000,
        fee: 0,
        channel: 'direct_debit',
        narration: 'Monthly salary credit',
        cardId: null,
        meta: null,
        accountId: 'acc_main',
        date: salaryDate.toISOString(),
      })
    }

    const isWeekend = [0, 6].includes(date.getDay())
    const count = isWeekend ? (random() > 0.55 ? 1 : 0) : random() > 0.28 ? int(1, 2) : 0

    for (let i = 0; i < count; i += 1) {
      let ticket = random() * totalWeight
      let template = TEMPLATES[0]
      for (const candidate of TEMPLATES) {
        ticket -= candidate.weight
        if (ticket <= 0) {
          template = candidate
          break
        }
      }
      const built = template.build(helpers)
      sequence += 1
      const txDate = new Date(date)
      txDate.setMinutes(txDate.getMinutes() + i * int(3, 55))
      raw.push({
        id: `txn_${String(sequence).padStart(4, '0')}`,
        reference: `${built.prefix}-${code(8)}`,
        type: built.type,
        status: 'successful',
        category: built.category,
        description: built.description,
        counterparty: built.counterparty,
        amount: built.amount,
        fee: built.fee ?? 0,
        channel: built.channel,
        narration: built.narration ?? null,
        cardId: built.cardId ?? null,
        meta: built.meta ?? null,
        accountId: built.accountId ?? 'acc_main',
        date: txDate.toISOString(),
      })
    }
  }

  raw.sort((a, b) => new Date(b.date) - new Date(a.date))
  raw.forEach((txn, index) => {
    if (STATUS_PLAN[index]) txn.status = STATUS_PLAN[index]
  })

  // Walk balances backwards from the current primary-account balance so each row
  // carries a believable running balance (used by transaction detail + statements).
  let running = ACCOUNTS[0].balance
  for (let i = 0; i < raw.length; i += 1) {
    const txn = raw[i]
    const signed = txn.type === 'credit' ? txn.amount - txn.fee : -(txn.amount + txn.fee)
    const affectsBalance = txn.status === 'successful' || txn.status === 'pending'
    txn.signedAmount = signed
    txn.balanceAfter = Number(running.toFixed(2))
    running -= affectsBalance ? signed : 0
  }

  return raw
}

export const TRANSACTIONS = generateTransactions()

export function transactionById(id) {
  return TRANSACTIONS.find((txn) => txn.id === id) ?? null
}

export function transactionsForCard(cardId, limit = 8) {
  return TRANSACTIONS.filter((txn) => txn.cardId === cardId).slice(0, limit)
}


