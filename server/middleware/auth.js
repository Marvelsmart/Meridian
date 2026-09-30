import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/index.js'

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub).lean()
    if (!user) return res.status(401).json({ error: 'Authentication required' })
    if ((payload.ver ?? 0) !== Number(user.authVersion ?? 0)) return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    req.user = user
    req.deviceId = payload.jti || req.headers['x-device-id'] || `session:${payload.sub}`
    return next()
  } catch { return res.status(401).json({ error: 'Invalid or expired authentication token' }) }
}

export function signToken(user, deviceId) {
  return jwt.sign({ sub: String(user._id), jti: deviceId, ver: Number(user.authVersion ?? 0) }, env.jwtSecret, { expiresIn: '2h' })
}

export function requireAdmin(req, res, next) {
  const email = String(req.user?.email || '').toLowerCase()
  if (!email || !env.adminEmails.includes(email)) return res.status(403).json({ error: 'Administrator access required.' })
  return next()
}