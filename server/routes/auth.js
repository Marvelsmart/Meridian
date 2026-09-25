import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { z } from 'zod'
import { User, Account, Device } from '../models/index.js'
import { env } from '../config/env.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()
const registration = z.object({ firstName: z.string().min(2), lastName: z.string().min(2), email: z.string().email(), phone: z.string().min(7), password: z.string().min(8), initialBalance: z.number().min(0).max(1000000), managerCode: z.string().min(1), transactionPin: z.string().regex(/^\d{4}$/).optional() })

function publicUser(user) { const { passwordHash, transactionPinHash, ...safe } = user.toObject ? user.toObject() : user; return safe }

router.post('/register', async (req, res) => {
  const input = registration.parse(req.body)
  if (input.managerCode.trim().toUpperCase() !== env.managerCode.trim().toUpperCase()) return res.status(403).json({ error: 'Invalid bank manager code' })
  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await User.create({ firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.toLowerCase(), phone: input.phone, passwordHash, transactionPinHash: input.transactionPin ? await bcrypt.hash(input.transactionPin, 12) : undefined, verificationStatus: 'pending' })
  const account = await Account.create({ owner: user._id, name: 'Freedom Checking', type: 'checking', number: `0${crypto.randomInt(100000000, 999999999)}`, balance: input.initialBalance, ledgerBalance: input.initialBalance, available: input.initialBalance, primary: true, bank: 'Northstar Bank', openedOn: new Date(), currency: 'USD', limits: { dailyTransfer: 20000, singleTransfer: 10000 } })
  const deviceId = req.headers['x-device-id'] || crypto.randomUUID()
  await Device.create({ owner: user._id, deviceId, trusted: false, lastSeenAt: new Date() })
  res.status(201).json({ token: signToken(user, deviceId), user: publicUser(user), account: { id: account.id, balance: account.balance }, deviceValidated: false })
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+passwordHash +transactionPinHash')
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ error: 'Incorrect email or password' })
  const deviceId = req.headers['x-device-id'] || crypto.randomUUID()
  await Device.findOneAndUpdate({ owner: user._id, deviceId }, { $setOnInsert: { owner: user._id, deviceId, trusted: false }, $set: { lastSeenAt: new Date() } }, { upsert: true })
  res.json({ token: signToken(user, deviceId), user: publicUser(user), deviceValidated: Boolean((await Device.findOne({ owner: user._id, deviceId })).trusted) })
})

router.get('/me', requireAuth, async (req, res) => res.json({ user: publicUser(req.user), deviceId: req.deviceId, deviceValidated: Boolean((await Device.findOne({ owner: req.user._id, deviceId: req.deviceId }))?.trusted) }))
router.post('/logout', requireAuth, (req, res) => res.json({ success: true }))

export { router as authRouter }