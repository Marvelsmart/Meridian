import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureAdminAccount } from './security/admin-bootstrap.js'

if (!env.mongoUri || !env.jwtSecret) {
	throw new Error('MONGODB_URI and JWT_SECRET must be configured.')
}

await connectDatabase(env.mongoUri)
await ensureAdminAccount()
createApp().listen(env.port, () => console.log(`Northstar API listening on http://localhost:${env.port}`))