import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { User } from '../models/index.js'

export async function ensureAdminAccount() {
  if (!env.adminEmail || !env.adminPassword) return null
  if (env.adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.')

  let user = await User.findOne({ email: env.adminEmail }).select('+passwordHash')
  if (!user) {
    user = new User({
      firstName: 'Admin',
      lastName: 'Account',
      email: env.adminEmail,
      phone: '0000000000',
      passwordHash: await bcrypt.hash(env.adminPassword, 12),
      role: 'admin',
      verificationStatus: 'verified',
    })
    await user.save()
    return user
  }

  let changed = false
  if (user.role !== 'admin') {
    user.role = 'admin'
    changed = true
  }
  if (!(await bcrypt.compare(env.adminPassword, user.passwordHash))) {
    user.passwordHash = await bcrypt.hash(env.adminPassword, 12)
    user.authVersion = Number(user.authVersion || 0) + 1
    changed = true
  }
  if (changed) await user.save()
  return user
}