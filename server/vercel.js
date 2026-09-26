import { connectDatabase } from './config/database.js'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { ensureDemoTransactions } from './seed-demo-transactions.js'

if (!env.mongoUri || !env.jwtSecret || !env.managerCode) {
  throw new Error('MONGODB_URI, JWT_SECRET, and BANK_MANAGER_CODE must be configured.')
}

const app = createApp()
let databaseConnection

export async function handler(request, response) {
  databaseConnection ??= connectDatabase(env.mongoUri)
  await databaseConnection
  await ensureDemoTransactions()
  const requestUrl = new URL(request.url, 'http://localhost')
  const rewrittenPath = requestUrl.searchParams.get('path')
  if (rewrittenPath) {
    requestUrl.pathname = `/api/${rewrittenPath.replace(/^\/+/, '')}`
    requestUrl.searchParams.delete('path')
    request.url = `${requestUrl.pathname}${requestUrl.search}`
  } else if (!requestUrl.pathname.startsWith('/api')) {
    requestUrl.pathname = `/api${requestUrl.pathname.startsWith('/') ? '' : '/'}${requestUrl.pathname}`
    request.url = `${requestUrl.pathname}${requestUrl.search}`
  }
  return app(request, response)
}