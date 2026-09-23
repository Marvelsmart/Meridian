import { useEffect, useState } from 'react'
import { Loader2, Search, UserCheck } from 'lucide-react'
import * as api from '@/lib/api'
import { BANKS } from '@/data/banks'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { Alert, Avatar, Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui'

const EMPTY = {
  bankCode: '',
  accountNumber: '',
  name: '',
  nickname: '',
  email: '',
  phone: '',
  note: '',
  favourite: false,
}

const BANK_OPTIONS = BANKS.map((bank) => ({ value: bank.code, label: bank.name }))

/**
 * Add / edit beneficiary. Uses the same name-enquiry call as the transfer flow,
 * so account names are always resolved by the "bank" rather than typed blindly.
 */
export function BeneficiaryFormDialog({ open, onClose, beneficiary = null, onSaved = null }) {
  const { actions } = useAppData()
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [resolved, setResolved] = useState(null)
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(beneficiary)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setFormError(null)
    setResolved(null)
    setValues(
      beneficiary
        ? {
            bankCode: beneficiary.bankCode,
            accountNumber: beneficiary.accountNumber,
            name: beneficiary.name,
            nickname: beneficiary.nickname ?? '',
            email: beneficiary.email ?? '',
            phone: beneficiary.phone ?? '',
            note: beneficiary.note ?? '',
            favourite: Boolean(beneficiary.favourite),
          }
        : EMPTY,
    )
  }, [open, beneficiary])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
    if (field === 'accountNumber' || field === 'bankCode') setResolved(null)
  }

  const setAccountNumber = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    setValues((current) => ({ ...current, accountNumber: digits }))
    setErrors((current) => ({ ...current, accountNumber: undefined }))
    setResolved(null)
  }

  const resolve = async () => {
    setResolving(true)
    setFormError(null)
    setErrors({})
    try {
      const result = await api.resolveAccountName({
        accountNumber: values.accountNumber,
        bankCode: values.bankCode,
      })
      setResolved(result)
      setValues((current) => ({ ...current, name: result.name }))
    } catch (error) {
      setErrors(error.fields ?? {})
      setFormError(error.message)
    } finally {
      setResolving(false)
    }
  }

  const submit = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...values,
        bank: BANKS.find((bank) => bank.code === values.bankCode)?.name ?? 'Bank transfer',
      }
      const saved = isEdit
        ? await actions.editBeneficiary(beneficiary.id, payload)
        : await actions.addBeneficiary(payload)
      toast.success(isEdit ? 'Beneficiary updated' : 'Beneficiary added', `${saved.name} is ready for transfers.`)
      onSaved?.(saved)
      onClose?.()
    } catch (error) {
      setErrors(error.fields ?? {})
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = values.name.trim().length > 2 && values.accountNumber.length === 10 && Boolean(values.bankCode)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit beneficiary' : 'Add a beneficiary'}
      description="We confirm the account name with the bank before saving."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!canSubmit}>
            {isEdit ? 'Save changes' : 'Add beneficiary'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError ? (
          <Alert tone="danger" title="We could not save this beneficiary">
            {formError}
          </Alert>
        ) : null}

        <Select
          label="Bank"
          value={values.bankCode}
          onChange={update('bankCode')}
          options={BANK_OPTIONS}
          error={errors.bankCode}
          placeholder="Select a bank"
          required
        />

        <div className="flex items-end gap-2">
          <Input
            label="Account number"
            inputMode="numeric"
            placeholder="10-digit account number"
            value={values.accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            error={errors.accountNumber}
            required
          />
          <Button
            variant="secondary"
            className="mb-0.5 shrink-0"
            onClick={resolve}
            disabled={values.accountNumber.length !== 10 || !values.bankCode || resolving}
          >
            {resolving ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Resolve
          </Button>
        </div>

        {resolved ? (
          <div className="flex items-center gap-3 rounded-card border border-success-100 bg-success-50 p-3.5">
            <Avatar name={resolved.name} size="sm" tone="success" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success-700">
                <UserCheck className="size-3.5" aria-hidden="true" />
                {resolved.name}
              </p>
              <p className="text-[12px] text-success-600">Account name confirmed by the bank</p>
            </div>
          </div>
        ) : null}

        <Input
          label="Account name"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
          hint={
            resolved
              ? 'Confirmed by name enquiry — only change this if the bank disagrees.'
              : 'Resolve the account to fill this in automatically.'
          }
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nickname" placeholder="e.g. Landlord" value={values.nickname} onChange={update('nickname')} />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="0803 123 4567"
            value={values.phone}
            onChange={update('phone')}
          />
        </div>

        <Input
          label="Email (optional)"
          type="email"
          placeholder="name@example.com"
          value={values.email}
          onChange={update('email')}
        />

        <Textarea
          label="Note (optional)"
          placeholder="What is this account used for?"
          value={values.note}
          onChange={update('note')}
        />

        <Checkbox
          checked={values.favourite}
          onChange={(checked) => setValues((current) => ({ ...current, favourite: checked }))}
          label="Add to favourites"
          description="Favourites appear first when you send money."
        />
      </div>
    </Modal>
  )
}

