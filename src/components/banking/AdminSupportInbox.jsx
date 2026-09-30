import { useEffect, useRef, useState } from 'react'
import { Check, MessageSquare, RotateCcw, Send } from 'lucide-react'
import * as api from '@/lib/api'
import { Alert, Button, IconButton, Select } from '@/components/ui'

function timeLabel(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function AdminSupportInbox() {
  const [filter, setFilter] = useState('open')
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageEnd = useRef(null)

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const result = await api.adminListSupportConversations(filter)
        if (!active) return
        setConversations(result.conversations)
        if (!selectedId && result.conversations.length) setSelectedId(String(result.conversations[0]._id))
        if (selectedId) {
          const thread = await api.adminGetSupportMessages(selectedId)
          if (active) setMessages(thread.messages)
        }
        setError('')
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    setLoading(true)
    refresh()
    const timer = window.setInterval(refresh, 7000)
    return () => { active = false; window.clearInterval(timer) }
  }, [filter, selectedId])

  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selected = conversations.find((conversation) => String(conversation._id) === selectedId)

  const sendReply = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !selectedId) return
    setSending(true)
    setError('')
    try {
      const result = await api.adminSendSupportMessage(selectedId, draft)
      setMessages((current) => [...current, result.message])
      setConversations((current) => [
        { ...current.find((conversation) => String(conversation._id) === selectedId), ...result.conversation, owner: selected?.owner },
        ...current.filter((conversation) => String(conversation._id) !== selectedId),
      ])
      setDraft('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const setStatus = async (status) => {
    try {
      const result = await api.adminSetSupportConversationStatus(selectedId, status)
      setConversations((current) => current.map((conversation) => String(conversation._id) === selectedId ? { ...conversation, ...result.conversation } : conversation))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="size-4 text-brand-700" aria-hidden="true" />
          <div><h2 className="text-[15px] font-semibold text-ink-900">Support inbox</h2><p className="text-[12px] text-ink-500">Customer conversations and replies</p></div>
        </div>
        <div className="w-36"><Select aria-label="Conversation status" value={filter} onChange={(event) => { setSelectedId(''); setMessages([]); setFilter(event.target.value) }} options={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'all', label: 'All' }]} /></div>
      </header>
      {error ? <div className="px-4 pt-4 sm:px-5"><Alert tone="danger" title="Support inbox unavailable">{error}</Alert></div> : null}
      <div className="grid min-h-[480px] md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.5fr)]">
        <div className="max-h-[520px] divide-y divide-ink-100 overflow-y-auto border-b border-ink-100 md:border-b-0 md:border-r">
          {conversations.map((conversation) => {
            const id = String(conversation._id)
            const active = id === selectedId
            return <button key={id} type="button" onClick={() => setSelectedId(id)} className={`w-full px-4 py-3 text-left transition ${active ? 'bg-brand-50' : 'hover:bg-ink-50'}`}><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold text-ink-900">{conversation.owner?.firstName} {conversation.owner?.lastName}</span>{conversation.unreadForAdmin ? <span className="rounded-full bg-danger-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{conversation.unreadForAdmin}</span> : null}</span><span className="mt-0.5 block truncate text-[11px] text-ink-500">{conversation.owner?.email}</span><span className="mt-2 block truncate text-[12px] font-medium text-ink-800">{conversation.subject}</span><span className="mt-0.5 block truncate text-[11px] text-ink-500">{conversation.lastMessage}</span><span className="mt-1 block text-[10px] text-ink-400">{timeLabel(conversation.lastMessageAt)}</span></button>
          })}
          {!loading && !conversations.length ? <p className="px-4 py-8 text-center text-[12px] text-ink-500">No {filter === 'all' ? '' : `${filter} `}conversations.</p> : null}
        </div>
        {selected ? (
          <div className="flex min-h-[480px] min-w-0 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
              <div className="min-w-0"><p className="truncate text-[13px] font-semibold text-ink-900">{selected.subject}</p><p className="truncate text-[11px] text-ink-500">{selected.owner?.firstName} {selected.owner?.lastName} · {selected.owner?.email}</p></div>
              {selected.status === 'open' ? <IconButton label="Close conversation" icon={Check} size="sm" onClick={() => setStatus('closed')} /> : <IconButton label="Reopen conversation" icon={RotateCcw} size="sm" onClick={() => setStatus('open')} />}
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/70 p-4" aria-live="polite">
              {messages.map((message) => {
                const staff = message.senderRole === 'admin'
                return <div key={message._id} className={`flex ${staff ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-card px-3 py-2.5 ${staff ? 'bg-brand-700 text-white' : 'border border-ink-200 bg-white text-ink-800'}`}><p className="whitespace-pre-wrap break-words text-[12.5px] leading-5">{message.body}</p><p className={`mt-1 text-right text-[10px] ${staff ? 'text-white/70' : 'text-ink-400'}`}>{staff ? 'Admin' : selected.owner?.firstName || 'Customer'} · {timeLabel(message.createdAt)}</p></div></div>
              })}
              <div ref={messageEnd} />
            </div>
            <form onSubmit={sendReply} className="flex items-end gap-2 border-t border-ink-100 p-3">
              <textarea aria-label="Reply to customer" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={2} placeholder="Reply to customer…" className="min-h-10 flex-1 resize-none rounded-field border border-ink-200 px-3 py-2 text-[13px] outline-none focus:border-brand-500" />
              <Button type="submit" icon={Send} size="sm" loading={sending} disabled={!draft.trim()}>Send</Button>
            </form>
          </div>
        ) : <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 p-6 text-center text-ink-500"><MessageSquare className="size-6" aria-hidden="true" /><p className="text-[13px]">{loading ? 'Loading conversations…' : 'Choose a conversation to read and reply.'}</p></div>}
      </div>
    </section>
  )
}