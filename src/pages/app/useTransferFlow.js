import { useEffect, useState } from 'react'
import * as api from '@/lib/api'
import { BANKS } from '@/data/banks'
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
export function useTransferFlow({ accounts, activeAccount, actions, searchParams }) {
  const [mode, setMode] = useState(searchParams.get('mode') === 'other-bank' ? 'new' : 'saved')
  const [step, setStep] = useState('recipient')
  const [accountId, setAccountId] = useState(activeAccount?.id ?? accounts[0]?.id)
  const [recipient, setRecipient] = useState(null)
  const [amount, setAmount] = useState(searchParams.get('amount') ?? '')
  const [narration, setNarration] = useState('')
  const [saveBeneficiary, setSaveBeneficiary] = useState(false)
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [processingIndex, setProcessingIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({ bankCode: '', accountNumber: '' })
  const [formErrors, setFormErrors] = useState({})
  const [resolving, setResolving] = useState(false)
  const [deviceBlocked, setDeviceBlocked] = useState(false)

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount
  const fee = transferFee(amount)
  const amountValue = Number(amount) || 0
  const total = amountValue + fee
  const stepIndex = TRANSFER_STEPS.findIndex((item) => item.value === step)

  useEffect(() => {
    const accountNumber = searchParams.get('account')
    const name = searchParams.get('name')
    if (accountNumber && name) {
      setRecipient({ name, accountNumber, bank: 'Northstar Bank', bankCode: '000014' })
      setForm({ bankCode: '000014', accountNumber })
      setMode('new')
    }
  }, [searchParams])

  const resolveRecipient = async () => {
    setFormErrors({})
    setError(null)
    setResolving(true)
    try {
      const resolved = await api.resolveAccountName(form)
      const bank = BANKS.find((item) => item.code === form.bankCode)
      setRecipient({ ...resolved, bank: bank?.name ?? resolved.bank ?? 'Bank transfer', bankCode: form.bankCode })
      return true
    } catch (err) {
      setFormErrors(err.fields ?? {})
      setError(err.message)
      setRecipient(null)
      return false
    } finally {
      setResolving(false)
    }
  }

  const goNext = () => {
    if (step === 'recipient' && !recipient) {
      setError('Choose a saved beneficiary or resolve a new account before continuing.')
      return
    }
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
      const [response] = await Promise.all([
        actions.transfer({ accountId, amount, narration, recipient, beneficiaryId: recipient.id ?? null }),
        new Promise((resolve) => setTimeout(resolve, 2900)),
      ])

      if (saveBeneficiary && !recipient.id) {
        await actions
          .addBeneficiary({
            name: recipient.name,
            nickname,
            bank: recipient.bank,
            bankCode: recipient.bankCode,
            accountNumber: recipient.accountNumber,
            favourite: true,
          })
          .catch(() => null)
      }

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
    setDeviceBlocked(true)
    return true
  }

  const resetFlow = () => {
    setRecipient(null)
    setAmount('')
    setNarration('')
    setPin('')
    setResult(null)
    setError(null)
    setMode('saved')
    setStep('recipient')
  }

  return {
    mode,
    setMode,
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
    saveBeneficiary,
    setSaveBeneficiary,
    nickname,
    setNickname,
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
    resolving,
    deviceBlocked,
    selectedAccount,
    fee,
    total,
    amountValue,
    resolveRecipient,
    goNext,
    goBack,
    submitTransfer,
    beginAuthorization,
    resetFlow,
  }
}

