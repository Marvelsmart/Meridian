import { useEffect, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { DEFAULT_VERIFICATION_STATUS, VERIFICATION_OPTIONS } from '@/config/verification'
import { formatUsPhone, formatUsPhoneDisplay, phoneError } from '@/lib/phone'
import { Button, Card, Input } from '@/components/ui'
import { VerificationCard } from '@/components/banking'

export default function Profile() {
  useDocumentTitle('Profile')
  const { user, actions } = useAppData()
  const toast = useToast()
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setValues({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state}` : '',
    })
  }, [user])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const phoneMessage = phoneError(values.phone)
    if (phoneMessage) {
      toast.error('Check your phone number', phoneMessage)
      return
    }
    setSaving(true)
    try {
      await actions.saveProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        // Stored in the display format the profile screens use: +1 (312) 555-0148
        phone: formatUsPhoneDisplay(values.phone),
        address: {
          street: values.address,
          city: 'San Francisco',
          state: 'California',
          country: 'United States',
          postalCode: user?.address?.postalCode ?? '101241',
        },
      })
      toast.success('Profile updated', 'Your personal details were saved successfully.')
    } catch (error) {
      toast.error('We could not save your profile', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerificationChange = async (status) => {
    try {
      await actions.saveProfile({ verificationStatus: status })
      toast.info('Verification state updated', 'This is a simulated demo state — nothing is really checked.')
    } catch (error) {
      toast.error('We could not update verification', error.message)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Profile</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">
          Keep your account details current so alerts and statements stay accurate.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" value={values.firstName} onChange={update('firstName')} required />
            <Input label="Last name" value={values.lastName} onChange={update('lastName')} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email address" type="email" value={values.email} onChange={update('email')} required />
            <Input
              label="Phone number"
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(event) =>
                setValues((current) => ({ ...current, phone: formatUsPhone(event.target.value) }))
              }
              hint="United States (+1)"
              required
            />
          </div>

          <Input label="Residential address" value={values.address} onChange={update('address')} />

          <VerificationCard
            status={user?.verificationStatus ?? DEFAULT_VERIFICATION_STATUS}
            onStatusChange={handleVerificationChange}
            options={VERIFICATION_OPTIONS}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save profile</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
