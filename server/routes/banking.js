import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { Account, Beneficiary, Biller, BillPayment, Card, Device, Notification, Transaction, User } from '../models/index.js'
import { requireAuth } from '../middleware/auth.js'
import { requireValidatedDevice } from '../middleware/device.js'
import { decryptSecret } from '../security/crypto.js'

const router = Router(); router.use(requireAuth)
const id = (value) => value && String(value)
const safeCard = (card) => { const data = card.toObject ? card.toObject() : card; const { panCiphertext, cvvCiphertext, ...safe } = data; return { ...safe, maskedNumber: `•••• •••• •••• ${data.last4}` } }
const amountSchema = z.object({ accountId: z.string(), amount: z.coerce.number().positive(), description: z.string().max(140).optional() })
const publicCard = (card) => safeCard(card)
const publicUser = (user) => { const { passwordHash, transactionPinHash, ...safe } = user.toObject ? user.toObject() : user; return safe }
const idString = (value) => value?._id ? String(value._id) : String(value)
const normalizeTransaction = (transaction) => ({ ...transaction, id: idString(transaction), accountId: transaction.account ? idString(transaction.account) : transaction.accountId, date: transaction.date ?? transaction.createdAt })
const normalizeAccount = (account) => ({ ...account, id: idString(account) })

router.get('/app-data', async (req, res) => {
  const owner = req.user._id
  const [accounts, privateTransactions, sharedTransactions, beneficiaries, cards, notifications, devices] = await Promise.all([
    Account.find({ owner }).lean(), Transaction.find({ owner, visibility: 'private' }).sort({ date: -1 }).lean(), Transaction.find({ visibility: 'shared' }).sort({ date: -1 }).lean(),
    Beneficiary.find({ owner }).lean(), Card.find({ owner }).select('+panCiphertext').lean(), Notification.find({ owner }).sort({ createdAt: -1 }).lean(), Device.find({ owner }).lean(),
  ])
  res.json({ user: publicUser(req.user), accounts: accounts.map(normalizeAccount), transactions: [...privateTransactions, ...sharedTransactions].map(normalizeTransaction), beneficiaries, cards: cards.map(publicCard), notifications, sessions: devices })
})

router.get('/accounts', async (req, res) => res.json((await Account.find({ owner: req.user._id }).lean()).map(normalizeAccount)))
router.get('/transactions', async (req, res) => {
  const filter = { $or: [{ visibility: 'shared' }, { owner: req.user._id, visibility: 'private' }] }
  const items = (await Transaction.find(filter).sort({ date: -1 }).lean()).map(normalizeTransaction); res.json({ items, total: items.length, page: 1, pageSize: items.length, pageCount: 1 })
})
router.get('/transactions/:transactionId', async (req, res) => { const item = await Transaction.findOne({ _id: req.params.transactionId, $or: [{ visibility: 'shared' }, { owner: req.user._id }] }).lean(); if (!item) return res.status(404).json({ error: 'Transaction not found' }); res.json(normalizeTransaction(item)) })
router.get('/notifications', async (req, res) => res.json(await Notification.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean()))
router.get('/beneficiaries', async (req, res) => res.json(await Beneficiary.find({ owner: req.user._id }).lean()))
router.post('/beneficiaries', async (req, res) => res.status(201).json(await Beneficiary.create({ ...req.body, owner: req.user._id })))
router.patch('/beneficiaries/:id', async (req, res) => { const item = await Beneficiary.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: req.body }, { new: true }); if (!item) return res.status(404).json({ error: 'Beneficiary not found' }); res.json(item) })
router.delete('/beneficiaries/:id', async (req, res) => { const result = await Beneficiary.deleteOne({ _id: req.params.id, owner: req.user._id }); if (!result.deletedCount) return res.status(404).json({ error: 'Beneficiary not found' }); res.json({ id: req.params.id }) })
router.patch('/beneficiaries/:id/favourite', async (req, res) => { const item = await Beneficiary.findOne({ _id: req.params.id, owner: req.user._id }); if (!item) return res.status(404).json({ error: 'Beneficiary not found' }); item.favourite = !item.favourite; await item.save(); res.json(item) })
router.get('/billers', async (req, res) => res.json(await Biller.find({ $or: [{ visibility: 'shared' }, { owner: req.user._id }] }).lean()))

async function movement(req, res, next, category, direction) {
  try {
    const input = amountSchema.parse(req.body); const account = await Account.findOne({ _id: input.accountId, owner: req.user._id }); if (!account) return res.status(404).json({ error: 'Account not found' })
    const signed = direction === 'credit' ? input.amount : -input.amount; if (direction === 'debit' && account.available < input.amount) return res.status(422).json({ error: 'Insufficient available balance' })
    const reference = `${category.slice(0, 3).toUpperCase()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`; account.balance = Number((account.balance + signed).toFixed(2)); account.ledgerBalance = account.balance; account.available = account.balance; await account.save()
    const transaction = await Transaction.create({ owner: req.user._id, visibility: 'private', account: account._id, type: direction, direction, category, description: input.description || category, amount: input.amount, reference, counterparty: req.body.recipient || req.body.provider || null, fee: Number(req.body.fee || 0), narration: req.body.narration || input.description })
    if (category === 'bills') await BillPayment.create({ owner: req.user._id, account: account._id, amount: input.amount, customerRef: req.body.customerRef, status: 'successful', reference, paidAt: new Date() })
    res.status(201).json({ transaction: normalizeTransaction(transaction.toObject()), account: normalizeAccount(account.toObject()) })
  } catch (error) { next(error) }
}
router.post('/transfers', requireValidatedDevice, (req, res, next) => movement(req, res, next, 'transfer', 'debit'))
router.post('/bill-payments', requireValidatedDevice, (req, res, next) => movement(req, res, next, 'bills', 'debit'))
router.post('/add-funds', requireValidatedDevice, (req, res, next) => movement(req, res, next, 'income', 'credit'))
router.post('/withdrawals', requireValidatedDevice, (req, res, next) => movement(req, res, next, 'withdrawal', 'debit'))

router.patch('/cards/:id/freeze', requireValidatedDevice, async (req, res) => { const card = await Card.findOne({ _id: req.params.id, owner: req.user._id }); if (!card) return res.status(404).json({ error: 'Card not found' }); card.status = card.status === 'frozen' ? 'active' : 'frozen'; await card.save(); res.json(safeCard(card)) })
router.patch('/cards/:id', async (req, res) => { const card = await Card.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: req.body }, { new: true }); if (!card) return res.status(404).json({ error: 'Card not found' }); res.json(safeCard(card)) })
router.post('/cards', async (req, res) => { const account = await Account.findOne({ owner: req.user._id, primary: true }); if (!account) return res.status(404).json({ error: 'Account not found' }); const last4 = String(Math.floor(1000 + Math.random() * 9000)); const card = await Card.create({ owner: req.user._id, account: account._id, nickname: req.body.nickname || 'Online card', holderName: `${req.user.firstName} ${req.user.lastName}`.toUpperCase(), last4, expiry: '12/30', brand: 'Visa', type: req.body.type === 'virtual' ? 'Virtual' : 'Physical', currency: req.body.currency || 'USD', status: req.body.type === 'virtual' ? 'active' : 'processing', contactless: req.body.type !== 'virtual', limits: {} }); res.status(201).json(safeCard(card)) })

router.get('/cards', async (req, res) => res.json((await Card.find({ owner: req.user._id }).lean()).map(safeCard)))
router.post('/cards/reveal', requireValidatedDevice, async (req, res) => { const card = await Card.findOne({ _id: req.body.cardId, owner: req.user._id }).select('+panCiphertext +cvvCiphertext'); if (!card) return res.status(404).json({ error: 'Card not found' }); res.json({ cardId: card.id, pan: decryptSecret(card.panCiphertext), cvv: decryptSecret(card.cvvCiphertext), expiry: card.expiry }) })
router.get('/devices', async (req, res) => res.json(await Device.find({ owner: req.user._id }).lean()))
router.post('/devices/:deviceId/validate', async (req, res) => { const device = await Device.findOneAndUpdate({ owner: req.user._id, deviceId: req.params.deviceId }, { trusted: true, lastSeenAt: new Date() }, { new: true }); if (!device) return res.status(404).json({ error: 'Device not found' }); res.json(device) })
router.delete('/devices/others', async (req, res) => { await Device.deleteMany({ owner: req.user._id, deviceId: { $ne: req.deviceId } }); res.json(await Device.find({ owner: req.user._id }).lean()) })
router.delete('/devices/:id', async (req, res) => { await Device.deleteOne({ _id: req.params.id, owner: req.user._id }); res.json({ success: true }) })

router.patch('/notifications/:id', async (req, res) => { const item = await Notification.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: { read: Boolean(req.body.read) } }, { new: true }); if (!item) return res.status(404).json({ error: 'Notification not found' }); res.json(item) })
router.post('/notifications/read-all', async (req, res) => { await Notification.updateMany({ owner: req.user._id }, { $set: { read: true } }); res.json(await Notification.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean()) })
router.delete('/notifications/:id', async (req, res) => { await Notification.deleteOne({ _id: req.params.id, owner: req.user._id }); res.json({ id: req.params.id }) })
router.patch('/profile', async (req, res) => { const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true }); res.json(publicUser(user)) })
router.patch('/security', async (req, res) => { const user = await User.findByIdAndUpdate(req.user._id, { $set: { security: req.body } }, { new: true }); res.json(user.security) })
router.get('/statements', async (req, res) => { const filter = { $or: [{ visibility: 'shared' }, { owner: req.user._id, visibility: 'private' }] }; const items = (await Transaction.find(filter).sort({ date: 1 }).lean()).map(normalizeTransaction); res.json({ transactions: items, generatedAt: new Date().toISOString() }) })

export { router as bankingRouter }