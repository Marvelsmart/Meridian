import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { z } from 'zod'
import { User, Account, Device } from '../models/index.js'
import { env } from '../config/env.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { consumeResetCode, sendResetCode } from '../security/account-reset.js'

const router = Router()
const registration = z.object({ firstName: z.string().min(2), lastName: z.string().min(2), email: z.string().email(), phone: z.string().min(7), password: z.string().min(8), initialBalance: z.number().min(0).max(1000000), managerCode: z.string().min(1), transactionPin: z.string().regex(/^\d{4}$/) })

function publicUser(user) {
  const { passwordHash, transactionPinHash, ...safe } = user.toObject ? user.toObject() : user
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  return { ...safe, role: adminEmails.includes(String(safe.email || '').toLowerCase()) ? 'admin' : 'customer' }
}

router.post('/manager-code/verify', (req, res) => {
  const code = String(req.body.code || '').trim()
  if (!code || code.toUpperCase() !== env.managerCode.trim().toUpperCase()) return res.status(403).json({ error: 'Invalid Bank Manager Code. Please check the code and try again.' })
  res.json({ valid: true })
})

router.post('/register', async (req, res) => {
  const input = registration.parse(req.body)
  if (env.adminEmails.includes(input.email.trim().toLowerCase())) return res.status(409).json({ error: 'This administrator account must already exist before it is added to the server allowlist.' })
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
  if (user.passwordResetRequired) return res.status(403).json({ code: 'password_reset_required', error: 'Password reset required. Use the password recovery link.' })
  const deviceId = req.headers['x-device-id'] || crypto.randomUUID()
  await Device.findOneAndUpdate({ owner: user._id, deviceId }, { $setOnInsert: { owner: user._id, deviceId, trusted: false }, $set: { lastSeenAt: new Date() } }, { upsert: true })
  res.json({ token: signToken(user, deviceId), user: publicUser(user), deviceValidated: Boolean((await Device.findOne({ owner: user._id, deviceId })).trusted) })
})

router.get('/me', requireAuth, async (req, res) => res.json({ user: publicUser(req.user), deviceId: req.deviceId, deviceValidated: Boolean((await Device.findOne({ owner: req.user._id, deviceId: req.deviceId }))?.trusted) }))
router.post('/logout', requireAuth, (req, res) => res.json({ success: true }))
router.post('/password-reset/request', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!email) return res.status(400).json({ error: 'Email is required', code: 'validation_error', fields: { email: 'Email is required' } })
  if (!env.resendApiKey || !env.emailFrom) return res.status(503).json({ error: 'Password recovery email is not configured. Contact customer care.' })
  const user = await User.findOne({ email })
  if (user) await sendResetCode(user, 'password')
  res.json({ email, expiresInMinutes: 15, sent: true })
})
router.post('/password-reset/confirm', async (req, res) => {
  const password = String(req.body.password || '')
  if (!/^\d{6}$/.test(String(req.body.code || '')) || password.length < 8 || password !== req.body.confirmPassword) return res.status(400).json({ error: 'Please correct the password reset fields.', code: 'validation_error' })
  const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }).select('+passwordHash')
  if (!user || !(await consumeResetCode({ userId: user._id, purpose: 'password', code: req.body.code }))) return res.status(400).json({ error: 'The reset code is invalid or expired.' })
  user.passwordHash = await bcrypt.hash(password, 12)
  user.passwordResetRequired = false
  user.authVersion = Number(user.authVersion || 0) + 1
  await user.save()
  res.json({ success: true })
})

router.post('/transaction-pin/reset/confirm', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const code = String(req.body.code || '')
  const pin = String(req.body.pin || '')
  if (!/^\d{6}$/.test(code) || !/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'Enter the valid email code and a 4-digit PIN.' })
  const user = await User.findOne({ email }).select('+transactionPinHash')
  if (!user || !user.transactionPinResetRequired || !(await consumeResetCode({ userId: user._id, purpose: 'transaction_pin', code }))) {
    return res.status(400).json({ error: 'The reset code is invalid or expired.' })
  }
  user.transactionPinHash = await bcrypt.hash(pin, 12)
  user.transactionPinResetRequired = false
  await user.save()
  res.json({ success: true })
})

export { router as authRouter }