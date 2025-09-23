import { useEffect, useRef, useState } from 'react'
import { getOfflineAnswer } from '../utils/travelFaq'
import { API_BASE } from '../lib/apiBase'
import { useI18n } from '../context/I18nContext'

export default function ChatbotWidget() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => {
    // hydrate from storage if present
    try {
      const raw = localStorage.getItem('chat_history_v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    } catch {}
    return [{ id: 1, role: 'bot', text: t('chatbotGreeting') }]
  })
  const listRef = useRef(null)
  const [canOnline, setCanOnline] = useState(false)
  const [useOnline, setUseOnline] = useState(false)
  const [typing, setTyping] = useState(false)

  // Suggestions removed per UX request

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open])

  // persist history
  useEffect(() => {
    try {
      const trimmed = messages.slice(-100) // keep last 100
      localStorage.setItem('chat_history_v1', JSON.stringify(trimmed))
    } catch {}
  }, [messages])

  // Probe backend AI health when opening
  useEffect(() => {
    if (!open) return
    fetch(new URL('/api/ai/health', API_BASE)).then(async (r) => {
      if (!r.ok) throw new Error('health failed')
      const d = await r.json()
      const ok = Boolean(d?.keyPresent)
      setCanOnline(ok)
      setUseOnline(ok)
    }).catch(() => {
      setCanOnline(false)
      setUseOnline(false)
    })
  }, [open])

  function callOffline(history) {
    const last = history[history.length - 1]?.text || ''
    return getOfflineAnswer(last)
  }

  async function callExternal(history) {
    try {
      const res = await fetch(new URL('/api/ai/chat', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) })
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data.content || '...'
    } catch (e) {
      return null
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMsg = { id: Date.now(), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    ;(async () => {
      setTyping(true)
      // small UX delay so typing indicator is visible
      await new Promise(r => setTimeout(r, 200))
      let answer = null
      if (useOnline && canOnline) {
        answer = await callExternal([...messages, userMsg])
      }
      if (!answer) {
        answer = getOfflineAnswer(userMsg.text, lang)
      }
      const botMsg = { id: Date.now() + 1, role: 'bot', text: answer }
      setMessages((m) => [...m, botMsg])
      setTyping(false)
    })()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onSubmit(e)
    }
  }

  return (
    <>
      <button
        className="chatbot-btn"
        aria-label={open ? t('chatbotClose') : t('chatbotOpen')}
        onClick={() => setOpen(o => !o)}
        style={{ background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', padding: 8, borderRadius: '999px' }}
      >
        {open ? '×' : (
          <img
            src="/images/chat.jpg"
            alt="Open chat"
            width={58}
            height={58}
            style={{ display:'inline-block', verticalAlign:'middle', objectFit:'cover', borderRadius: '50%' }}
          />
        )}
      </button>

      {open && (
        <section className="chatbot-panel show" aria-live="polite">
          <header className="chatbot-header">
            <strong>{t('chatbotTitle')}</strong>
            {canOnline && (
              <label style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.85rem'}}>
                <input type="checkbox" checked={useOnline} onChange={(e)=>setUseOnline(e.target.checked)} />
                {t('chatbotOnline')}
              </label>
            )}
            <button
              className="nav-link"
              style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '4px 8px', cursor:'pointer' }}
              onClick={() => {
                setMessages([{ id: Date.now(), role: 'bot', text: 'History cleared. How can I help you next?' }])
                try { localStorage.removeItem('chat_history_v1') } catch {}
              }}
              type="button"
            >
              {t('chatbotClear')}
            </button>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </header>
          <div ref={listRef} className="chatbot-messages">
            {messages.map(m => (
              <div key={m.id} className={`chatbot-row ${m.role}`}>
                {m.role === 'bot' ? (
                  <div className="avatar" aria-hidden>🤖</div>
                ) : (
                  <div className="avatar" aria-hidden>🧑</div>
                )}
                <div className={`chatbot-msg ${m.role}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-row bot">
                <div className="avatar" aria-hidden>🤖</div>
                <div className="chatbot-msg bot typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>
          {/* Suggestions removed */}
          <form className="chatbot-input" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('chatbotPlaceholder')}
            />
            <button type="submit" className="btn btn-primary">{t('chatbotSend')}</button>
          </form>
        </section>
      )}
    </>
  )
}
