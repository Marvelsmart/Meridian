import crypto from 'node:crypto'
import { env } from '../config/env.js'

const key = crypto.createHash('sha256').update(env.jwtSecret).digest()
export function encryptSecret(value) { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${ciphertext.toString('hex')}` }
export function decryptSecret(value) { const [ivHex, tagHex, ciphertextHex] = value.split(':'); const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex')); decipher.setAuthTag(Buffer.from(tagHex, 'hex')); return Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()]).toString('utf8') }