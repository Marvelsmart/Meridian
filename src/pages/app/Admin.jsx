import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, Search, Shield, ShieldAlert, Trash2, UserPlus, UserRound, X } from 'lucide-react'
import * as api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Alert, Button, Input, SectionCard, Select } from '@/components/ui'
import { AdminSupportInbox } from '@/components/banking/AdminSupportInbox'

const VERIFICATION_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'verified', label: 'Verified' },
  { value: 'action_required', label: 'Action required' },
]

const EMPTY_PROFILE = { firstName: '', lastName: '', email: '', phone: '', address: '', verificationStatus: 'pending' }
const EMPTY_NEW_CUSTOMER = { firstName: '', lastName: '', email: '', phone: '', address: '' }

export default function Admin() {
  useDocumentTitle('Administration')
  const { user } = useAuth()
  const toast = useToast()
  const [customers, setCustomers] = useState([])
  const [cardRequests, setCardRequests] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [createForm, setCreateForm] = useState(EMPTY_NEW_CUSTOMER)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [customerResult, requestResult] = await Promise.all([api.adminListCustomers(), api.adminListCardRequests()])
      setCustomers(customerResult.customers)
      setCardRequests(requestResult.cards)
      setSelectedId((current) => current || customerResult.customers[0]?.id || customerResult.customers[0]?._id || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return customers
    return customers.filter((item) => `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(needle))
  }, [customers, query])

  const selected = customers.find((item) => String(item.id ?? item._id) === String(selectedId))

  const createCustomer = async (event) => {
    event.preventDefault()
    setCreating(true)
    try {
      const result = await api.adminCreateCustomer(createForm)
      const created = result.customer
      setCustomers((current) => [created, ...current])
      setSelectedId(String(created.id ?? created._id))
      setCreateForm(EMPTY_NEW_CUSTOMER)
      setCreateOpen(false)
      toast.success('Customer account created', 'Password and transaction PIN setup links were sent by email.')
    } catch (err) {
      toast.error('Customer account was not created', err.message)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (!selected) return
    setProfile({
      firstName: selected.firstName ?? '',
      lastName: selected.lastName ?? '',
      email: selected.email ?? '',
      phone: selected.phone ?? '',
      address: selected.address?.street ?? '',
      verificationStatus: selected.verificationStatus ?? 'pending',
    })
  }, [selected])

  if (user?.role !== 'admin') return <Navigate to="/app/dashboard" replace />

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const result = await api.adminUpdateCustomer(selectedId, {
        ...profile,
        address: profile.address ? { ...(selected.address ?? {}), street: profile.address } : {},
      })
      setCustomers((current) => current.map((item) => String(item.id ?? item._id) === String(selectedId) ? result.customer : item))
      toast.success('Customer record updated')
    } catch (err) {
      toast.error('Customer record not updated', err.message)
    } finally {
      setSaving(false)
    }
  }

  const flagReset = async (kind) => {
    try {
      if (kind === 'pin') await api.adminResetCustomerPin(selectedId)
      else await api.adminResetCustomerPassword(selectedId)
      toast.success(`${kind === 'pin' ? 'PIN' : 'Password'} reset email sent`, 'The one-time code is delivered directly to the customer. No credential was exposed.')
      await refresh()
    } catch (err) {
      toast.error('Could not flag reset', err.message)
    }
  }

  const deleteCustomer = async () => {
    const confirmation = window.prompt(`Permanently delete ${selected.email} and all linked records? Type the email to confirm.`)
    if (confirmation === null) return
    setDeleting(true)
    try {
      await api.adminDeleteCustomer(selectedId, confirmation.trim())
      setCustomers((current) => current.filter((customer) => String(customer.id ?? customer._id) !== String(selectedId)))
      setSelectedId('')
      setProfile(EMPTY_PROFILE)
      toast.success('Customer account deleted', 'All linked customer records were permanently removed.')
      await refresh()
    } catch (err) {
      toast.error('Customer account was not deleted', err.message)
    } finally {
      setDeleting(false)
    }
  }

  const reviewCardRequest = async (cardId, decision) => {
    try {
      await api.adminReviewCardRequest(cardId, decision)
      toast.success(`Card request ${decision === 'approve' ? 'approved' : 'declined'}`)
      await refresh()
    } catch (err) {
      toast.error('Card request was not updated', err.message)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase text-brand-700"><Shield className="size-4" aria-hidden="true" /> Staff tools</p>
          <h1 className="mt-1 text-[22px] font-semibold text-ink-900 sm:text-[24px]">Administration</h1>
          <p className="mt-1 text-[13px] text-ink-500">Customer records, identity review, credential-reset flags, and card approvals.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={UserPlus} onClick={() => setCreateOpen((open) => !open)}>Create customer</Button>
          <Button variant="secondary" onClick={refresh} loading={loading}>Refresh</Button>
        </div>
      </header>

      {error ? <Alert tone="danger" title="Admin data unavailable">{error}</Alert> : null}

      {createOpen ? (
        <SectionCard title="Create customer account" description="A zero-balance checking account will be created; setup links are emailed to the customer">
          <form onSubmit={createCustomer} className="grid gap-3 sm:grid-cols-2">
            <Input label="First name" value={createForm.firstName} onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))} required />
            <Input label="Last name" value={createForm.lastName} onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))} required />
            <Input label="Email" type="email" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} required />
            <Input label="Phone" value={createForm.phone} onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))} required />
            <Input label="Street address" value={createForm.address} onChange={(event) => setCreateForm((current) => ({ ...current, address: event.target.value }))} />
            <div className="flex items-end gap-2">
              <Button type="submit" loading={creating}>Create account</Button>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <AdminSupportInbox />

      <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.5fr)]">
        <SectionCard title={`Customers (${customers.length})`} description="Select a customer record to review">
          <Input label="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} leftIcon={Search} placeholder="Name or email" />
          <div className="mt-3 max-h-[520px] divide-y divide-ink-100 overflow-y-auto">
            {filteredCustomers.map((customer) => {
              const customerId = String(customer.id ?? customer._id)
              const active = customerId === String(selectedId)
              return (
                <button key={customerId} type="button" onClick={() => setSelectedId(customerId)} className={`flex w-full items-center gap-3 px-2 py-3 text-left ${active ? 'bg-brand-50' : 'hover:bg-ink-50'}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600"><UserRound className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-ink-900">{customer.firstName} {customer.lastName}</span><span className="block truncate text-[11.5px] text-ink-500">{customer.email}</span></span>
                  <span className="text-[10px] text-ink-500">{customer.verificationStatus?.replace('_', ' ')}</span>
                </button>
              )
            })}
            {!loading && !filteredCustomers.length ? <p className="py-6 text-center text-[13px] text-ink-500">No customer records match.</p> : null}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Customer profile" description="Edit approved profile fields and identity status">
            {selected ? (
              <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2">
                <Input label="First name" value={profile.firstName} onChange={(event) => setProfile((current) => ({ ...current, firstName: event.target.value }))} required />
                <Input label="Last name" value={profile.lastName} onChange={(event) => setProfile((current) => ({ ...current, lastName: event.target.value }))} required />
                <Input label="Email" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required />
                <Input label="Phone" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} required />
                <Input label="Street address" value={profile.address} onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} />
                <Select label="Identity verification" value={profile.verificationStatus} onChange={(event) => setProfile((current) => ({ ...current, verificationStatus: event.target.value }))} options={VERIFICATION_OPTIONS} />
                <div className="flex items-end"><Button type="submit" loading={saving}>Save customer record</Button></div>
                <div className="sm:col-span-2 border-t border-ink-100 pt-3">
                  <p className="mb-2 text-[12px] font-semibold text-ink-700">Credential support</p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => flagReset('pin')}>Send PIN reset email</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => flagReset('password')}>Send password reset email</Button>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-5 text-ink-500">Codes are single-use and emailed directly. The admin never sees a customer’s secret.</p>
                  <div className="mt-4 border-t border-ink-100 pt-3">
                    <Button type="button" variant="danger-ghost" size="sm" icon={Trash2} loading={deleting} onClick={deleteCustomer}>Delete customer account</Button>
                    <p className="mt-2 text-[11.5px] leading-5 text-danger-700">Permanently removes the customer and linked account, transaction, card, and support records.</p>
                  </div>
                </div>
              </form>
            ) : <p className="text-[13px] text-ink-500">{loading ? 'Loading customers…' : 'Select a customer to review.'}</p>}
          </SectionCard>

          <SectionCard title={`Card freeze approvals (${cardRequests.length})`} description="Approve or decline customer card status requests">
            {cardRequests.length ? (
              <div className="divide-y divide-ink-100">
                {cardRequests.map((card) => (
                  <div key={card._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink-900">{card.nickname || 'Bank card'} ···· {card.last4}</p>
                      <p className="text-[12px] text-ink-500">{card.owner?.firstName} {card.owner?.lastName} · {card.owner?.email}</p>
                      <p className="text-[11px] font-medium text-warning-700">{card.status === 'freeze_pending' ? 'Freeze requested' : 'Unfreeze requested'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" icon={Check} onClick={() => reviewCardRequest(card._id, 'approve')}>Approve</Button>
                      <Button type="button" size="sm" variant="secondary" icon={X} onClick={() => reviewCardRequest(card._id, 'reject')}>Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="flex items-center gap-2 py-2 text-[13px] text-ink-500"><ShieldAlert className="size-4" aria-hidden="true" />No pending card approvals.</p>}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
