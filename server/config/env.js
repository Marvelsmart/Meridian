import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  managerCode: process.env.BANK_MANAGER_CODE || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  whatsappSupportNumber: process.env.WHATSAPP_SUPPORT_NUMBER || '',
}