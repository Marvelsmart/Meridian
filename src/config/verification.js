/**
 * Identity verification states (customer-facing naming).
 *
 * U.S. banks ask new customers for identifying information before opening an
 * account, so this feature is appropriate — but in this demo it is purely a
 * simulated front-end state. There is no SSN check, no document upload to a
 * real provider and no government or credit-bureau lookup.
 */
export const VERIFICATION_META = {
  verified: {
    label: 'Identity Verified',
    summary: 'Your identity has been successfully verified.',
    detail: 'You can transfer money, add beneficiaries and request cards without limits.',
    tone: 'success',
    badge: 'bg-success-50 text-success-700 ring-success-100',
    icon: 'badge-check',
  },
  pending: {
    label: 'Verification Pending',
    summary: "We're reviewing your information.",
    detail: 'Most reviews finish within one business day. You can keep exploring your account in the meantime.',
    tone: 'warning',
    badge: 'bg-warning-50 text-warning-600 ring-warning-100',
    icon: 'clock',
  },
  under_review: {
    label: 'Verification Under Review',
    summary: 'Your information is currently being reviewed.',
    detail: 'A specialist is checking the details you provided. We will email you as soon as it is complete.',
    tone: 'warning',
    badge: 'bg-brand-50 text-brand-700 ring-brand-100',
    icon: 'search',
  },
  action_required: {
    label: 'Verification Required',
    summary: 'Additional information is needed to complete verification.',
    detail: 'Confirm your name, address and date of birth so we can finish setting up your account.',
    tone: 'danger',
    badge: 'bg-danger-50 text-danger-700 ring-danger-100',
    icon: 'alert',
  },
}

export const DEFAULT_VERIFICATION_STATUS = 'verified'

export const VERIFICATION_OPTIONS = Object.entries(VERIFICATION_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

/** Safe lookup so an unknown status never breaks a screen. */
export function verificationMeta(status) {
  return VERIFICATION_META[status] ?? VERIFICATION_META[DEFAULT_VERIFICATION_STATUS]
}
