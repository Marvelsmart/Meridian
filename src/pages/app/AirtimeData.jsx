import { useMemo, useState } from 'react'
import { Smartphone, Wifi } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { AIRTIME_MIN, AIRTIME_MAX, AIRTIME_PRESETS, SAVED_PHONE_NUMBERS, dataPlansFor, detectNetwork } from '@/data/networks'
import { NETWORKS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { AccountSelect } from '@/components/banking'
import { Button, Card, Input, SectionCard, Tabs } from '@/components/ui'

export default function AirtimeData() {
  useDocumentTitle('Airtime & data')
  const { accounts, activeAccount, actions } = useAppData()
  const toast = useToast()
  const [kind, setKind] = useState('airtime')
  const [network, setNetwork] = useState('mtn')
  const [phone, setPhone] = useState('+234 802 445 7781')
  const [amount, setAmount] = useState('500')
  const [accountId, setAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? '')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? activeAccount ?? accounts[0] ?? null
  const plans = useMemo(() => dataPlansFor(network), [network])
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null

  const applyPhonePreset = (preset) => {
    setPhone(preset.phone)
    const detected = detectNetwork(preset.phone) ?? preset.network
    if (detected) setNetwork(detected)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedAccount) return
    setSubmitting(true)
    try {
      const result = await actions.buyBundle({
        accountId: selectedAccount.id,
        network,
        phone,
        amount: Number(amount),
        kind,
        planId: selectedPlan?.id ?? null,
        planLabel: selectedPlan?.label ?? null,
      })
      toast.success(kind === 'data' ? 'Data purchase successful' : 'Airtime topped up', `${result.transaction.description} was processed.`)
    } catch (error) {
      toast.error('We could not complete this transaction', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Airtime & data</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Top up mobile numbers, buy data bundles and keep your essentials connected.
        </p>
      </div>

      <Card>
        <div className="border-b border-ink-100 p-4">
          <Tabs
            variant="pill"
            value={kind}
            onChange={setKind}
            ariaLabel="Airtime or data"
            items={[
              { value: 'airtime', label: 'Airtime', icon: Smartphone },
              { value: 'data', label: 'Data', icon: Wifi },
            ]}
          />
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {NETWORKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNetwork(item.id)}
                  className={`rounded-card border p-3 text-left transition ${network === item.id ? 'border-brand-600 bg-brand-50/50' : 'border-ink-200 hover:border-ink-300'}`}
                  style={{ backgroundColor: network === item.id ? `${item.color}15` : undefined }}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-ink-900">{item.name}</span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </span>
                </button>
              ))}
            </div>

            <Input
              label="Phone number"
              placeholder="0803 123 4567"
              value={phone}
              onChange={(event) => {
                const next = event.target.value
                setPhone(next)
                const detected = detectNetwork(next)
                if (detected) setNetwork(detected)
              }}
              required
            />

            {kind === 'data' ? (
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-ink-700">Choose a bundle</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id)
                        setAmount(String(plan.amount))
                      }}
                      className={`rounded-card border p-3 text-left transition ${selectedPlan?.id === plan.id ? 'border-brand-600 bg-brand-50/50' : 'border-ink-200 hover:border-ink-300'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-semibold text-ink-900">{plan.label}</p>
                          <p className="text-[12px] text-ink-500">{plan.validity}</p>
                        </div>
                        {plan.tag ? (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                            {plan.tag}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[12px] font-semibold text-brand-700">{formatCurrency(plan.amount)}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-ink-700">Quick amounts</p>
                <div className="flex flex-wrap gap-2">
                  {AIRTIME_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  min={AIRTIME_MIN}
                  max={AIRTIME_MAX}
                  required
                />
              </div>
            )}

            <Button type="submit" fullWidth loading={submitting} onClick={handleSubmit}>
              {kind === 'data' ? 'Buy bundle' : 'Top up'}
            </Button>
          </div>

          <div className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={accountId}
              onChange={setAccountId}
              label="Pay from"
            />

            <SectionCard title="One-tap numbers" description="Your favourites" bodyClassName="space-y-2 p-0">
              <div className="space-y-2 p-3">
                {SAVED_PHONE_NUMBERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPhonePreset(preset)}
                    className="flex w-full items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-ink-900">{preset.label}</p>
                      <p className="text-[12px] text-ink-500">{preset.phone}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-brand-700">{preset.network.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </Card>
    </div>
  )
}
