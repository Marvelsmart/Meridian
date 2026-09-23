import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Search, Send, Star, Trash2, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatAccountNumber, formatRelativeTime } from '@/lib/format'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { Avatar, Button, Card, ConfirmationDialog, EmptyState, IconButton, Input, Tabs } from '@/components/ui'
import { BeneficiaryFormDialog } from '@/components/banking'

export default function Beneficiaries() {
  useDocumentTitle('Beneficiaries')
  const { beneficiaries, actions } = useAppData()
  const toast = useToast()
  const navigate = useNavigate()
  const formDialog = useDisclosure(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return beneficiaries
      .filter((item) => (tab === 'favourites' ? item.favourite : true))
      .filter((item) =>
        term
          ? [item.name, item.nickname, item.bank, item.accountNumber]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort((a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name))
  }, [beneficiaries, query, tab])

  const favouriteCount = beneficiaries.filter((item) => item.favourite).length

  const openCreate = () => {
    setEditing(null)
    formDialog.open()
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await actions.removeBeneficiary(pendingDelete.id)
      toast.success('Beneficiary removed', `${pendingDelete.name} was removed from your list.`)
      setPendingDelete(null)
    } catch (error) {
      toast.error('We could not remove this beneficiary', error.message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleFavourite = async (beneficiary) => {
    try {
      const updated = await actions.toggleFavourite(beneficiary.id)
      toast.info(
        updated.favourite ? 'Added to favourites' : 'Removed from favourites',
        `${updated.name} will ${updated.favourite ? 'appear first' : 'no longer be pinned'} in your transfer list.`,
      )
    } catch (error) {
      toast.error('We could not update this beneficiary', error.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[24px]">Beneficiaries</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-6 text-ink-500">
            People and businesses you pay regularly. Favourites are pinned to the top of the transfer flow.
          </p>
        </div>
        <Button size="sm" icon={UserPlus} onClick={openCreate}>
          Add beneficiary
        </Button>
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            variant="pill"
            value={tab}
            onChange={setTab}
            ariaLabel="Beneficiary filters"
            items={[
              { value: 'all', label: 'All', count: beneficiaries.length },
              { value: 'favourites', label: 'Favourites', count: favouriteCount },
            ]}
          />
          <div className="sm:w-72">
            <Input
              leftIcon={Search}
              placeholder="Search name, bank or account"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search beneficiaries"
            />
          </div>
        </div>

        <div className="p-4">{filtered.length ? (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((beneficiary) => (
                <li
                  key={beneficiary.id}
                  className={cn(
                    'flex flex-col rounded-card border p-4 transition',
                    beneficiary.favourite ? 'border-brand-200 bg-brand-50/30' : 'border-ink-200 bg-white',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={beneficiary.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">{beneficiary.name}</p>
                      <p className="truncate text-[12.5px] text-ink-500">
                        {beneficiary.nickname ? `${beneficiary.nickname} · ` : ''}
                        {beneficiary.bank}
                      </p>
                    </div>
                    <IconButton
                      label={beneficiary.favourite ? 'Remove from favourites' : 'Add to favourites'}
                      icon={Star}
                      size="sm"
                      onClick={() => toggleFavourite(beneficiary)}
                      className={beneficiary.favourite ? 'text-warning-500' : 'text-ink-300 hover:text-warning-500'}
                    />
                  </div>

                  <p className="amount mt-3 text-[13px] text-ink-800">{formatAccountNumber(beneficiary.accountNumber)}</p>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {beneficiary.lastPaidAt
                      ? `Last paid ${formatRelativeTime(beneficiary.lastPaidAt)}`
                      : 'No transfers yet'}
                  </p>
                  {beneficiary.note ? (
                    <p className="mt-2 line-clamp-2 text-[12px] italic text-ink-500">“{beneficiary.note}”</p>
                  ) : null}

                  <div className="mt-4 flex items-center gap-1.5 border-t border-ink-100 pt-3">
                    <Button
                      size="sm"
                      icon={Send}
                      onClick={() =>
                        navigate(
                          `/app/transfer?account=${beneficiary.accountNumber}&name=${encodeURIComponent(beneficiary.name)}`,
                        )
                      }
                    >
                      Send
                    </Button>
                    <IconButton
                      label="Edit beneficiary"
                      icon={Pencil}
                      size="sm"
                      tone="outline"
                      onClick={() => {
                        setEditing(beneficiary)
                        formDialog.open()
                      }}
                    />
                    <IconButton
                      label="Delete beneficiary"
                      icon={Trash2}
                      size="sm"
                      tone="danger"
                      onClick={() => setPendingDelete(beneficiary)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title={query ? 'No beneficiaries match that search' : 'No beneficiaries yet'}
              description={
                query
                  ? 'Try a different name, bank or account number.'
                  : 'Add the people and businesses you pay most often to transfer in two taps.'
              }
              action={<Button onClick={openCreate}>Add your first beneficiary</Button>}
            />
          )}</div>
      </Card>

      <Card className="flex flex-col gap-2 bg-ink-50/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-6 text-ink-600">
          Beneficiaries are held in the demo mock store. In production they belong to your customer profile.
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/app/transfer')}>
          Go to transfer
        </Button>
      </Card>

      <BeneficiaryFormDialog open={formDialog.isOpen} onClose={formDialog.close} beneficiary={editing} />

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        tone="danger"
        icon={Trash2}
        title={`Remove ${pendingDelete?.name ?? 'this beneficiary'}?`}
        description={`You can always add ${pendingDelete?.name ?? 'them'} again later. Transfers already made are not affected.`}
        confirmLabel="Remove beneficiary"
      />

    </div>
  )
}
