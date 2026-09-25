import { useEffect, useState } from 'react'

/**
 * Shared state machine for the small modal flows (add money, withdraw):
 * form → processing → success, with inline field errors from the API.
 */
export function useMoneyFlow(open) {
  const [step, setStep] = useState('form')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [deviceBlocked, setDeviceBlocked] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('form')
      setError(null)
      setDeviceBlocked(false)
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
      setDeviceBlocked(err.code === 'device_not_validated')
      setError(err)
      setStep('form')
      return null
    }
  }

  return { step, setStep, error, setError, result, run, deviceBlocked, setDeviceBlocked, isForm: step === 'form', isProcessing: step === 'processing', isSuccess: step === 'success' }
}
