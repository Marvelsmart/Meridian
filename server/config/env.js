import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  managerCode: process.env.BANK_MANAGER_CODE || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminEmails: [...new Set([
    ...String(process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean),
    String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  ].filter(Boolean))],
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || '',
}