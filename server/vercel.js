import { connectDatabase } from './config/database.js'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { ensureDemoTransactions } from './seed-demo-transactions.js'

const app = createApp()
let databaseConnection

export async function handler(request, response) {
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

  const isHealthCheck = requestUrl.pathname === '/api/health'
  const isManagerCodeCheck = requestUrl.pathname === '/api/auth/manager-code/verify'
  if (isHealthCheck || isManagerCodeCheck) return app(request, response)

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

  try {
    databaseConnection ??= connectDatabase(env.mongoUri)
    await databaseConnection
    if (!requestUrl.pathname.startsWith('/api/auth/')) await ensureDemoTransactions()
  } catch (error) {
    databaseConnection = undefined
    console.error('Vercel API initialization failed:', error)
    response.statusCode = 503
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'The banking service is temporarily unavailable. Please try again shortly.' }))
    return
  }

  return app(request, response)
}