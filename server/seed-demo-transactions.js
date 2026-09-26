import { TRANSACTIONS } from '../src/data/transactions.js'
import { ACCOUNTS } from '../src/data/users.js'
import { BENEFICIARIES } from '../src/data/beneficiaries.js'
import { CARDS } from '../src/data/cards.js'
import { NOTIFICATIONS } from '../src/data/notifications.js'
import { BILL_PROVIDERS } from '../src/data/bills.js'
import { encryptSecret } from './security/crypto.js'
import { Account, Beneficiary, Biller, Card, Notification, Transaction, User } from './models/index.js'

let seedPromise
let billerSeedPromise

export function ensureDemoTransactions() {
  seedPromise ??= seedDemoTransactions().catch((error) => {
    seedPromise = undefined
    throw error
  })
  return seedPromise
}

async function seedDemoTransactions() {
  const operations = TRANSACTIONS.map((transaction) => ({
    updateOne: {
      filter: { reference: transaction.reference },
      update: {
        $set: {
          visibility: 'shared',
          type: transaction.type,
          direction: transaction.type,
          category: transaction.category,
          description: transaction.description,
          counterparty: transaction.counterparty,
          amount: transaction.amount,
          fee: transaction.fee,
          status: transaction.status,
          date: transaction.date,
          reference: transaction.reference,
          narration: transaction.narration,
          meta: transaction.meta,
          channel: transaction.channel,
          cardId: transaction.cardId,
          signedAmount: transaction.signedAmount,
          balanceAfter: transaction.balanceAfter,
        },
        $unset: { owner: 1, account: 1 },
      },
      upsert: true,
    },
  }))

  try {
    await Transaction.bulkWrite(operations, { ordered: false })
  } catch (error) {
    const duplicateOnly = error.code === 11000 || error.writeErrors?.every((writeError) => writeError.code === 11000)
    if (!duplicateOnly) throw error
  }

  billerSeedPromise ??= seedDemoBillers().catch((error) => {
    billerSeedPromise = undefined
    throw error
  })
  await billerSeedPromise
}

async function seedDemoBillers() {
  await Biller.bulkWrite(BILL_PROVIDERS.map((provider) => ({
    updateOne: {
      filter: { visibility: 'shared', name: provider.name },
      update: { $set: { ...provider, visibility: 'shared' } },
      upsert: true,
    },
  })), { ordered: false })
}

export async function ensureDemoUserData(user, accounts) {
  if (user.demoDataSeededAt) return
  const claim = await User.findOneAndUpdate(
    { _id: user._id, demoDataSeededAt: { $exists: false } },
    { $set: { demoDataSeededAt: new Date() } },
    { new: true },
  ).select('_id').lean()
  if (!claim) return

  try {
    const primaryAccount = accounts.find((account) => account.primary) ?? accounts[0]
    const beneficiaries = BENEFICIARIES.map(({ id, ...beneficiary }) => ({
      updateOne: {
        filter: { owner: user._id, accountNumber: beneficiary.accountNumber },
        update: { $setOnInsert: { ...beneficiary, owner: user._id } },
        upsert: true,
      },
    }))
    const cards = CARDS.map((card) => {
      const templateAccount = ACCOUNTS.find((account) => account.id === card.accountId)
      const account = accounts.find((candidate) => candidate.number === templateAccount?.number) ?? primaryAccount
      return {
        updateOne: {
          filter: { owner: user._id, last4: card.last4 },
          update: {
            $setOnInsert: {
              owner: user._id,
              account: account?._id,
              nickname: card.nickname,
              holderName: `${user.firstName} ${user.lastName}`.trim().toUpperCase(),
              panCiphertext: encryptSecret(card.number.replace(/\s/g, '')),
              cvvCiphertext: encryptSecret(card.cvv),
              last4: card.last4,
              expiry: card.expiry,
              brand: card.brand,
              scheme: card.scheme,
              type: card.type,
              currency: card.currency,
              status: card.status,
              isDefault: card.isDefault,
              contactless: card.contactless,
              limits: card.limits,
              spendThisMonth: card.spendThisMonth,
              issuedOn: card.issuedOn,
              color: card.color,
            },
          },
          upsert: true,
        },
      }
    })
    const notifications = NOTIFICATIONS.map(({ id, ...notification }) => ({
      updateOne: {
        filter: { owner: user._id, title: notification.title },
        update: { $setOnInsert: { ...notification, owner: user._id } },
        upsert: true,
      },
    }))

    await Promise.all([
      Beneficiary.bulkWrite(beneficiaries, { ordered: false }),
      Card.bulkWrite(cards, { ordered: false }),
      Notification.bulkWrite(notifications, { ordered: false }),
    ])
  } catch (error) {
    await User.updateOne({ _id: user._id }, { $unset: { demoDataSeededAt: 1 } })
    throw error
  }
}