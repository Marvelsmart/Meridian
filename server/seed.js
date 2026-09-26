import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { User, Account, Beneficiary, Card, Notification, Biller } from './models/index.js'
import { USER, ACCOUNTS } from '../src/data/users.js'
import { BENEFICIARIES } from '../src/data/beneficiaries.js'
import { CARDS } from '../src/data/cards.js'
import { NOTIFICATIONS } from '../src/data/notifications.js'
import { BILL_PROVIDERS } from '../src/data/bills.js'
import { encryptSecret } from './security/crypto.js'
import { ensureDemoTransactions } from './seed-demo-transactions.js'

if (!env.mongoUri || !env.jwtSecret) throw new Error('MONGODB_URI and JWT_SECRET must be configured.')

await connectDatabase(env.mongoUri)
const password = process.env.SEED_PASSWORD
if (!password) throw new Error('SEED_PASSWORD must be configured when running the seed script.')
const passwordHash = await bcrypt.hash(password, 12)
const user = await User.findOneAndUpdate({ email: USER.email }, { $set: { firstName: USER.firstName, lastName: USER.lastName, phone: USER.phone, passwordHash, verificationStatus: USER.verificationStatus, security: USER.security }, $setOnInsert: { email: USER.email } }, { upsert: true, new: true })
const accounts = []
for (const source of ACCOUNTS) accounts.push(await Account.findOneAndUpdate({ owner: user._id, number: source.number }, { ...source, owner: user._id, _id: undefined }, { upsert: true, new: true, setDefaultsOnInsert: true }))
await ensureDemoTransactions()
for (const source of BENEFICIARIES) await Beneficiary.findOneAndUpdate({ owner: user._id, accountNumber: source.accountNumber }, { ...source, owner: user._id, _id: undefined }, { upsert: true, new: true })
for (const source of CARDS) await Card.findOneAndUpdate({ owner: user._id, last4: source.last4 }, { owner: user._id, account: accounts.find((account) => account.number === ACCOUNTS.find((item) => item.id === source.accountId)?.number)?._id || primary._id, nickname: source.nickname, holderName: source.holderName, panCiphertext: encryptSecret(source.number.replace(/\s/g, '')), cvvCiphertext: encryptSecret(source.cvv), last4: source.last4, expiry: source.expiry, brand: source.brand, type: source.type, currency: source.currency, status: source.status, contactless: source.contactless, limits: source.limits }, { upsert: true, new: true })
for (const source of NOTIFICATIONS) await Notification.findOneAndUpdate({ owner: user._id, title: source.title, createdAt: source.createdAt }, { ...source, owner: user._id, _id: undefined }, { upsert: true, new: true })
for (const source of BILL_PROVIDERS) await Biller.findOneAndUpdate({ visibility: 'shared', name: source.name }, { ...source, visibility: 'shared', _id: undefined }, { upsert: true, new: true })
console.log(`Seeded shared demo data and user ${user.email}`)
await disconnectDatabase()