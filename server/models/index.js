import mongoose from 'mongoose'

const { Schema } = mongoose
const objectId = { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }

export const User = mongoose.model('User', new Schema({
  firstName: { type: String, required: true, trim: true }, lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true }, passwordHash: { type: String, required: true, select: false },
  transactionPinHash: { type: String, select: false }, role: { type: String, enum: ['customer'], default: 'customer' },
  verificationStatus: { type: String, enum: ['verified', 'pending', 'under_review', 'action_required'], default: 'pending' },
  security: { type: Schema.Types.Mixed, default: {} }, address: Schema.Types.Mixed, employment: Schema.Types.Mixed, demoDataSeededAt: Date,
}, { timestamps: true }))

export const Account = mongoose.model('Account', new Schema({
  owner: objectId, name: { type: String, required: true }, type: String, number: { type: String, required: true, unique: true },
  currency: { type: String, default: 'USD' }, balance: { type: Number, min: 0, default: 0 }, ledgerBalance: { type: Number, default: 0 },
  available: { type: Number, default: 0 }, primary: Boolean, bank: String, openedOn: Date, interestRate: Number, limits: Schema.Types.Mixed,
}, { timestamps: true }))

export const Transaction = mongoose.model('Transaction', new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true }, visibility: { type: String, enum: ['shared', 'private'], default: 'private', index: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', index: true }, type: { type: String, enum: ['credit', 'debit'], required: true },
  category: String, description: String, counterparty: Schema.Types.Mixed, amount: { type: Number, min: 0, required: true }, fee: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' }, status: { type: String, enum: ['successful', 'pending', 'failed', 'reversed'], default: 'successful' },
  date: { type: Date, default: Date.now, index: true }, reference: { type: String, unique: true, required: true }, direction: String, narration: String, meta: Schema.Types.Mixed,
  channel: String, cardId: String, signedAmount: Number, balanceAfter: Number,
}, { timestamps: true }))

export const Beneficiary = mongoose.model('Beneficiary', new Schema({ owner: objectId, name: String, nickname: String, bank: String, bankCode: String, accountNumber: String, favourite: Boolean, email: String, phone: String, type: String, lastPaidAt: Date, addedOn: Date, note: String }, { timestamps: true }))
export const Biller = mongoose.model('Biller', new Schema({ owner: { type: Schema.Types.ObjectId, ref: 'User', index: true }, visibility: { type: String, enum: ['shared', 'private'], default: 'shared' }, name: String, short: String, abbreviation: String, color: String, category: String, customerLabel: String, customerPlaceholder: String, customerPattern: String, customerHint: String, fee: Number, status: String, supportsMeterType: Boolean }, { timestamps: true }))
export const BillPayment = mongoose.model('BillPayment', new Schema({ owner: objectId, biller: { type: Schema.Types.ObjectId, ref: 'Biller' }, account: { type: Schema.Types.ObjectId, ref: 'Account' }, amount: Number, customerRef: String, status: String, reference: String, paidAt: Date }, { timestamps: true }))
export const Card = mongoose.model('Card', new Schema({ owner: objectId, account: { type: Schema.Types.ObjectId, ref: 'Account' }, nickname: String, holderName: String, panCiphertext: { type: String, select: false }, cvvCiphertext: { type: String, select: false }, last4: String, expiry: String, brand: String, scheme: String, type: String, currency: String, status: String, isDefault: Boolean, contactless: Boolean, limits: Schema.Types.Mixed, spendThisMonth: Number, issuedOn: Date, color: String }, { timestamps: true }))
export const Notification = mongoose.model('Notification', new Schema({ owner: objectId, category: String, title: String, body: String, read: Boolean, important: Boolean, actionLabel: String, actionPath: String, createdAt: { type: Date, default: Date.now } }))
export const Device = mongoose.model('Device', new Schema({ owner: objectId, deviceId: { type: String, required: true }, trusted: { type: Boolean, default: false }, lastSeenAt: Date }, { timestamps: true }))