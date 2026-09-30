import { useAppData } from '@/context/AppDataContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { DEFAULT_VERIFICATION_STATUS } from '@/config/verification'
import { Button, Card, DescriptionList, DetailRow } from '@/components/ui'
import { VerificationCard } from '@/components/banking'

export default function Profile() {
  useDocumentTitle('Profile')
  const { user } = useAppData()
  const address = user?.address
  const addressText = [address?.street, address?.city, address?.state, address?.postalCode]
    .filter(Boolean)
    .join(', ')
  const contactCustomerCare = () => window.dispatchEvent(new Event('northstar:open-support-chat'))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-ink-900 sm:text-[24px]">Profile</h1>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-500">Your account information and identity verification status.</p>
      </div>

      <Card className="space-y-5">
        <DescriptionList>
          <DetailRow label="First name" value={user?.firstName || '—'} />
          <DetailRow label="Last name" value={user?.lastName || '—'} />
          <DetailRow label="Email address" value={user?.email || '—'} />
          <DetailRow label="Phone number" value={user?.phone || '—'} />
          <DetailRow label="Residential address" value={addressText || '—'} />
        </DescriptionList>
        <div className="border-t border-ink-100 pt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-900">Profile updates</p>
          <p className="mb-3 text-[13px] leading-5 text-ink-500">For account security, profile changes are handled by customer care.</p>
          <Button variant="secondary" onClick={contactCustomerCare}>Contact Customer Care</Button>
        </div>
      </Card>

      <VerificationCard
        status={user?.verificationStatus ?? DEFAULT_VERIFICATION_STATUS}
        title="Identity Verification"
        options={[]}
      />
      <p className="text-[12.5px] text-ink-500">To update identity information or submit documents, contact customer care.</p>
      <Button variant="secondary" onClick={contactCustomerCare}>Contact Customer Care about verification</Button>
    </div>
  )
}
