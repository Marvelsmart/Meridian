import { useEffect, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Button, Card, Input, SectionCard } from '@/components/ui'

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
    setSaving(true)
    try {
      await actions.saveProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
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
            <Input label="Phone number" value={values.phone} onChange={update('phone')} required />
          </div>

          <Input label="Residential address" value={values.address} onChange={update('address')} />

          <SectionCard title="KYC status" description="Your profile is verified and active" bodyClassName="py-3">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-600">
              <span className="rounded-full bg-success-50 px-2 py-1 font-semibold text-success-700">Verified</span>
              <span>Tier 3 customer</span>
              <span>Identity verified</span>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save profile</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
