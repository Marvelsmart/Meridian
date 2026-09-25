import { BRAND } from '@/lib/constants'

/**
 * Customer support configuration.
 *
 * WHATSAPP_SUPPORT_NUMBER is intentionally empty: the real support number will
 * be supplied later. Fill it in with the full international format **digits
 * only**, no "+", spaces or dashes (e.g. '13125550148' for +1 312 555 0148) and
 * every "Chat with Support" button in the app starts working — no component
 * changes required.
 */
export const WHATSAPP_SUPPORT_NUMBER = ''

/** Message pre-filled when the customer taps "Chat with Support". */
export const WHATSAPP_SUPPORT_MESSAGE =
  `Hello ${BRAND.name} support, I need help with my account.`

/** digits-only form of the configured number (null when it is not set yet). */
export function normalizedWhatsAppNumber() {
  const digits = String(WHATSAPP_SUPPORT_NUMBER ?? '').replace(/\D/g, '')
  return digits.length >= 7 ? digits : null
}

export function isWhatsAppSupportConfigured() {
  return normalizedWhatsAppNumber() !== null
}

/**
 * Deep link that opens WhatsApp with the support chat pre-filled.
 * Returns null while the number is still a placeholder so the UI can show an
 * honest "not configured yet" state instead of an invented number.
 */
export function buildWhatsAppSupportLink({ message = WHATSAPP_SUPPORT_MESSAGE } = {}) {
  const number = normalizedWhatsAppNumber()
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

/** Human-readable support channels (phone/email already exist in the demo). */
export const SUPPORT_CHANNELS = {
  phone: BRAND.supportPhone,
  email: BRAND.supportEmail,
  hours: 'Monday to Friday, 7:00 AM – 9:00 PM (PT)',
}
