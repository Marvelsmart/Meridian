import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, MessageCircle, Plus, Send, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import { Button, IconButton } from '@/components/ui'

function timeLabel(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function CustomerCareChat({ showLauncher = true } = {}) {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [subject, setSubject] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageEnd = useRef(null)

  useEffect(() => {
    const openChat = () => setOpen(true)
    window.addEventListener('northstar:open-support-chat', openChat)
    return () => window.removeEventListener('northstar:open-support-chat', openChat)
  }, [])

  useEffect(() => {
    if (!open || !isAuthenticated) return undefined
    let active = true
    const refresh = async () => {
      try {
        const result = await api.listSupportConversations()
        if (!active) return
        setConversations(result.conversations)
        if (conversationId) {
          const thread = await api.getSupportMessages(conversationId)
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
  }, [open, isAuthenticated, conversationId])

  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const startConversation = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      const result = await api.createSupportConversation({ subject, body: draft })
      setConversations((current) => [result.conversation, ...current])
      setConversationId(String(result.conversation._id))
      setMessages([result.message])
      setSubject('')
      setDraft('')
      setShowNew(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !conversationId) return
    setSending(true)
    setError('')
    try {
      const result = await api.sendSupportMessage(conversationId, draft)
      setMessages((current) => [...current, result.message])
      setConversations((current) => [result.conversation, ...current.filter((item) => String(item._id) !== conversationId)])
      setDraft('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const selected = conversations.find((item) => String(item._id) === conversationId)

  if (!open && !showLauncher) return null

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="flex h-[min(560px,76dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-pop" aria-label="Customer care chat">
          <header className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {conversationId ? <IconButton label="All conversations" icon={ArrowLeft} size="sm" onClick={() => { setConversationId(''); setShowNew(false) }} /> : <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700"><LifeBuoy className="size-4" aria-hidden="true" /></span>}
              <div className="min-w-0"><p className="truncate text-[13px] font-semibold text-ink-900">{selected?.subject ?? 'Customer care'}</p><p className="text-[11px] text-ink-500">{selected ? selected.status : 'Private in-app support'}</p></div>
            </div>
            <IconButton label="Close chat" icon={X} size="sm" onClick={() => setOpen(false)} />
          </header>

          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="size-8 text-brand-600" aria-hidden="true" />
              <p className="text-[13px] leading-5 text-ink-600">Sign in to start a private support conversation and return to your chat history.</p>
              <Button to="/login" size="sm">Sign in</Button>
            </div>
          ) : conversationId ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/70 p-4" aria-live="polite">
                {messages.map((message) => {
                  const mine = message.senderRole === 'customer'
                  return <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-card px-3 py-2.5 ${mine ? 'bg-brand-700 text-white' : 'border border-ink-200 bg-white text-ink-800'}`}><p className="whitespace-pre-wrap break-words text-[12.5px] leading-5">{message.body}</p><p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/70' : 'text-ink-400'}`}>{mine ? 'You' : 'Customer care'} · {timeLabel(message.createdAt)}</p></div></div>
                })}
                <div ref={messageEnd} />
              </div>
              {error ? <p role="alert" className="px-4 pt-2 text-[11px] text-danger-600">{error}</p> : null}
              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-ink-100 p-3">
                <textarea aria-label="Message customer care" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={2} placeholder="Write a message…" className="min-h-10 flex-1 resize-none rounded-field border border-ink-200 px-3 py-2 text-[13px] outline-none focus:border-brand-500" />
                <IconButton label="Send message" icon={Send} tone="brand" disabled={sending || !draft.trim()} onClick={sendMessage} />
              </form>
            </>
          ) : showNew ? (
            <form onSubmit={startConversation} className="flex flex-1 flex-col gap-3 p-4">
              <label className="text-[12px] font-medium text-ink-700">Subject<input required maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 h-10 w-full rounded-field border border-ink-200 px-3 text-[13px] outline-none focus:border-brand-500" /></label>
              <label className="flex flex-1 flex-col text-[12px] font-medium text-ink-700">Message<textarea required maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} className="mt-1.5 min-h-24 flex-1 resize-none rounded-field border border-ink-200 p-3 text-[13px] outline-none focus:border-brand-500" /></label>
              {error ? <p role="alert" className="text-[11px] text-danger-600">{error}</p> : null}
              <div className="flex justify-end gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => { setShowNew(false); setDraft('') }}>Cancel</Button><Button type="submit" size="sm" icon={Send} loading={sending}>Start conversation</Button></div>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto divide-y divide-ink-100">
                {conversations.map((item) => <button key={item._id} type="button" onClick={() => setConversationId(String(item._id))} className="w-full px-4 py-3 text-left transition hover:bg-ink-50"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold text-ink-900">{item.subject}</span>{item.unreadForCustomer ? <span className="size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread reply" /> : null}</span><span className="mt-1 block truncate text-[11.5px] text-ink-500">{item.lastMessage}</span><span className="mt-1 block text-[10.5px] text-ink-400">{timeLabel(item.lastMessageAt)} · {item.status}</span></button>)}
                {!loading && !conversations.length ? <p className="px-4 py-8 text-center text-[12px] text-ink-500">No conversations yet.</p> : null}
              </div>
              {error ? <p role="alert" className="px-4 py-2 text-[11px] text-danger-600">{error}</p> : null}
              <div className="border-t border-ink-100 p-3"><Button fullWidth icon={Plus} onClick={() => { setDraft(''); setShowNew(true) }}>New conversation</Button></div>
            </>
          )}
        </section>
      ) : null}
      {showLauncher ? (
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close customer care chat' : 'Open customer care chat'} title="Customer care" className="flex size-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-pop transition hover:bg-brand-800">
          {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  )
}