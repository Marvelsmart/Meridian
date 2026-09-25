import { connectDatabase } from './config/database.js'
import { createApp } from './app.js'
import { env } from './config/env.js'

if (!env.mongoUri || !env.jwtSecret || !env.managerCode) {
  throw new Error('MONGODB_URI, JWT_SECRET, and BANK_MANAGER_CODE must be configured.')
}

const app = createApp()
let databaseConnection

export async function handler(request, response) {
  databaseConnection ??= connectDatabase(env.mongoUri)
  await databaseConnection
  if (!request.url.startsWith('/api')) request.url = `/api${request.url.startsWith('/') ? '' : '/'}${request.url}`
  return app(request, response)
}