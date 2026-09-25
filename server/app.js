import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { authRouter } from './routes/auth.js'
import { bankingRouter } from './routes/banking.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { env } from './config/env.js'

export function createApp() {
  const app = express()
  const allowedOrigins = new Set([env.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'])
  app.use(helmet())
  app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)) }))
  app.use(express.json({ limit: '100kb' }))
  app.use(morgan('tiny'))
  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRouter)
  app.use('/api', bankingRouter)
  app.use(notFound); app.use(errorHandler)
  return app
}
