import { useEffect, useState } from 'react'

/**
 * Shared state machine for the small modal flows (add money, withdraw):
 * form → processing → success, with inline field errors from the API.
 */
export function useMoneyFlow(open) {
  const [step, setStep] = useState('form')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (open) {
      setStep('form')
      setError(null)
      setResult(null)
    }
  }, [open])

  const run = async (action) => {
    setStep('processing')
    setError(null)
    try {
      const response = await action()
      setResult(response)
      setStep('success')
      return response
    } catch (err) {
      setError(err)
      setStep('form')
      return null
    }
  }

  return { step, setStep, error, setError, result, run, isForm: step === 'form', isProcessing: step === 'processing', isSuccess: step === 'success' }
}
