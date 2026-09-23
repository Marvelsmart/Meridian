import { useState } from 'react'
import { CreditCard, Lock, Plus, Snowflake, Unlock } from 'lucide-react'
import { CardVisual, StatCard } from '@/components/banking'
import { CARD_CURRENCIES, CARD_TYPE_OPTIONS } from '@/data/cards'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useLocalStorage'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, EmptyState, Input, SectionCard, Select, Switch } from '@/components/ui'

export default function Cards() {
  useDocumentTitle('Cards')
  const { cards, actions } = useAppData()
  const toast = useToast()
  const [requesting, setRequesting] = useState(false)
  const [cardType, setCardType] = useState('virtual')
  const [currency, setCurrency] = useState('USD')
  const [revealed, setRevealed] = useState({})

  const primaryCard = cards[0]

  const handleRequestCard = async () => {
    setRequesting(true)
    try {
      await actions.requestCard({ type: cardType, currency, nickname: `${cardType === 'virtual' ? 'Online' : 'Travel'} card` })
      toast.success('Card request submitted', 'Your new card is being prepared.')
      setCardType('virtual')
      setCurrency('USD')
    } catch (error) {
      toast.error('We could not create the card', error.message)
    } finally {
      setRequesting(false)
    }
  }

  const handleToggleFreeze = async (card) => {
    try {
      await actions.toggleFreeze(card.id)
      toast.success(card.status === 'frozen' ? 'Card unfrozen' : 'Card frozen', 'Your card status was updated.')
    } catch (error) {
      toast.error('We could not update your card', error.message)
    }
  }

  if (!cards.length) {
    return (
      <div className="space-y-5">
        <PageHeader title="Cards" description="Manage your card portfolio and virtual payment controls." />
        <EmptyState
          icon={CreditCard}
          title="No cards yet"
          description="Create a virtual card to start spending instantly."
          action={<Button onClick={handleRequestCard} loading={requesting}>Create a card</Button>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cards"
        description="Secure, spend-ready cards for your everyday banking needs."
        actions={
          <Button size="sm" icon={Plus} onClick={handleRequestCard} loading={requesting}>
            Add card
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <div className="p-2">
                <CardVisual
                  card={card}
                  revealed={Boolean(revealed[card.id])}
                  onToggleReveal={() => setRevealed((current) => ({ ...current, [card.id]: !current[card.id] }))}
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink-900">{card.nickname}</p>
                    {card.isDefault ? <Badge variant="brand">Default</Badge> : null}
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-500">{card.brand} · {card.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={card.status === 'frozen' ? Unlock : Lock}
                    onClick={() => handleToggleFreeze(card)}
                  >
                    {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <SectionCard title="Create a new card" description="Issue a digital or physical card in seconds">
            <div className="space-y-3">
              <Select
                label="Card type"
                value={cardType}
                onChange={(event) => setCardType(event.target.value)}
                options={CARD_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Select
                label="Currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                options={CARD_CURRENCIES.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Input label="Nickname" placeholder="Travel card" defaultValue="Travel card" />
              <Button fullWidth icon={Plus} onClick={handleRequestCard} loading={requesting}>
                Request card
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Portfolio snapshot" description="Quick view of your active cards">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatCard
                label="Active cards"
                value={`${cards.filter((card) => card.status === 'active').length}`}
                icon={CreditCard}
                tone="success"
              />
              <StatCard
                label="Frozen cards"
                value={`${cards.filter((card) => card.status === 'frozen').length}`}
                icon={Snowflake}
                tone="warning"
              />
              <StatCard
                label="Default card"
                value={primaryCard?.nickname ?? 'None'}
                icon={CreditCard}
                tone="brand"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
