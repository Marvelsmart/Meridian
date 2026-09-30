import { connectDatabase } from './config/database.js'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { ensureDemoTransactions } from './seed-demo-transactions.js'
import { ensureAdminAccount } from './security/admin-bootstrap.js'

const app = createApp()
let databaseConnection

export async function handler(request, response) {
  const missingVariables = [
    !env.mongoUri && 'MONGODB_URI',
    !env.jwtSecret && 'JWT_SECRET',
  ].filter(Boolean)
  if (missingVariables.length) {
    response.statusCode = 503
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({
      error: 'The API is not configured for this deployment.',
      missingEnvironmentVariables: missingVariables,
    }))
    return
  }

  databaseConnection ??= connectDatabase(env.mongoUri)
  await databaseConnection
  await ensureAdminAccount()
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