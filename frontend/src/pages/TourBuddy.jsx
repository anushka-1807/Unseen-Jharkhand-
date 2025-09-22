import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from '../lib/apiBase'

const cities = ['Ranchi', 'Jamshedpur', 'Deoghar', 'Hazaribagh', 'Netarhat', 'Dhanbad', 'Bokaro', 'Ghatshila', 'Simdega', 'Gumla']
const interestsList = ['Nature', 'Waterfalls', 'Culture', 'Food', 'Treks', 'Wildlife', 'Temples']
// Preferred languages removed from Tour Buddy form per request

export default function TourBuddy() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    city: 'Ranchi',
    startDate: '',
    endDate: '',
    groupSize: 2,
    budget: 'mid',
    interests: ['Nature'],
    languages: ['Hindi'],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null) // { city, days, estimate, plan[], guides[], stays[] }
  const [dayIdx, setDayIdx] = useState(0)

  const onToggle = (key, val) => {
    setForm(f => {
      const arr = new Set(f[key])
      if (arr.has(val)) arr.delete(val); else arr.add(val)
      return { ...f, [key]: Array.from(arr) }
    })
  }

  const getItinerary = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setPlan(null)
    try {
      const res = await fetch(new URL('/api/itinerary/suggest', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const d = await res.json().catch(()=>({ message: 'Failed to build itinerary' }))
        throw new Error(d.message || 'Failed to build itinerary')
      }
      const data = await res.json()
      setPlan(data)
      setDayIdx(0)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (e) {
      setError(e.message || 'Failed to build itinerary')
    } finally {
      setLoading(false)
    }
  }

  const Currency = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : n)

  useEffect(() => {
    // Reset to first day whenever a new plan loads
    setDayIdx(0)
  }, [plan?.city, plan?.days])

  // Open a saved itinerary if ?open=key is present
  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const key = sp.get('open')
    if (!key) return
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved && saved.plan && saved.days) {
        setPlan(saved)
        setDayIdx(0)
        // best-effort sync city into form
        if (saved.city) setForm(f => ({ ...f, city: saved.city }))
      }
    } catch {}
  }, [location.search])

  // Extra flavor lines that rotate by day to avoid repetition
  const daySnippets = [
    'Tip: Carry a reusable water bottle and respect local customs during visits.',
    'Pro move: Start early to beat the crowds and catch softer morning light.',
    'Don’t miss: Try a seasonal fruit or local snack near major spots.',
    'Photography tip: Golden hour adds magic to landscapes and temples alike.',
    'Local insight: Ask your host about any community events happening tonight.'
  ]
  const getDayFlavor = (idx, city) => {
    const base = daySnippets[idx % daySnippets.length]
    const cityAdds = {
      Ranchi: 'Nearby waterfalls can be slippery—wear good grip footwear.',
      Netarhat: 'Evenings can be breezy—carry a light jacket for viewpoints.',
      Jamshedpur: 'Plan an evening lakeside stroll for a calm end to your day.'
    }
    const extra = cityAdds[city] || 'Check opening hours for attractions to optimize your time.'
    return `${base} ${extra}`
  }

  const saveItinerary = () => {
    if (!plan) return
    try {
      const key = `itinerary:${plan.city}:${Date.now()}`
      localStorage.setItem(key, JSON.stringify(plan))
      alert('Itinerary saved! You can revisit it later on this device.')
    } catch (e) {
      alert('Unable to save itinerary locally.')
    }
  }

  const getFoodSuggestions = (city, interests=[]) => {
    const byCity = {
      Ranchi: [
        { name: 'Kaveri Restaurant', type: 'Veg • North Indian', mustTry: 'Thali, Litti-Chokha', lat: 23.36, lng: 85.33 },
        { name: 'Punjab Sweet House', type: 'Snacks & Sweets', mustTry: 'Samosa, Jalebi, Rasgulla', lat: 23.36, lng: 85.33 },
        { name: 'Angithi', type: 'Family Dining', mustTry: 'Paneer Tikka, Butter Chicken' },
      ],
      Jamshedpur: [
        { name: 'Novelty', type: 'Multi-cuisine', mustTry: 'Chinese Platters' },
        { name: 'Blue Diamond', type: 'Casual Dining', mustTry: 'Tandoori Platters' },
      ],
      Netarhat: [
        { name: 'Hill View Dhaba', type: 'Local Dhaba', mustTry: 'Aloo-Chokha, Dal-Bhaat', lat: 23.47, lng: 84.27 },
      ],
    }
    const interestAdds = {
      Food: [
        { name: 'Local Street Food Tour', type: 'Guided Walk', mustTry: 'Puchka, Chaat, Sweets' },
      ],
      Culture: [
        { name: 'Tribal Cuisine Tasting', type: 'Experience', mustTry: 'Mahua laddoo, Saag & Rice' },
      ]
    }
    const base = byCity[city] || []
    const extras = interests.flatMap(i => interestAdds[i] || [])
    const out = [...base, ...extras]
    // dedupe by name
    const seen = new Set()
    return out.filter(x => (seen.has(x.name) ? false : (seen.add(x.name), true)))
  }

  return (
    <main className="page container tour-buddy">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <h2 className="section-title" style={{marginBottom:0}}>Tour Buddy</h2>
        <button type="button" className="btn nav-link" onClick={()=>navigate('/saved')}>Saved Itineraries</button>
      </div>
      <p className="mb-12">Tell us about your trip and we will suggest a personalized day-by-day itinerary with recommended guides and stays.</p>

      <form className="form" onSubmit={getItinerary}>
        <div className="auth-row two">
          <label className="city-select">
            <span>City</span>
            <select
              value={form.city}
              onChange={e=>setForm(f=>({...f, city:e.target.value}))}
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span>Group size</span>
            <input type="number" min={1} value={form.groupSize} onChange={e=>setForm(f=>({...f, groupSize:Number(e.target.value)}))} />
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
        </div>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Building Itinerary...' : 'Suggest Itinerary'}</button>
        </div>
      </form>

      {error && <div className="alert alert-error mt-12" role="alert">{error}</div>}

      {/* Itinerary results */}
      {plan && (
        <section className="mt-24">
          <h3 className="section-title">Your Itinerary</h3>
          <div className="alert mb-12">Suggested plan for {plan.city} • {plan.days} {plan.days===1?'day':'days'} • Estimated guide cost: ₹{Currency(plan.estimate)}</div>
          {/* Single-day view with navigation */}
          {Array.isArray(plan.plan) && plan.plan.length > 0 && (
            <>
              {(() => { const p = plan.plan[dayIdx]; return (
                <div style={{maxWidth:'720px', margin:'0 auto'}}>
                  <article key={`day-${p.day}`} className="card">
                    <div className="card-body">
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                        <strong>Day {p.day} • {p.date}</strong>
                        <div style={{display:'flex', gap:8, alignItems:'center'}}>
                          <span className="badge" title="Day">Day {dayIdx+1} of {plan.plan.length}</span>
                          <button type="button" className="btn nav-link day-nav" onClick={()=>setDayIdx(i=>Math.max(0, i-1))} disabled={dayIdx<=0}>◀</button>
                          <button type="button" className="btn nav-link day-nav" onClick={()=>setDayIdx(i=>Math.min(plan.plan.length-1, i+1))} disabled={dayIdx>=plan.plan.length-1}>▶</button>
                        </div>
                      </div>
                      <div className="mt-6"><b>{p.title}</b></div>
                      <div style={{opacity:.95}}>{p.description}</div>
                      <div className="help-text mt-6">{getDayFlavor(dayIdx, plan.city)}</div>
                      <ul className="list mt-6">
                        <li className="list-item"><b>Morning:</b> {p.suggestions?.morning}</li>
                        <li className="list-item"><b>Afternoon:</b> {p.suggestions?.afternoon}</li>
                        <li className="list-item"><b>Evening:</b> {p.suggestions?.evening}</li>
                      </ul>
                      {(typeof p.lat === 'number' && typeof p.lng === 'number') && (
                        <div className="mt-8">
                          <a className="btn nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}>
                            View on Maps
                          </a>
                        </div>
                      )}
                      <div className="mt-12" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                        <button type="button" className="btn btn-primary" onClick={saveItinerary}>Save Itinerary</button>
                        <button type="button" className="btn nav-link" onClick={()=>navigate('/bookings')}>Go to Bookings</button>
                      </div>
                    </div>
                  </article>
                </div>
              )})()}
            </>
          )}

          <div className="mt-24">
            <h4 className="h3 mb-8">Suggested Stays</h4>
            <div className="home-grid">
              {(plan.stays||[]).map(h => (
                <article key={`h-${h.id}`} className="card">
                  <div className="card-body">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                      <div>
                        <strong style={{fontSize:'1.05rem'}}>{h.name}</strong>
                        <div style={{opacity:.9, fontSize:'.92rem'}}>{h.city || ''} {h.address ? `• ${h.address}` : ''}</div>
                      </div>
                      <span className="badge" title="Stay type">{(h.type||'hotel').toUpperCase()}</span>
                    </div>
                    <div style={{fontSize:'.95rem'}} className="mt-6">
                      {h.priceMin || h.priceMax ? `₹${Currency(h.priceMin)||''}${h.priceMin&&h.priceMax?'-':''}${Currency(h.priceMax)||''}` : 'Price on request'}
                      {typeof h.rating === 'number' && h.rating > 0 ? ` • ${h.rating.toFixed(1)}★` : ''}
                    </div>
                    {(h.lat!=null && h.lng!=null) && (
                      <div className="mt-8">
                        <a className="btn nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}>
                          View on Maps
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <h4 className="h3 mb-8">Recommended Food</h4>
            <div className="home-grid">
              {getFoodSuggestions(plan.city, form.interests).map((f, idx) => (
                <article key={`food-${idx}`} className="card">
                  <div className="card-body">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                      <div>
                        <strong style={{fontSize:'1.05rem'}}>{f.name}</strong>
                        <div style={{opacity:.9, fontSize:'.92rem'}}>{f.type}</div>
                      </div>
                    </div>
                    <div className="mt-6"><b>Must try:</b> {f.mustTry}</div>
                    {(f.lat!=null && f.lng!=null) && (
                      <div className="mt-8">
                        <a className="btn nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`}>
                          View on Maps
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
