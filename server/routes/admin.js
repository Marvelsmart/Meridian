import { Router } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { z } from 'zod'
import { Account, AccountResetToken, AdminAuditLog, Beneficiary, Biller, BillPayment, Card, Device, Notification, SupportConversation, SupportMessage, Transaction, User } from '../models/index.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { env } from '../config/env.js'
import { sendResetCode } from '../security/account-reset.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const verificationStatus = z.enum(['verified', 'pending', 'under_review', 'action_required'])
const ordinaryCustomerFilter = { role: 'customer', email: { $nin: env.adminEmails } }
const customerPatch = z.object({
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().transform((email) => email.toLowerCase()).optional(),
  phone: z.string().trim().min(7).max(24).optional(),
  address: z.record(z.string(), z.unknown()).optional(),
  verificationStatus: verificationStatus.optional(),
}).strict()
const createCustomerSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().email().transform((email) => email.toLowerCase()),
  phone: z.string().trim().min(7).max(24),
  address: z.string().trim().max(160).optional().default(''),
}).strict()

const recordAdminAction = (req, action, targetType, targetId, details = {}) => AdminAuditLog.create({
  actor: req.user._id,
  action,
  targetType,
  targetId: String(targetId),
  details,
})

function safeCustomer(user) {
  const { passwordHash, transactionPinHash, ...safe } = user
  return { ...safe, hasTransactionPin: Boolean(transactionPinHash) }
}

router.get('/customers', async (req, res) => {
  const users = await User.find(ordinaryCustomerFilter)
    .select('firstName lastName email phone address verificationStatus transactionPinResetRequired passwordResetRequired createdAt +transactionPinHash')
    .sort({ createdAt: -1 })
    .limit(250)
    .lean()
  res.json({ customers: users.map(safeCustomer) })
})

router.post('/customers', async (req, res) => {
  const input = createCustomerSchema.parse(req.body)
  if (env.adminEmails.includes(input.email)) return res.status(400).json({ error: 'Administrator emails cannot be created as customer accounts.' })
  const temporaryPassword = crypto.randomBytes(32).toString('hex')
  let user
  let account
  try {
    user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      passwordResetRequired: true,
      transactionPinResetRequired: true,
      address: input.address ? { street: input.address } : undefined,
      verificationStatus: 'pending',
    })
    account = await Account.create({
      owner: user._id,
      name: 'Everyday Checking',
      type: 'checking',
      number: `0${crypto.randomInt(100000000, 999999999)}`,
      balance: 0,
      ledgerBalance: 0,
      available: 0,
      primary: true,
      bank: 'Nortwest Bank',
      openedOn: new Date(),
      currency: 'USD',
      limits: { dailyTransfer: 20000 },
    })
    await sendResetCode(user, 'password')
    await sendResetCode(user, 'transaction_pin')
  } catch (error) {
    if (user) {
      await Promise.all([
        AccountResetToken.deleteMany({ owner: user._id }),
        Account.deleteMany({ owner: user._id }),
        User.deleteOne({ _id: user._id }),
      ])
    }
    throw error
  }
  await recordAdminAction(req, 'customer.created', 'customer', user._id, { email: user.email })
  res.status(201).json({ customer: safeCustomer({ ...user.toObject(), transactionPinHash: undefined }), account: { id: account.id, balance: account.balance } })
})

router.patch('/customers/:id', async (req, res) => {
  const patch = customerPatch.parse(req.body)
  if (patch.email && env.adminEmails.includes(patch.email)) return res.status(400).json({ error: 'Customer email cannot be assigned an administrator address.' })
  const user = await User.findOneAndUpdate({ _id: req.params.id, ...ordinaryCustomerFilter }, { $set: patch }, { new: true, runValidators: true })
    .select('+transactionPinHash')
    .lean()
  if (!user) return res.status(404).json({ error: 'Customer not found.' })
  await recordAdminAction(req, 'customer.updated', 'customer', user._id, { fields: Object.keys(patch) })
  res.json({ customer: safeCustomer(user) })
})

router.post('/customers/:id/reset-pin', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, ...ordinaryCustomerFilter }).select('+transactionPinHash')
  if (!user) return res.status(404).json({ error: 'Customer not found.' })
  const previousPinHash = user.transactionPinHash
  user.transactionPinHash = undefined
  user.transactionPinResetRequired = true
  await user.save()
  try {
    await sendResetCode(user, 'transaction_pin')
  } catch (error) {
    user.transactionPinHash = previousPinHash
    user.transactionPinResetRequired = false
    await user.save()
    throw error
  }
  await recordAdminAction(req, 'customer.pin_reset_flagged', 'customer', user._id)
  await Notification.create({ owner: user._id, category: 'security', title: 'Transaction PIN reset required', body: 'A one-time PIN reset link was sent to your email address.', read: false, important: true })
  res.json({ success: true })
})

router.post('/customers/:id/reset-password', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, ...ordinaryCustomerFilter })
  if (!user) return res.status(404).json({ error: 'Customer not found.' })
  user.passwordResetRequired = true
  user.authVersion = Number(user.authVersion || 0) + 1
  await user.save()
  try {
    await sendResetCode(user, 'password')
  } catch (error) {
    user.passwordResetRequired = false
    user.authVersion = Math.max(0, Number(user.authVersion || 0) - 1)
    await user.save()
    throw error
  }
  await recordAdminAction(req, 'customer.password_reset_flagged', 'customer', user._id)
  await Notification.create({ owner: user._id, category: 'security', title: 'Password reset required', body: 'A one-time password reset link was sent to your email address.', read: false, important: true })
  res.json({ success: true })
})

router.delete('/customers/:id', async (req, res) => {
  const input = z.object({ confirmEmail: z.string().email().transform((email) => email.toLowerCase()) }).strict().parse(req.body)
  const session = await mongoose.startSession()
  let deletedCounts = {}
  let responseError = null
  try {
    await session.withTransaction(async () => {
      deletedCounts = {}
      responseError = null
      const user = await User.findOne({ _id: req.params.id, ...ordinaryCustomerFilter }).session(session)
      if (!user) {
        responseError = { status: 404, error: 'Customer not found.' }
        return
      }
      if (input.confirmEmail !== user.email) {
        responseError = { status: 400, error: 'Confirmation email does not match the selected customer.' }
        return
      }

      const conversations = await SupportConversation.find({ owner: user._id }).select('_id').session(session).lean()
      const conversationIds = conversations.map(({ _id }) => _id)
      const deletions = [
        ['resetTokens', AccountResetToken.deleteMany({ owner: user._id }, { session })],
        ['accounts', Account.deleteMany({ owner: user._id }, { session })],
        ['transactions', Transaction.deleteMany({ owner: user._id }, { session })],
        ['beneficiaries', Beneficiary.deleteMany({ owner: user._id }, { session })],
        ['billers', Biller.deleteMany({ owner: user._id }, { session })],
        ['billPayments', BillPayment.deleteMany({ owner: user._id }, { session })],
        ['cards', Card.deleteMany({ owner: user._id }, { session })],
        ['devices', Device.deleteMany({ owner: user._id }, { session })],
        ['notifications', Notification.deleteMany({ owner: user._id }, { session })],
        ['supportMessages', SupportMessage.deleteMany({ $or: [{ owner: user._id }, { conversation: { $in: conversationIds } }] }, { session })],
        ['supportConversations', SupportConversation.deleteMany({ owner: user._id }, { session })],
      ]
      for (const [name, operation] of deletions) {
        const result = await operation
        deletedCounts[name] = result.deletedCount
      }
      await AdminAuditLog.updateMany({ targetType: 'customer', targetId: String(user._id), 'details.email': user.email }, { $unset: { 'details.email': 1 } }, { session })
      await User.deleteOne({ _id: user._id }, { session })
      await AdminAuditLog.create([{ actor: req.user._id, action: 'customer.deleted', targetType: 'customer', targetId: String(user._id), details: deletedCounts }], { session })
    })
  } finally {
    await session.endSession()
  }
  if (responseError) return res.status(responseError.status).json({ error: responseError.error })
  res.json({ success: true, deletedCounts })
})

router.get('/card-requests', async (req, res) => {
  const cards = await Card.find({ status: { $in: ['freeze_pending', 'unfreeze_pending'] } })
    .populate('owner', 'firstName lastName email')
    .sort({ freezeRequestedAt: 1 })
    .lean()
  res.json({ cards: cards.map(({ panCiphertext, cvvCiphertext, ...card }) => card) })
})

router.post('/card-requests/:id/review', async (req, res) => {
  const decision = z.object({ decision: z.enum(['approve', 'reject']) }).parse(req.body).decision
  const card = await Card.findById(req.params.id)
  if (!card || !['freeze_pending', 'unfreeze_pending'].includes(card.status)) return res.status(404).json({ error: 'Pending card request not found.' })
  const wasFreeze = card.status === 'freeze_pending'
  card.status = decision === 'approve' ? (wasFreeze ? 'frozen' : 'active') : (wasFreeze ? 'active' : 'frozen')
  card.freezeRequestedAt = undefined
  await card.save()
  const outcome = decision === 'approve' ? 'approved' : 'declined'
  await recordAdminAction(req, `card.${wasFreeze ? 'freeze' : 'unfreeze'}_${outcome}`, 'card', card._id, { status: card.status })
  await Notification.create({ owner: card.owner, category: 'card', title: `Card ${wasFreeze ? 'freeze' : 'unfreeze'} request ${decision === 'approve' ? 'approved' : 'declined'}`, body: `${card.nickname || 'Your card'} status is now ${card.status}.`, read: false, important: true })
  res.json({ card })
})

router.get('/support/conversations', async (req, res) => {
  const conversations = await SupportConversation.find(req.query.status === 'closed' ? { status: 'closed' } : req.query.status === 'all' ? {} : { status: 'open' })
    .populate('owner', 'firstName lastName email')
    .sort({ lastMessageAt: -1 })
    .limit(300)
    .lean()
  res.json({ conversations })
})

router.get('/support/conversations/:id/messages', async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id)
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  conversation.unreadForAdmin = 0
  await conversation.save()
  const messages = await SupportMessage.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(200).lean()
  res.json({ messages: messages.reverse(), conversation })
})

router.post('/support/conversations/:id/messages', async (req, res) => {
  const input = z.object({ body: z.string().trim().min(1).max(4000) }).strict().parse(req.body)
  const conversation = await SupportConversation.findById(req.params.id)
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  const message = await SupportMessage.create({ conversation: conversation._id, owner: conversation.owner, sender: req.user._id, senderRole: 'admin', body: input.body })
  conversation.status = 'open'
  conversation.lastMessage = input.body
  conversation.lastMessageAt = message.createdAt
  conversation.lastMessageFrom = 'admin'
  conversation.unreadForCustomer += 1
  conversation.unreadForAdmin = 0
  await conversation.save()
  res.status(201).json({ conversation, message })
})

router.patch('/support/conversations/:id', async (req, res) => {
  const { status } = z.object({ status: z.enum(['open', 'closed']) }).strict().parse(req.body)
  const conversation = await SupportConversation.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  res.json({ conversation })
})

export { router as adminRouter }