import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Saved() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  const load = () => {
    const arr = []
    try {
      for (let i=0; i<localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('itinerary:')) {
          try {
            const value = JSON.parse(localStorage.getItem(key) || 'null')
            if (value && value.city && value.days) {
              arr.push({ key, city: value.city, days: value.days, when: new Date().toISOString() })
            }
          } catch {}
        }
      }
    } catch {}
    // Sort newest first by key suffix timestamp if present
    arr.sort((a,b) => {
      const at = Number(a.key.split(':')[2]) || 0
      const bt = Number(b.key.split(':')[2]) || 0
      return bt - at
    })
    setItems(arr)
  }

  useEffect(() => { load() }, [])

  const open = (key) => navigate(`/tour-buddy?open=${encodeURIComponent(key)}`)
  const del = (key) => { try { localStorage.removeItem(key) } catch {}; load() }
  const clearAll = () => { try { items.forEach(it => localStorage.removeItem(it.key)) } catch {}; load() }

  return (
    <main className="page container">
      <h2 className="section-title">Saved Itineraries</h2>
      {items.length === 0 ? (
        <div className="alert">No saved itineraries yet. Generate one in Tour Buddy and click "Save Itinerary".</div>
      ) : (
        <>
          <div style={{display:'flex', gap:8, marginBottom:12}}>
            <button className="btn nav-link" type="button" onClick={clearAll}>Clear All</button>
          </div>
          <ul className="list">
            {items.map(it => (
              <li key={it.key} className="list-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                <div>
                  <div><b>{it.city}</b> • {it.days} {it.days===1?'day':'days'}</div>
                  <div className="help-text" style={{opacity:.8, fontSize:12}}>{it.key}</div>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" onClick={()=>open(it.key)}>Open</button>
                  <button className="btn nav-link" onClick={()=>del(it.key)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
