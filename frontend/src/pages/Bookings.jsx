/*
  NOTE: The helpers that were previously declared here referenced state
  before the component was defined, causing a runtime error.
  They are now moved inside the Bookings component below.
*/
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE } from '../lib/apiBase'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'

const cities = ['Ranchi', 'Jamshedpur', 'Deoghar', 'Hazaribagh', 'Netarhat', 'Dhanbad', 'Bokaro', 'Ghatshila', 'Simdega', 'Gumla']
const interestsList = ['Nature', 'Waterfalls', 'Culture', 'Food', 'Treks', 'Wildlife', 'Temples']
const languageList = ['Hindi', 'English', 'Bengali', 'Ho', 'Mundari', 'Santhali']

// Suggestions now come from backend; no mock list needed

export default function Bookings() {
  const { t } = useI18n()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Ranchi',
    startDate: '',
    endDate: '',
    groupSize: 2,
    budget: 'mid',
    interests: ['Nature'],
    languages: ['Hindi'],
  })

  const [loading, setLoading] = useState(false)
  const [serverGuides, setServerGuides] = useState([])
  const [estimate, setEstimate] = useState(null)
  const [days, setDays] = useState(null)
  const [error, setError] = useState('')
  const [hotels, setHotels] = useState([])
  const [hotelsLoading, setHotelsLoading] = useState(false)
  const [hotelsError, setHotelsError] = useState('')
  const [guideSort, setGuideSort] = useState('rating_desc')
  const [hotelSort, setHotelSort] = useState('rating_desc')
  const [hotelType, setHotelType] = useState('all')
  const [hotelAmenityFilter, setHotelAmenityFilter] = useState('')
  const [filterLanguages, setFilterLanguages] = useState([])
  const [filterSpecialties, setFilterSpecialties] = useState([])
  const [drawer, setDrawer] = useState({ open: false, type: null, item: null })
  const [thread, setThread] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [viewMode, setViewMode] = useState('new') // 'new' | 'history'
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  // Load message thread and open drawer for a guide
  const openGuideDrawer = async (g) => {
    setDrawer({ open: true, type: 'guide', item: g })
    try {
      const url = new URL('http://localhost:5000/api/messages/thread')
      url.searchParams.set('guideId', g.id)
      const res = await fetch(url.toString())
      if (res.ok) setThread(await res.json())
      else setThread([])
    } catch {
      setThread([])
    }
  }

  // Send message to current guide
  const sendMessage = async () => {
    if (!drawer.item?.id || !msgText.trim()) return
    setSending(true)
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: drawer.item.id,
          senderName: form.name,
          senderEmail: form.email,
          message: msgText.trim(),
        })
      })
      if (!res.ok) throw new Error('Failed to send')
      const saved = await res.json()
      setThread(prev => [saved, ...prev])
      setMsgText('')
    } catch (e) {
      alert(e.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // (Itinerary feature moved to Tour Buddy page)

  // Close drawer on Escape
  useEffect(() => {
    if (!drawer.open) return
    const onKey = (e) => { if (e.key === 'Escape') setDrawer({ open: false, type: null, item: null }) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer.open])

  // Derived lists
  const viewGuides = (serverGuides || [])
    .filter(g => (filterLanguages.length === 0) || filterLanguages.every(l => String(g.languages||'').toLowerCase().includes(String(l).toLowerCase())))
    .filter(g => (filterSpecialties.length === 0) || filterSpecialties.every(s => String(g.specialties||'').toLowerCase().includes(String(s).toLowerCase())))
    .sort((a,b) => {
      if (guideSort === 'price_asc') return (a.pricePerDay||0) - (b.pricePerDay||0)
      if (guideSort === 'price_desc') return (b.pricePerDay||0) - (a.pricePerDay||0)
      return (b.rating||0) - (a.rating||0)
    })

  const viewHotels = (hotels || [])
    .filter(h => hotelType === 'all' || String(h.type||'hotel').toLowerCase() === hotelType)
    .filter(h => !hotelAmenityFilter || hotelAmenityFilter.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).every(a => String(h.amenities||'').toLowerCase().includes(a)))
    .sort((a,b) => {
      if (hotelSort === 'price_asc') return (a.priceMin||0) - (b.priceMin||0)
      if (hotelSort === 'price_desc') return (b.priceMin||0) - (a.priceMin||0)
      return (b.rating||0) - (a.rating||0)
    })

  const Currency = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : n)

  const Icon = ({ name, style }) => {
    const map = {
      star: '⭐',
      lang: '🗣️',
      spec: '🧭',
      wifi: '📶',
      restaurant: '🍽️',
      parking: '🅿️',
      ac: '❄️',
      breakfast: '🥐',
      pool: '🏊',
      'lake-view': '🌅'
    }
    return <span style={{marginRight:4, ...style}}>{map[name] || '•'}</span>
  }

  const ChipRow = ({ items = [], icon = null, max = 3, label = '' }) => {
    const arr = Array.isArray(items) ? items : String(items || '').split(',').map(s=>s.trim()).filter(Boolean)
    const shown = arr.slice(0, max)
    const more = arr.length - shown.length
    return (
      <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:6}} aria-label={label}>
        {shown.map((x,i)=> {
          let ic = null
          if (icon === 'lang') ic = <Icon name="lang"/>
          else if (icon === 'spec') ic = <Icon name="spec"/>
          else if (icon === 'amenity') ic = <Icon name={(x||'').toLowerCase()}/>
          return <span key={i} className="chip" style={{fontSize:'.85rem', opacity:.95}}>{ic}{x}</span>
        })}
        {more>0 && <span className="chip" style={{fontSize:'.85rem'}}>+{more} more</span>}
      </div>
    )
  }

  const SkeletonCard = () => (
    <article className="card" aria-busy="true" style={{opacity:.7}}>
      <div style={{height:160, background:'var(--surface-2)'}} />
      <div className="card-body">
        <div className="skeleton" style={{height:16, width:'60%', marginBottom:8}}/>
        <div className="skeleton" style={{height:12, width:'40%', marginBottom:6}}/>
        <div className="skeleton" style={{height:12, width:'80%'}}/>
      </div>
    </article>
  )

  const onToggle = (key, val) => {
    setForm(f => {
      const arr = new Set(f[key])
      if (arr.has(val)) arr.delete(val); else arr.add(val)
      return { ...f, [key]: Array.from(arr) }
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(new URL('/api/bookings', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const d = await res.json().catch(()=>({ message: 'Request failed' }))
        throw new Error(d.message || 'Request failed')
      }
      const d = await res.json()
      setServerGuides(d.guides || [])
      setEstimate(d.estimate ?? null)
      setDays(d.days ?? null)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async (emailOverride) => {
    setHistoryError('')
    setHistoryLoading(true)
    try {
      const email = (emailOverride != null ? String(emailOverride) : (form.email || '')).trim()
      if (!email) throw new Error('Please enter your email to view booking history')
      const url = new URL('/api/bookings', API_BASE)
      url.searchParams.set('email', email)
      url.searchParams.set('limit', '100')
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to load history')
      const rows = await res.json()
      setHistory(rows)
    } catch (e) {
      setHistory([])
      setHistoryError(e.message || 'Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const openStays = async () => {
    setHotelsError('')
    setHotelsLoading(true)
    try {
      const url = new URL('/api/hotels/list', API_BASE)
      if (form.city) url.searchParams.set('city', form.city)
      url.searchParams.set('limit', '50')
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to load stays')
      const rows = await res.json()
      setHotels(rows)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (e) {
      setHotelsError(e.message || 'Failed to load stays')
    } finally {
      setHotelsLoading(false)
    }
  }

  // Keep form email in sync with logged-in user
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setForm(f => (f.email === user.email ? f : { ...f, email: user.email }))
    }
  }, [isAuthenticated, user?.email])

  // Auto-load history when switching to history view for logged-in users
  useEffect(() => {
    if (viewMode === 'history' && isAuthenticated && user?.email) {
      loadHistory(user.email)
    }
  }, [viewMode, isAuthenticated, user?.email])

  // Read query params: view=history and optional email; auto-switch and load
  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const view = qs.get('view')
    const emailParam = qs.get('email')
    if (view === 'history') {
      setViewMode('history')
    }
    if (emailParam) {
      setForm(f => ({ ...f, email: emailParam }))
    }
    if (view === 'history' && (emailParam || form.email)) {
      // Use emailParam if present to avoid setState race
      loadHistory(emailParam || form.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <main className="page plan-bg">
      <div className="container">
        <h2 className="section-title">{t('planTitle')}</h2>
        <p style={{marginTop:0}}>{t('planIntro')}</p>
      <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', margin:'12px 0 16px'}}>
        <button type="button" className={`btn ${viewMode==='new' ? 'btn-primary' : 'nav-link'}`} onClick={()=>setViewMode('new')}>New Trip</button>
        <button type="button" className={`btn ${viewMode==='history' ? 'btn-primary' : 'nav-link'}`} onClick={()=>setViewMode('history')}>Booking History</button>
      </div>

      {viewMode === 'new' && (
      <form className="form" onSubmit={submit}>
        <div className="auth-row two">
          <label>
            <span>Name</span>
            <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required />
          </label>
        </div>
        <div className="auth-row two">
          <label>
            <span>Phone</span>
            <input value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
          </label>
          <label>
            <span>City</span>
            <select value={form.city} onChange={e=>setForm(f=>({...f, city:e.target.value}))}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="auth-row two">
          <label>
            <span>Start date</span>
            <input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f, startDate:e.target.value}))} required />
          </label>
          <label>
            <span>End date</span>
            <input type="date" value={form.endDate} onChange={e=>setForm(f=>({...f, endDate:e.target.value}))} required />
          </label>
        </div>
        <div className="auth-row two">
          <label>
            <span>Group size</span>
            <input type="number" min={1} value={form.groupSize} onChange={e=>setForm(f=>({...f, groupSize:Number(e.target.value)}))} />
          </label>
          <label>
            <span>Budget</span>
            <select value={form.budget} onChange={e=>setForm(f=>({...f, budget:e.target.value}))}>
              <option value="low">Low</option>
              <option value="mid">Mid</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div className="auth-row two">
          <fieldset style={{border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:10}}>
            <legend>Interests</legend>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {interestsList.map(i => (
                <label key={i} className="chip" style={{display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer'}}>
                  <input type="checkbox" checked={form.interests.includes(i)} onChange={()=>onToggle('interests', i)} /> {i}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:10}}>
            <legend>Preferred languages</legend>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {languageList.map(l => (
                <label key={l} className="chip" style={{display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer'}}>
                  <input type="checkbox" checked={form.languages.includes(l)} onChange={()=>onToggle('languages', l)} /> {l}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Finding...' : t('suggestGuidesBtn')}</button>
          <button className="btn nav-link" type="button" onClick={openStays}>{t('checkStaysBtn')}</button>
        </div>
      </form>
      )}

      {viewMode === 'new' && (
      <section className="suggested-guides" style={{marginTop: 24}}>
        <h3 className="section-title">{t('suggestedGuidesTitle')}</h3>
        {/* Toolbar: sorting and quick filters */}
        <div className="toolbar" role="toolbar" aria-label="Guide sorting and filters">
          <label>
            <span style={{opacity:.9}}>Sort</span>
            <select value={guideSort} onChange={e=>setGuideSort(e.target.value)}>
              <option value="rating_desc">Top rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </label>
          <label>
            <span style={{opacity:.9}}>Languages</span>
            <input
              placeholder="e.g. Hindi,English"
              value={filterLanguages.join(',')}
              onChange={e=> setFilterLanguages(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
            />
          </label>
          <label>
            <span style={{opacity:.9}}>Specialties</span>
            <input
              placeholder="e.g. Nature,Temples"
              value={filterSpecialties.join(',')}
              onChange={e=> setFilterSpecialties(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
            />
          </label>
          <button className="btn nav-link" type="button" onClick={()=>{ setFilterLanguages([]); setFilterSpecialties([]); }}>Reset Filters</button>
          <div style={{marginLeft:'auto', opacity:.85}}>{viewGuides.length} matches</div>
        </div>
        {error && <div className="alert alert-error" role="alert" style={{marginBottom:12}}>{error}</div>}
        {(estimate != null && days != null) && (
          <div className="alert alert-success" style={{marginBottom:12}}>
            Estimated trip cost for {days} {days===1? 'day' : 'days'} (guide rate x days x budget): ₹{estimate}
          </div>
        )}
        <div className="home-grid">
          {loading && Array.from({length:6}).map((_,i)=> <SkeletonCard key={`g-skel-${i}`} />)}
          {!loading && viewGuides.map(g => (
            <article key={g.id} className="card" onClick={()=>openGuideDrawer(g)} style={{cursor:'pointer'}}>
              <img
                src={g.photo || `/images/guide_${g.id}.jpg`}
                alt={g.name}
                onError={(e)=>{ e.currentTarget.src='/images/hl_guides.jpg' }}
              />
              <div className="card-body">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                  <div>
                    <strong style={{fontSize:'1.05rem'}}>{g.name}</strong>
                    <div style={{opacity:.9, fontSize:'.92rem'}}>{g.city} • ₹{Currency(g.pricePerDay)}/day</div>
                  </div>
                  <span className="badge" title="Rating" style={{fontWeight:600}}>{Number(g.rating).toFixed(1)}★</span>
                </div>
                <ChipRow items={g.specialties} icon="spec" label="Specialties" />
                <ChipRow items={g.languages} icon="lang" label="Languages" />
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <button className="btn btn-primary" type="button">Request Booking</button>
                  <a className="btn nav-link" href={`mailto:hello@jharkhand-tribal.example?subject=Guide%20Inquiry%20-%20${encodeURIComponent(g.name)}`}>
                    Contact
                  </a>
                  <a
                    className="btn btn-primary"
                    href={`/payments?type=guide&ref=${encodeURIComponent(g.email || '')}&name=${encodeURIComponent(g.name)}&amount=${encodeURIComponent(Math.max(1, Math.round((g.pricePerDay||1500) * (days || 1))))}&city=${encodeURIComponent(form.city||'')}&start=${encodeURIComponent(form.startDate||'')}&end=${encodeURIComponent(form.endDate||'')}`}
                    title="Pay & Book this guide"
                  >
                    Pay & Book
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        {viewGuides.length === 0 && (
          <div className="alert alert-error" style={{marginTop:12}}>No guides match your criteria. Try changing interests or city.</div>
        )}
      </section>
      )}

      {/* Itinerary feature moved to Tour Buddy page */}

      {viewMode === 'new' && (
      <section style={{marginTop: 24}}>
        <h3 className="section-title">{t('hotelsTitle')}</h3>
        
        {hotelsError && <div className="alert alert-error" role="alert" style={{marginBottom:12}}>{hotelsError}</div>}
        {hotelsLoading && <div className="alert" style={{marginBottom:12}}>{t('loadingStays')}</div>}
        <div className="list" role="list">
          {!hotelsLoading && viewHotels.map(h => (
            <div key={`hotel-${h.id}`} role="listitem" className="list-item" onClick={()=>setDrawer({open:true,type:'hotel',item:h})} style={{cursor:'pointer'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                <div>
                  <strong style={{fontSize:'1.05rem'}}>{h.name}</strong>
                  <div style={{opacity:.9, fontSize:'.92rem'}}>
                    {(h.city || '')}{h.address ? ` • ${h.address}` : ''}
                    {h.nearestAttraction ? ` • Near: ${h.nearestAttraction}` : ''}
                  </div>
                </div>
                <span className="badge" title="Stay type">{(h.type||'hotel').toUpperCase()}</span>
              </div>
              <div style={{fontSize:'.95rem', marginTop:6}}>
                {h.priceMin || h.priceMax ? `₹${Currency(h.priceMin)||''}${h.priceMin&&h.priceMax?'-':''}${Currency(h.priceMax)||''}` : 'Price on request'}
                {typeof h.rating === 'number' && h.rating > 0 ? ` • ${h.rating.toFixed(1)}★` : ''}
              </div>
              {h.amenities && <ChipRow items={h.amenities} icon="amenity" label="Amenities" />}
              <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                {h.lat!=null && h.lng!=null && (
                  <a className="btn nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}>
                    View on Maps
                  </a>
                )}
                <a
                  className="btn btn-primary"
                  href={`/payments?type=hotel&ref=${encodeURIComponent(h.name)}&name=${encodeURIComponent(h.name)}&amount=${encodeURIComponent(h.priceMin || h.priceMax || 1000)}&city=${encodeURIComponent(form.city||'')}&start=${encodeURIComponent(form.startDate||'')}&end=${encodeURIComponent(form.endDate||'')}`}
                  title="Pay & Book this stay"
                >
                  Pay & Book
                </a>
              </div>
            </div>
          ))}
        </div>
        {viewHotels.length === 0 && !hotelsLoading && (
          <div className="alert" style={{marginTop:12}}>Click "Check Hotels & Local Stays" to load stays for your selected city.</div>
        )}
      </section>

      )}

      {viewMode === 'history' && (
        <section className="history-section" style={{marginTop: 24}}>
          <h3 className="section-title">Your Booking History</h3>
          <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:12, justifyContent:'center', flexWrap:'wrap'}}>
            <label style={{display:'inline-flex', alignItems:'center', gap:6}}>
              <span>Email</span>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="you@example.com" />
            </label>
            <button className="btn btn-primary" type="button" onClick={loadHistory} disabled={historyLoading}>{historyLoading ? 'Loading...' : 'Load History'}</button>
          </div>
          {historyError && <div className="alert alert-error" role="alert" style={{marginBottom:12}}>{historyError}</div>}
          <div className="list" role="list">
            {history.map(b => (
              <div key={`bk-${b.id}`} role="listitem" className="list-item" style={{display:'grid', gap:6}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                  <div>
                    <strong>{b.name || 'Trip'}</strong>
                    <div style={{opacity:.9, fontSize:'.9rem'}}>#{b.id} • {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                  </div>
                  <span className="badge">{(b.city || 'Unknown City')}</span>
                </div>
                <div style={{display:'grid', gap:4, fontSize:'.95rem'}}>
                  <div><strong>Traveler:</strong> {b.name || '-'} ({b.email || '-'})</div>
                  <div><strong>Dates:</strong> {(b.startDate || '-')} → {(b.endDate || '-')} • <strong>Group:</strong> {b.groupSize || 1}</div>
                  <div><strong>Budget:</strong> {b.budget || '-'}</div>
                  {(b.interests || b.languages) && (
                    <div>
                      {b.interests ? <><strong>Interests:</strong> {b.interests} </> : null}
                      {b.languages ? <><strong>Languages:</strong> {b.languages}</> : null}
                    </div>
                  )}
                  {b.phone && (<div><strong>Phone:</strong> {b.phone}</div>)}
                </div>
              </div>
            ))}
          </div>
          {history.length === 0 && !historyLoading && !historyError && (
            <div className="alert" style={{marginTop:12}}>No bookings found yet.</div>
          )}
        </section>
      )}

      {/* Detail Drawer */}
      {drawer.open && (
        <div role="dialog" aria-modal="true" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'flex-end', zIndex:1000}} onClick={()=>setDrawer({open:false,type:null,item:null})}>
          <div className="card" style={{width:'min(520px, 92vw)', height:'100%', borderRadius:0}} onClick={e=>e.stopPropagation()}>
            {drawer.type === 'guide' && (
              <div className="card-body">
                <h3 className="section-title" style={{marginTop:0}}>{drawer.item.name}</h3>
                <div style={{opacity:.9}}>{drawer.item.city} • ₹{Currency(drawer.item.pricePerDay)}/day • {Number(drawer.item.rating).toFixed(1)}★</div>
                <ChipRow items={drawer.item.specialties} icon="spec" label="Specialties" max={6} />
                <ChipRow items={drawer.item.languages} icon="lang" label="Languages" max={6} />
                <div style={{display:'flex', gap:8, marginTop:14}}>
                  <button className="btn btn-primary" type="button" onClick={()=>alert('Request sent!')}>Request Booking</button>
                  <a className="btn nav-link" href={`mailto:hello@jharkhand-tribal.example?subject=Guide%20Inquiry%20-%20${encodeURIComponent(drawer.item.name)}`}>Contact</a>
                </div>
                <hr style={{margin:'16px 0', borderColor:'var(--surface-2)'}} />
                <h4 style={{margin:'0 0 8px'}}>Messages</h4>
                <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:240, overflowY:'auto', paddingRight:4}}>
                  {thread.length === 0 && <div style={{opacity:.8}}>No messages yet. Start the conversation below.</div>}
                  {thread.map(m => (
                    <div key={m.id} className="card" style={{padding:8}}>
                      <div style={{fontSize:'.85rem', opacity:.8}}>{m.senderName || 'You'} • {new Date(m.createdAt).toLocaleString()}</div>
                      <div style={{whiteSpace:'pre-wrap'}}>{m.message}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10, display:'grid', gap:8}}>
                  <textarea rows={3} placeholder="Write a message to this guide..." value={msgText} onChange={e=>setMsgText(e.target.value)} />
                  <button className="btn btn-primary" type="button" onClick={sendMessage} disabled={sending || !msgText.trim()}>{sending ? 'Sending...' : 'Send Message'}</button>
                </div>
              </div>
            )}
            {drawer.type === 'hotel' && (
              <div className="card-body">
                <h3 className="section-title" style={{marginTop:0}}>{drawer.item.name}</h3>
                <div style={{opacity:.9}}>{drawer.item.city || ''} {drawer.item.address ? `• ${drawer.item.address}` : ''}</div>
                <div style={{marginTop:6}}>
                  {drawer.item.priceMin || drawer.item.priceMax ? `₹${Currency(drawer.item.priceMin)||''}${drawer.item.priceMin&&drawer.item.priceMax?'-':''}${Currency(drawer.item.priceMax)||''}` : 'Price on request'}
                  {typeof drawer.item.rating === 'number' && drawer.item.rating > 0 ? ` • ${drawer.item.rating.toFixed(1)}★` : ''}
                </div>
                <ChipRow items={drawer.item.amenities} icon="amenity" label="Amenities" max={8} />
                <div style={{display:'flex', gap:8, marginTop:14}}>
                  {drawer.item.lat!=null && drawer.item.lng!=null && (
                    <a className="btn btn-primary" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${drawer.item.lat},${drawer.item.lng}`}>
                      Open in Maps
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
