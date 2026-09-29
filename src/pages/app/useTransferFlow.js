import { useState } from 'react'
import * as api from '@/lib/api'
import { formatCurrency } from '@/lib/format'

export const TRANSFER_STEPS = [
  { value: 'recipient', label: 'Recipient' },
  { value: 'amount', label: 'Amount' },
  { value: 'description', label: 'Description' },
  { value: 'review', label: 'Review' },
  { value: 'confirm', label: 'Confirm' },
]

export const PROCESSING_STEPS = [
  'Validating recipient details',
  'Debiting your account',
  'Crediting the beneficiary bank',
  'Confirming settlement',
]

function transferFee(amount) {
  const value = Number(amount) || 0
  if (value <= 0) return 0
  if (value <= 5000) return 10
  if (value <= 50000) return 25
  return 50
}

/**
 * State machine for the transfer journey:
 * recipient → amount → description → review → confirm → processing → success.
 * Kept out of the page component so the screens stay presentational.
 */
export function useTransferFlow({ accounts, activeAccount, actions, searchParams, deviceValidated, onDeviceValidated }) {
  const [step, setStep] = useState('recipient')
  const [accountId, setAccountId] = useState(activeAccount?.id ?? accounts[0]?.id)
  const [recipient, setRecipient] = useState(null)
  const [amount, setAmount] = useState(searchParams.get('amount') ?? '')
  const [narration, setNarration] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [processingIndex, setProcessingIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({ name: '', bank: '', routingNumber: '', sortingCode: '', accountNumber: '', accountType: '' })
  const [formErrors, setFormErrors] = useState({})
  const [deviceBlocked, setDeviceBlocked] = useState(false)

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount
  const fee = transferFee(amount)
  const amountValue = Number(amount) || 0
  const total = amountValue + fee
  const stepIndex = TRANSFER_STEPS.findIndex((item) => item.value === step)

  const recipientDetailsValid = ['name', 'bank', 'routingNumber', 'sortingCode', 'accountNumber', 'accountType']
    .every((key) => String(form[key] ?? '').trim())
    && /^\d{9}$/.test(form.routingNumber)
    && /^\d{6,8}$/.test(form.sortingCode)
    && form.accountNumber.trim().length >= 4

  const goNext = () => {
    if (step === 'recipient' && !recipientDetailsValid) {
      const errors = Object.fromEntries(['name', 'bank', 'routingNumber', 'sortingCode', 'accountNumber', 'accountType']
        .filter((key) => !String(form[key] ?? '').trim())
        .map((key) => [key, 'This field is required.']))
      if (form.routingNumber && !/^\d{9}$/.test(form.routingNumber)) errors.routingNumber = 'Enter a 9-digit routing number.'
      if (form.sortingCode && !/^\d{6,8}$/.test(form.sortingCode)) errors.sortingCode = 'Enter a 6 to 8 digit sorting code.'
      if (form.accountNumber && form.accountNumber.trim().length < 4) errors.accountNumber = 'Enter at least 4 characters.'
      setFormErrors(errors)
      setError('Enter all recipient bank details to continue.')
      return
    }
    if (step === 'recipient') setRecipient({ ...form, name: form.name.trim(), bank: form.bank.trim() })
    setFormErrors({})
    if (step === 'amount') {
      if (!amountValue) return setError('Enter an amount to continue.')
      if (amountValue < 100) return setError('The minimum transfer amount is $100.')
      if (amountValue > selectedAccount.available) return setError('That amount is more than your available balance.')
      if (amountValue > selectedAccount.limits.singleTransfer) {
        return setError(
          `Single transfers on this account are limited to ${formatCurrency(selectedAccount.limits.singleTransfer)}.`,
        )
      }
    }
    if (step === 'description' && !narration.trim()) {
      return setError('Add a short description so you recognise this transfer later.')
    }
    setError(null)
    setStep(TRANSFER_STEPS[stepIndex + 1].value)
  }

  const goBack = () => {
    setError(null)
    if (stepIndex <= 0) return false
    setStep(TRANSFER_STEPS[stepIndex - 1].value)
    return true
  }

  const submitTransfer = async () => {
    if (pin.length !== 4) {
      setError('Enter your 4-digit transaction PIN to authorise this transfer.')
      return null
    }
    setError(null)
    setDeviceBlocked(false)
    setStep('processing')
    setProcessingIndex(0)
    const ticker = setInterval(
      () => setProcessingIndex((index) => Math.min(index + 1, PROCESSING_STEPS.length - 1)),
      700,
    )
    try {
      if (deviceValidated === false) {
        await api.validateCurrentDevice(pin)
        onDeviceValidated?.()
      }
      const [response] = await Promise.all([
        actions.transfer({ accountId, amount, narration, recipientDetails: recipient, pin }),
        new Promise((resolve) => setTimeout(resolve, 2900)),
      ])

      setResult(response.transaction)
      setStep('success')
      return response.transaction
    } catch (err) {
      setDeviceBlocked(err.code === 'device_not_validated')
      setError(err.message)
      setStep('confirm')
      return null
    } finally {
      clearInterval(ticker)
    }
  }

  const beginAuthorization = () => {
    setStep('confirm')
    return true
  }

  const resetFlow = () => {
    setRecipient(null)
    setForm({ name: '', bank: '', routingNumber: '', sortingCode: '', accountNumber: '', accountType: '' })
    setFormErrors({})
    setAmount('')
    setNarration('')
    setPin('')
    setResult(null)
    setError(null)
    setStep('recipient')
  }

  return {
    step,
    setStep,
    stepIndex,
    accountId,
    setAccountId,
    recipient,
    setRecipient,
    amount,
    setAmount,
    narration,
    setNarration,
    pin,
    setPin,
    error,
    setError,
    processingIndex,
    result,
    form,
    setForm,
    formErrors,
    setFormErrors,
    recipientDetailsValid,
    deviceBlocked,
    selectedAccount,
    fee,
    total,
    amountValue,
    goNext,
    goBack,
    submitTransfer,
    beginAuthorization,
    resetFlow,
  }
}

