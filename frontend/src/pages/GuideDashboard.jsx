import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { API_BASE } from '../lib/apiBase'

export default function GuideDashboard() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [messages, setMessages] = useState([]) // inbox items from /api/messages/inbox
  const [unread, setUnread] = useState(0)
  const [availability, setAvailability] = useState({ available: true, note: '' })
  const [newMsg, setNewMsg] = useState('') // reply composer (as guide)
  const [transactions, setTransactions] = useState([])
  const [bank, setBank] = useState(null)
  const [showBankForm, setShowBankForm] = useState(false)
  const [bankForm, setBankForm] = useState({ accountName:'', accountNumber:'', ifsc:'', bankName:'', branch:'' })
  const [guideRow, setGuideRow] = useState(null)
  const [loadingInbox, setLoadingInbox] = useState(false)

  // Section refs for quick navigation
  const refProfile = useRef(null)
  const refEarnings = useRef(null)
  const refFeedbacks = useRef(null)
  const refTransactions = useRef(null)
  const refMessages = useRef(null)
  const refAvailability = useRef(null)
  const refBank = useRef(null)

  const go = (ref) => ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const emailParam = encodeURIComponent(user?.email || 'guide@example.com')
  const api = useMemo(() => ({
    async get(path) {
      const r = await fetch(new URL(`/api/guide/${path}?email=${emailParam}`, API_BASE))
      if (!r.ok) return null
      return r.json()
    },
    async post(path, body) {
      const r = await fetch(new URL(`/api/guide/${path}?email=${emailParam}`, API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!r.ok) return null
      return r.json()
    }
  }), [emailParam])

  // Messaging helpers using /api/messages
  const loadInbox = async (gid) => {
    if (!gid) return
    setLoadingInbox(true)
    try {
      const res = await fetch(new URL(`/api/messages/inbox?guideId=${gid}`, API_BASE))
      if (res.ok) {
        const d = await res.json()
        setUnread(d.unread || 0)
        setMessages(d.items || [])
      }
    } finally {
      setLoadingInbox(false)
    }
  }

  const markAllRead = async () => {
    if (!guideRow?.id) return
    await fetch(new URL('/api/messages/mark-read', API_BASE), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guideId: guideRow.id })
    })
    loadInbox(guideRow.id)
  }

  const reply = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !guideRow?.id) return
    const res = await fetch(new URL('/api/messages/reply', API_BASE), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guideId: guideRow.id, message: newMsg.trim() })
    })
    if (res.ok) {
      const saved = await res.json()
      setMessages((m)=> [saved, ...m])
      setNewMsg('')
    }
  }

  useEffect(() => {
    // Load guide row for messaging and also serve as profile source
    fetch(new URL(`/api/guide/me?email=${emailParam}`, API_BASE)).then(async (r)=>{
      if (!r.ok) return null
      return r.json()
    }).then((row)=>{
      if (row && row.id) {
        setGuideRow(row)
        setProfile({
          name: row.name,
          email: row.email,
          phone: row.phone || '9990000000',
          address: `${row.city || 'Ranchi'}, Jharkhand`,
          languagesKnown: row.languages || 'Hindi,English',
          certificateId: 'JH-GUIDE-2025-001',
          experienceYears: 3,
        })
        loadInbox(row.id)
      } else {
        // Fallback mock profile
        setProfile({
          name: 'Demo Guide',
          email: decodeURIComponent(emailParam),
          phone: '9990000000',
          address: 'Ranchi, Jharkhand',
          languagesKnown: 'Hindi,English',
          certificateId: 'JH-GUIDE-2025-001',
          experienceYears: 3,
        })
      }
    })

    // Mock data for other sections if backend routes are not present
    setEarnings({ total: 125000, month: 8500, lastPayout: '2025-09-01' })
    setFeedbacks([
      { id: 1, user: 'Arun', rating: 5, comment: 'Fantastic tour around waterfalls!' },
      { id: 2, user: 'Meera', rating: 4, comment: 'Very knowledgeable about local culture.' },
    ])
    setAvailability({ available: true, note: '' })
    setTransactions([
      { id: 101, amount: 2500, method: 'UPI', ref: 'pay_001', date: new Date().toISOString() },
      { id: 102, amount: 1800, method: 'Card', ref: 'pay_002', date: new Date(Date.now()-86400000).toISOString() },
    ])
    const b = { accountName: 'Demo Guide', accountNumber: '1234567890', ifsc: 'JH0000123', bankName: 'Demo Bank', branch: 'Ranchi', updatedAt: new Date().toISOString() }
    setBank(b)
    setBankForm({ accountName:b.accountName||'', accountNumber:b.accountNumber||'', ifsc:b.ifsc||'', bankName:b.bankName||'', branch:b.branch||'' })
  }, [api, emailParam])

  const sendMsg = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    const saved = await api.post('messages', { text: newMsg.trim() })
    setMessages((m) => [...m, saved])
    setNewMsg('')
  }

  const saveAvailability = async (e) => {
    e.preventDefault()
    const saved = await api.post('availability', availability)
    setAvailability(saved)
  }

  const saveBank = async (e) => {
    e.preventDefault()
    const saved = await api.post('bank', bankForm)
    setBank(saved)
    setShowBankForm(false)
  }

  return (
    <main className="page container guide-dashboard">
      <h2>{t('guideDashboardTitle')}</h2>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, margin:'8px 0 16px'}}>
        <button className="btn" onClick={()=>go(refProfile)}>{t('gdProfile')}</button>
        <button className="btn" onClick={()=>go(refEarnings)}>{t('gdEarnings')}</button>
        <button className="btn" onClick={()=>go(refFeedbacks)}>{t('gdFeedbacks')}</button>
        <button className="btn" onClick={()=>go(refTransactions)}>{t('gdTransactions')}</button>
        <button className="btn" onClick={()=>go(refMessages)}>{t('gdChat')}</button>
        <button className="btn" onClick={()=>go(refAvailability)}>{t('gdAvailability')}</button>
        <button className="btn" onClick={()=>go(refBank)}>{t('gdBank')}</button>
      </div>
      <div className="dashboard-grid" style={{display:'grid', gap:16, gridTemplateColumns: '1.3fr 1fr'}}>
        <section ref={refProfile} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdProfileInfo')}</header>
          {!profile ? (
            <div>{t('gdLoading')}</div>
          ) : (
            <div style={{display:'grid', gap: 8}}>
              <div><b>{t('gdName')}:</b> {profile.name}</div>
              <div><b>{t('gdEmail')}:</b> {profile.email}</div>
              <div><b>{t('gdPhone')}:</b> {profile.phone || '-'}</div>
              <div><b>{t('gdAddress')}:</b> {profile.address || '-'}</div>
              <div><b>{t('gdLanguages')}:</b> {profile.languagesKnown || '-'}</div>
              <div><b>{t('gdCertificateId')}:</b> {profile.certificateId || '-'}</div>
              <div><b>{t('gdExperience')}:</b> {profile.experienceYears} {t('gdYears')}</div>
            </div>
          )}
        </section>

        <section ref={refEarnings} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdEarningsSummary')}</header>
          {!earnings ? (
            <div>{t('gdLoading')}</div>
          ) : (
            <ul className="list">
              <li className="list-item">{t('gdTotal')}: ₹ {earnings.total}</li>
              <li className="list-item">{t('gdThisMonth')}: ₹ {earnings.month}</li>
              <li className="list-item">{t('gdLastPayout')}: {earnings.lastPayout || '-'}</li>
            </ul>
          )}
        </section>

        <section ref={refFeedbacks} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdFeedbacks')}</header>
          <ul className="list">
            {feedbacks.map(f => (
              <li key={f.id} className="list-item">
                <b>{f.user}</b> – {Array.from({length: f.rating}).map((_, i) => '★').join('')}<br />
                <span style={{opacity:0.85}}>{f.comment}</span>
              </li>
            ))}
          </ul>
        </section>

        <section ref={refTransactions} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdTransactions')}</header>
          <ul className="list">
            {transactions.map(tx => (
              <li key={tx.id} className="list-item">
                <div><b>₹ {tx.amount}</b> • {tx.method} • {tx.ref}</div>
                <div style={{fontSize:12, opacity:0.7}}>{new Date(tx.date).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </section>

        <section ref={refMessages} className="card" style={cardStyle}>
          <header style={cardHeader}>
            {t('gdMessages')} {unread > 0 && <span className="badge" title={t('gdUnread')} style={{marginLeft:8}}>{unread}</span>}
          </header>
          <div style={{display:'grid', gap:8, maxHeight:260, overflow:'auto'}}>
            {loadingInbox && <div>{t('gdLoading')}</div>}
            {!loadingInbox && messages.length === 0 && <div>{t('gdNoMessages')}</div>}
            {!loadingInbox && messages.map(m => (
              <div key={m.id} className="list-item" style={{borderLeft:`4px solid ${m.isFromGuide? 'var(--primary)': 'var(--surface-4)'}`}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <b>{m.isFromGuide ? t('gdYou') : (m.senderName || t('gdVisitor'))}</b>
                  <span style={{fontSize:12, opacity:0.7}}>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.message}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center'}}>
            <button className="btn" type="button" onClick={markAllRead} disabled={!guideRow?.id || unread === 0}>{t('gdMarkAllRead')}</button>
          </div>
          <form onSubmit={reply} className="form" style={{marginTop:10}}>
            <input placeholder={t('gdReplyPlaceholder')} value={newMsg} onChange={(e)=>setNewMsg(e.target.value)} />
            <button className="btn btn-primary" type="submit" disabled={!guideRow?.id || !newMsg.trim()}>Send</button>
          </form>
        </section>

        <section ref={refAvailability} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdAvailability')}</header>
          <form className="form" onSubmit={saveAvailability}>
            <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={availability.available} onChange={(e)=>setAvailability(a=>({...a, available: e.target.checked}))} />
              {t('gdAvailableForHire')}
            </label>
            <label>
              <span>{t('gdNote')}</span>
              <input type="text" value={availability.note || ''} onChange={(e)=>setAvailability(a=>({...a, note: e.target.value}))} />
            </label>
            <button className="btn btn-primary" type="submit">{t('gdSave')}</button>
          </form>
        </section>

        <section ref={refBank} className="card" style={cardStyle}>
          <header style={cardHeader}>{t('gdBank')}</header>
          {!bank ? (
            <div>{t('gdLoading')}</div>
          ) : (
            <div style={{display:'grid', gap:8}}>
              <div><b>{t('gdAccountHolderName')}:</b> {bank.accountName || '-'}</div>
              <div><b>{t('gdAccountNumber')}:</b> {bank.accountNumber || '-'}</div>
              <div><b>{t('gdIFSC')}:</b> {bank.ifsc || '-'}</div>
              <div><b>{t('gdBankName')}:</b> {bank.bankName || '-'} {bank.branch ? `• ${bank.branch}` : ''}</div>
              <div style={{fontSize:12, opacity:0.7}}>{bank.updatedAt ? `${t('gdUpdated')}: ${new Date(bank.updatedAt).toLocaleString()}` : ''}</div>
              <button className="btn btn-primary" onClick={()=>setShowBankForm(s=>!s)}>{showBankForm ? 'Close' : t('gdAddEditBank')}</button>
              {showBankForm && (
                <form className="form" onSubmit={saveBank}>
                  <label>
                    <span>{t('gdAccountHolderName')}</span>
                    <input value={bankForm.accountName} onChange={(e)=>setBankForm(f=>({...f, accountName: e.target.value}))} required />
                  </label>
                  <label>
                    <span>{t('gdAccountNumber')}</span>
                    <input value={bankForm.accountNumber} onChange={(e)=>setBankForm(f=>({...f, accountNumber: e.target.value}))} required />
                  </label>
                  <label>
                    <span>{t('gdIFSC')}</span>
                    <input value={bankForm.ifsc} onChange={(e)=>setBankForm(f=>({...f, ifsc: e.target.value}))} required />
                  </label>
                  <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr'}}>
                    <label>
                      <span>{t('gdBankName')}</span>
                      <input value={bankForm.bankName} onChange={(e)=>setBankForm(f=>({...f, bankName: e.target.value}))} />
                    </label>
                    <label>
                      <span>{t('gdBranch')}</span>
                      <input value={bankForm.branch} onChange={(e)=>setBankForm(f=>({...f, branch: e.target.value}))} />
                    </label>
                  </div>
                  <button className="btn btn-primary" type="submit">{t('gdSaveBank')}</button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const cardStyle = {
  padding: 16,
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)'
}

const cardHeader = { fontWeight: 800, marginBottom: 8 }
