import crypto from 'node:crypto'
import { AccountResetToken } from '../models/index.js'
import { env } from '../config/env.js'

function hashCode(code) {
  return crypto.createHmac('sha256', env.jwtSecret).update(String(code)).digest('hex')
}

export async function sendResetCode(user, purpose) {
  if (!env.resendApiKey || !env.emailFrom) throw new Error('Account recovery email is not configured.')

  const code = crypto.randomInt(100000, 1000000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  await AccountResetToken.deleteMany({ owner: user._id, purpose })
  await AccountResetToken.create({ owner: user._id, purpose, tokenHash: hashCode(code), expiresAt })

  const title = purpose === 'password' ? 'Reset your password' : 'Reset your transaction PIN'
  const resetPath = purpose === 'password' ? '/reset-password' : '/reset-transaction-pin'
  const resetUrl = `${env.clientOrigin.replace(/\/$/, '')}/#${resetPath}?email=${encodeURIComponent(user.email)}&code=${code}`
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [user.email],
        subject: `${title} · Northstar`,
        html: `<p>${title}</p><p>This one-time code expires in 15 minutes:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p><a href="${resetUrl}">Continue securely</a></p><p>If you did not request this, contact customer care. Never share this code with anyone.</p>`,
      }),
    })
    if (!response.ok) throw new Error('Email delivery failed.')
  } catch (error) {
    await AccountResetToken.deleteMany({ owner: user._id, purpose, tokenHash: hashCode(code) })
    throw error
  }
  return expiresAt
}

export async function consumeResetCode({ userId, purpose, code }) {
  const token = await AccountResetToken.findOne({
    owner: userId,
    purpose,
    expiresAt: { $gt: new Date() },
  })
  if (!token) return false
  const expected = Buffer.from(token.tokenHash, 'hex')
  const supplied = Buffer.from(hashCode(code), 'hex')
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    token.attempts += 1
    if (token.attempts >= 5) await token.deleteOne()
    else await token.save()
    return false
  }
  await token.deleteOne()
  return true
}