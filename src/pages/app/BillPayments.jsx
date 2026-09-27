import { useEffect, useMemo, useState } from 'react'
import { Droplets, ReceiptText, Tv, Wifi, Zap } from 'lucide-react'
import { AccountSelect } from '@/components/banking'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { BILL_CATEGORIES, BILL_PROVIDERS, providersByCategory, SAVED_BILLS } from '@/data/bills'
import { formatCurrency } from '@/lib/format'
import { Button, Card, Input, SectionCard, Select, Tabs } from '@/components/ui'

const CATEGORY_ICONS = {
  electricity: Zap,
  internet: Wifi,
  cable: Tv,
  water: Droplets,
  other: ReceiptText,
}

export default function BillPayments() {
  useDocumentTitle('Bill payments')
  const { accounts, activeAccount, actions } = useAppData()
  const toast = useToast()
  const [category, setCategory] = useState('electricity')
  const [providerId, setProviderId] = useState('')
  const [accountId, setAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? '')
  const [customerRef, setCustomerRef] = useState('')
  const [amount, setAmount] = useState('')
  const [meterType, setMeterType] = useState('prepaid')
  const [submitting, setSubmitting] = useState(false)

  const providers = useMemo(() => providersByCategory(category), [category])

  useEffect(() => {
    if (!providers.length) return
    setProviderId((current) => (providers.some((provider) => provider.id === current) ? current : providers[0].id))
  }, [providers])

  const selectedProvider = providers.find((provider) => provider.id === providerId) ?? providers[0] ?? null
  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount ?? accounts[0] ?? null

  const handleQuickFill = (bill) => {
    const provider = BILL_PROVIDERS.find((item) => item.id === bill.providerId)
    if (!provider) return
    setCategory(provider.category)
    setProviderId(provider.id)
    setCustomerRef(bill.customerRef)
    setAmount(String(bill.lastAmount))
    if (provider.supportsMeterType) setMeterType(bill.meterType ?? 'prepaid')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedProvider || !selectedAccount) return
    setSubmitting(true)
    try {
      const result = await actions.payBill({
        accountId: selectedAccount.id,
        providerId: selectedProvider.id,
        customerRef,
        amount: Number(amount),
        meterType: selectedProvider.supportsMeterType ? meterType : undefined,
      })
      toast.success('Bill paid', `${selectedProvider.name} payment was processed successfully.`)
      setCustomerRef('')
      setAmount('')
      setMeterType('prepaid')
      if (result?.token) {
        toast.info('Token generated', `Token: ${result.token}`)
      }
    } catch (error) {
      toast.error('We could not process this bill', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Bill payments</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Pay utilities, cable and internet bills without leaving Northstar.
        </p>
      </div>

      <Card>
        <div className="border-b border-ink-100 p-4">
          <Tabs
            variant="pill"
            value={category}
            onChange={setCategory}
            ariaLabel="Bill categories"
            items={BILL_CATEGORIES.map((item) => ({
              value: item.id,
              label: item.label,
              icon: CATEGORY_ICONS[item.id] ?? ReceiptText,
            }))}
          />
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Select
              label="Provider"
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              options={providers.map((provider) => ({ value: provider.id, label: provider.name }))}
              placeholder="Select a provider"
              required
            />

            {selectedProvider ? (
              <div className="rounded-card border border-ink-200 bg-ink-50/60 p-3.5 text-[12.5px] text-ink-600">
                <p className="font-medium text-ink-800">{selectedProvider.name}</p>
                <p>Service fee: {formatCurrency(selectedProvider.fee ?? 0)}</p>
              </div>
            ) : null}

            <Input
              label={selectedProvider?.customerLabel ?? 'Customer reference'}
              placeholder={selectedProvider?.customerPlaceholder ?? 'Enter reference'}
              value={customerRef}
              onChange={(event) => setCustomerRef(event.target.value)}
              required
            />

            {selectedProvider?.supportsMeterType ? (
              <Select
                label="Meter type"
                value={meterType}
                onChange={(event) => setMeterType(event.target.value)}
                options={[
                  { value: 'prepaid', label: 'Prepaid' },
                  { value: 'postpaid', label: 'Postpaid' },
                ]}
              />
            ) : null}

            <Input
              label="Amount"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            <Button type="submit" fullWidth loading={submitting} onClick={handleSubmit}>
              Pay bill
            </Button>
          </div>

          <div className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={accountId}
              onChange={setAccountId}
              label="Pay from"
            />

            <SectionCard title="Saved bills" description="Repeat the same payment in one tap" bodyClassName="space-y-2 p-0">
              <div className="space-y-2 p-3">
                {SAVED_BILLS.length ? (
                  SAVED_BILLS.map((bill) => (
                    <button
                      key={bill.id}
                      type="button"
                      onClick={() => handleQuickFill(bill)}
                      className="flex w-full items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/30"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-ink-900">{bill.label}</p>
                        <p className="text-[12px] text-ink-500">{bill.customerRef}</p>
                      </div>
                      <span className="text-[12px] font-semibold text-brand-700">{formatCurrency(bill.lastAmount)}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[13px] text-ink-500">No saved bills yet.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </Card>
    </div>
  )
}
